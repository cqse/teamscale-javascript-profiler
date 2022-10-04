use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::vec;

use lazy_static::lazy_static;

use serde::{Deserialize, Serialize};


use swc::config::SourceMapsConfig;
use swc::{Compiler, IdentCollector};

use swc_common::comments::NoopComments;
use swc_common::{chain, SourceMap};
use swc_common::{SourceMapper, DUMMY_SP};
use swc_core::ecma::ast::Pat;
use swc_core::ecma::codegen::Node;
use swc_core::{
    ecma::ast::{CallExpr, Callee, Decl, Expr, Ident, Program, Stmt, UpdateOp},
    ecma::visit::{as_folder, Fold, VisitMut, VisitMutWith, VisitWith},
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

use swc_coverage_instrument::InstrumentOptions;
use swc_ecma_quote::swc_ecma_ast::{
    BindingIdent, EsVersion, ExprOrSpread, FnDecl, Lit, MemberExpr, MemberProp,
    Module, ModuleItem, Number, Script, Str, UpdateExpr, VarDecl, VarDeclKind, VarDeclarator,
};

#[derive(Debug)]
pub struct FileIdVisitor { }

pub struct FunctionCovInc {
    cov_fn_name: String,
    function_no: i32,
}

pub struct BranchCovInc {
    cov_fn_name: String,
    branch_no: i32,
    location_no: i32,
}

pub struct StatementCovInc {
    cov_fn_name: String,
    statement_no: i32,
}

pub enum CoverageIncrement {
    Function(FunctionCovInc),
    Branch(BranchCovInc),
    Statement(StatementCovInc),
    None(),
}

lazy_static! {
    static ref COV_FN_NAME_TO_HASH: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());
    static ref COV_FN_NAME_TO_NUMBER: Mutex<HashMap<String, i32>> = Mutex::new(HashMap::new());
}

fn printNode<T>(n: &T)
where
    T: Node + VisitWith<IdentCollector>,
{
    let c = Compiler::new(Arc::new(SourceMap::default()));
    let output = c.print(
        n,
        Option::None,
        Option::None,
        true,
        EsVersion::Es2018,
        SourceMapsConfig::default(),
        &HashMap::default(),
        Option::None,
        false,
        Option::None,
        false,
        false,
    );

    println!("AST PRINT OUTPUT {}", output.expect("Foo").code);
}

fn extract_called_cov_fn_name(call_expr: &CallExpr) -> Option<String> {
    match &call_expr.callee {
        Callee::Expr(expr) => match expr.as_ref() {
            Expr::Ident(ident) => {
                let cov_fn_name = ident.sym.to_string();
                let prefix: String = cov_fn_name[0..4].into();
                if prefix.eq_ignore_ascii_case("cov_") {
                    return Some(cov_fn_name);
                }
            }
            _ => {}
        },
        _ => {
            println!("No callee");
        }
    }

    None
}

fn extract_member_expr_numliteral(member_expr: &MemberExpr) -> Option<i32> {
    match &member_expr.prop {
        MemberProp::Computed(prop) => match prop.expr.as_ref() {
            Expr::Lit(literal) => match literal {
                Lit::Num(num) => {
                    return Some(num.value as i32);
                }
                _ => {}
            },
            _ => {}
        },
        _ => {}
    }

    None
}

fn extract_increment_member_expr(expr: &Expr) -> Option<&MemberExpr> {
    match expr.as_update() {
        Some(update_expr) => extract_increment_member_expr_from_update(update_expr),
        _ => None,
    }
}

fn extract_increment_member_expr_from_update(update_expr: &UpdateExpr) -> Option<&MemberExpr> {
    match update_expr.op {
        UpdateOp::PlusPlus => match update_expr.arg.as_member() {
            Some(member_expr) => Some(member_expr),
            _ => None,
        },
        _ => None,
    }
}

fn extract_branch_coverage_inc(update_expr: &UpdateExpr) -> Option<BranchCovInc> {
    match extract_increment_member_expr_from_update(&update_expr) {
        Some(member_expr_location) => match extract_member_expr_numliteral(member_expr_location) {
            Some(location_no) => {
                match extract_member_expr_numliteral(
                    member_expr_location.obj.as_member().expect("foo"),
                ) {
                    Some(branch_no) => match member_expr_location.obj.as_member() {
                        Some(member_expr_branch) => match member_expr_branch.obj.as_member() {
                            Some(member_expr_call) => {
                                match member_expr_call.prop.as_ident() {
                                    Some(id) => {
                                        if !id.sym.to_string().eq_ignore_ascii_case("b") {
                                            return None;
                                        }
                                    }
                                    _ => {
                                        return None;
                                    }
                                }

                                match member_expr_call.obj.as_call() {
                                    Some(call_expr) => {
                                        match extract_called_cov_fn_name(call_expr) {
                                            Some(cov_fn_name) => {
                                                return Some(BranchCovInc {
                                                    cov_fn_name: cov_fn_name,
                                                    branch_no: branch_no,
                                                    location_no: location_no,
                                                });
                                            }
                                            None => None,
                                        }
                                    }
                                    None => None,
                                }
                            }
                            None => None,
                        },
                        None => None,
                    },
                    None => None,
                }
            }
            None => None,
        },
        None => None,
    }
}

fn extract_statement_coverage_inc(expr: &Expr) -> Option<StatementCovInc> {
    match extract_increment_member_expr(&expr) {
        Some(member_expr) => match extract_member_expr_numliteral(member_expr) {
            Some(statement_no) => match member_expr.obj.as_member() {
                Some(member_expr) => {
                    match member_expr.prop.as_ident() {
                        Some(id) => {
                            if !id.sym.to_string().eq_ignore_ascii_case("s") {
                                return None;
                            }
                        }
                        _ => {
                            return None;
                        }
                    }
                    match member_expr.obj.as_call() {
                        Some(call_expr) => match extract_called_cov_fn_name(call_expr) {
                            Some(cov_fn_name) => {
                                return Some(StatementCovInc {
                                    cov_fn_name: cov_fn_name,
                                    statement_no: statement_no,
                                });
                            }
                            None => None,
                        },
                        None => None,
                    }
                }
                None => None,
            },
            None => None,
        },
        None => None,
    }
}

fn extract_function_coverage_inc(expr: &Expr) -> Option<FunctionCovInc> {
    match extract_increment_member_expr(&expr) {
        Some(member_expr) => match extract_member_expr_numliteral(member_expr) {
            Some(function_no) => match member_expr.obj.as_member() {
                Some(member_expr) => {
                    match member_expr.prop.as_ident() {
                        Some(id) => {
                            if !id.sym.to_string().eq_ignore_ascii_case("f") {
                                return None;
                            }
                        }
                        _ => {
                            return None;
                        }
                    }
                    match member_expr.obj.as_call() {
                        Some(call_expr) => match extract_called_cov_fn_name(call_expr) {
                            Some(cov_fn_name) => {
                                return Some(FunctionCovInc {
                                    cov_fn_name: cov_fn_name,
                                    function_no: function_no,
                                });
                            }
                            None => None,
                        },
                        None => None,
                    }
                }
                None => None,
            },
            None => None,
        },
        None => None,
    }
}

fn extract_coverage_increment(expr: &Expr) -> CoverageIncrement {
    match &expr {
        Expr::Update(update_expr) => match extract_branch_coverage_inc(update_expr) {
            Some(branch_cov) => CoverageIncrement::Branch(branch_cov),
            None => match extract_statement_coverage_inc(expr) {
                Some(stmt_cov) => CoverageIncrement::Statement(stmt_cov),
                None => match extract_function_coverage_inc(expr) {
                    Some(fn_cov) => CoverageIncrement::Function(fn_cov),
                    None => CoverageIncrement::None(),
                },
            },
        },
        _ => CoverageIncrement::None(),
    }
}

fn extract_file_hash(n: &VarDeclarator) -> Option<String> {
    match &n.name {
        Pat::Assign(assign) => {
            match &assign.left.as_ref() {
                Pat::Ident(ident) => {
                    if !ident.sym.to_string().eq_ignore_ascii_case("hash") {
                        return Option::None;
                    }
                }
                _ => {}
            }

            match &assign.right.as_ref() {
                Expr::Lit(literal) => match &literal {
                    Lit::Str(string_literal) => {
                        return Option::Some(string_literal.value.to_string());
                    }
                    _ => {}
                },
                _ => {}
            }
        }
        _ => {}
    }

    Option::None
}

#[derive(Debug)]
pub struct CovFunctionSummary {
    cov_fn_name: String,
    cov_fn_id: String,
    file_hash: String,
}

fn extract_cov_fn_summary(fn_decl: &FnDecl) -> Option<CovFunctionSummary> {
    // function cov_oqh6rsgrd() {
    let cov_fn_name = fn_decl.ident.sym.to_string();
    if !cov_fn_name.starts_with("cov_") {
        return Option::None;
    }
    let cov_fn_id = &cov_fn_name[5..];

    return match &fn_decl.function.body {
        Some(block_stmt) => {
            if block_stmt.stmts.len() > 1 {
                let hash_assign_stmt = &block_stmt.stmts[1];
                match hash_assign_stmt {
                    Stmt::Decl(decl_stmt) => match decl_stmt {
                        Decl::Var(var_decl) => {
                            if var_decl.decls.len() != 1 {
                                return None;
                            }

                            let hash_decl = &var_decl.decls[0];

                            match extract_file_hash(hash_decl) {
                                Some(hash) => {
                                    return Some(CovFunctionSummary {
                                        cov_fn_id: String::from(cov_fn_id),
                                        cov_fn_name: cov_fn_name,
                                        file_hash: hash,
                                    });
                                }
                                None => return None,
                            }
                        }
                        _ => return None,
                    },
                    _ => return None,
                }
            }
            None
        }
        _ => return None,
    };
}

impl VisitMut for FileIdVisitor {
    fn visit_mut_decl(&mut self, n: &mut Decl) {
        match n {
            Decl::Fn(fn_decl) => match extract_cov_fn_summary(fn_decl) {
                Some(summary) => {
                    let mut map = COV_FN_NAME_TO_HASH.lock().unwrap();
                    let key = summary.cov_fn_name.clone();
                    map.insert(key, summary.file_hash);
                }
                None => {}
            },
            _ => {}
        }
    }
}

fn new_statement_coverage_increment_call(inc: StatementCovInc) -> Expr {
    let cov_obj_varname = get_cov_obj_varname(&inc.cov_fn_name);
    let args = vec![
        ExprOrSpread::from(Box::new(Expr::Ident(Ident::new(
            cov_obj_varname.into(),
            DUMMY_SP,
        )))),
        ExprOrSpread::from(Box::new(Expr::Lit(Lit::Num(Number::from(
            inc.statement_no as f64,
        ))))),
    ];
    Expr::Call(CallExpr {
        span: DUMMY_SP,
        callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
            "_$stmtCov".into(),
            DUMMY_SP,
        )))),
        args: args,
        type_args: Option::None,
    })
}

fn get_cov_obj_varname(cov_fn_name: &String) -> String {
    let lookup_map = COV_FN_NAME_TO_NUMBER.lock().unwrap();
    let cov_obj_id = lookup_map
        .get(cov_fn_name)
        .expect("Coverage function must be mapped to a fileid variable.");

    format!("_$fid{}", cov_obj_id)
}

fn new_branch_coverage_increment_call(inc: BranchCovInc) -> Expr {
    let cov_obj_varname = get_cov_obj_varname(&inc.cov_fn_name);
    let args = vec![
        ExprOrSpread::from(Box::new(Expr::Ident(Ident::new(
            cov_obj_varname.into(),
            DUMMY_SP,
        )))),
        ExprOrSpread::from(Box::new(Expr::Lit(Lit::Num(Number::from(
            inc.branch_no as f64,
        ))))),
        ExprOrSpread::from(Box::new(Expr::Lit(Lit::Num(Number::from(
            inc.location_no as f64,
        ))))),
    ];
    Expr::Call(CallExpr {
        span: DUMMY_SP,
        callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
            "_$brCov".into(),
            DUMMY_SP,
        )))),
        args: args,
        type_args: Option::None,
    })
}

fn new_function_coverage_increment_call(inc: FunctionCovInc) -> Expr {
    let cov_obj_varname = get_cov_obj_varname(&inc.cov_fn_name);
    let args = vec![
        ExprOrSpread::from(Box::new(Expr::Ident(Ident::new(
            cov_obj_varname.into(),
            DUMMY_SP,
        )))),
        ExprOrSpread::from(Box::new(Expr::Lit(Lit::Num(Number::from(
            inc.function_no as f64,
        ))))),
    ];
    Expr::Call(CallExpr {
        span: DUMMY_SP,
        callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
            "_$fnCov".into(),
            DUMMY_SP,
        )))),
        args: args,
        type_args: Option::None,
    })
}

fn new_fileid_decl(file_no: i32, cov_fn_hash: String) -> Box<VarDecl> {
    Box::new(VarDecl {
        span: DUMMY_SP,
        kind: VarDeclKind::Const,
        declare: false,
        decls: vec![VarDeclarator {
            span: DUMMY_SP,
            name: Pat::Ident(BindingIdent {
                id: Ident::new(format!("_$fid{}", file_no).into(), DUMMY_SP),
                type_ann: Option::None,
            }),
            init: Option::Some(Box::new(Expr::Lit(Lit::Str(Str {
                span: DUMMY_SP,
                value: cov_fn_hash.as_str().into(),
                raw: Option::None,
            })))),
            definite: false,
        }],
    })
}

fn create_coverage_increment_replacement(expr: &Expr) -> Option<Box<Expr>> {
    match extract_coverage_increment(expr) {
        CoverageIncrement::Function(fn_cov) => {
            Some(Box::new(new_function_coverage_increment_call(fn_cov)))
        }
        CoverageIncrement::Statement(stmt_cov) => {
            Some(Box::new(new_statement_coverage_increment_call(stmt_cov)))
        }
        CoverageIncrement::Branch(branch_cov) => {
            Some(Box::new(new_branch_coverage_increment_call(branch_cov)))
        }
        CoverageIncrement::None() => None,
    }
}

#[derive(Debug)]
pub struct TransformVisitor;

impl VisitMut for TransformVisitor {
    fn visit_mut_script(&mut self, n: &mut Script) {
        let mut i: i32 = 0;
        for (cov_fn_name, cov_fn_hash) in COV_FN_NAME_TO_HASH.lock().unwrap().iter() {
            let mut map = COV_FN_NAME_TO_NUMBER.lock().unwrap();
            map.insert(cov_fn_name.clone(), i);
            n.body.insert(
                0,
                Stmt::Decl(Decl::Var(new_fileid_decl(i, cov_fn_hash.clone()))),
            );

            i = i + 1;
        }
        n.visit_mut_children_with(self);
    }

    fn visit_mut_module(&mut self, n: &mut Module) {
        let mut i: i32 = 0;
        for (cov_fn_name, cov_fn_hash) in COV_FN_NAME_TO_HASH.lock().unwrap().iter() {
            let mut map = COV_FN_NAME_TO_NUMBER.lock().unwrap();
            map.insert(cov_fn_name.clone(), i);
            n.body.insert(
                0,
                ModuleItem::Stmt(Stmt::Decl(Decl::Var(new_fileid_decl(
                    i,
                    cov_fn_hash.clone(),
                )))),
            );

            i = i + 1;
        }

        n.visit_mut_children_with(self);
    }

    fn visit_mut_update_op(&mut self, n: &mut UpdateOp) {
        n.visit_mut_children_with(self);
    }

    fn visit_mut_stmt(&mut self, n: &mut Stmt) {
        n.visit_mut_children_with(self);
        match n.as_mut_expr() {
            Some(expr_stmt) => match create_coverage_increment_replacement(&expr_stmt.expr) {
                Some(expr) => {
                    expr_stmt.expr = expr;
                }
                _ => {}
            },
            None => {}
        }
    }

    fn visit_mut_expr(&mut self, n: &mut Expr) {
        match n {
            Expr::Seq(seq_expr) => {
                let mut new_expressions = vec![];
                for expr in seq_expr.exprs.iter() {
                    match create_coverage_increment_replacement(expr) {
                        Some(replacement) => new_expressions.push(replacement),
                        None => new_expressions.push(expr.clone()),
                    }
                }
                seq_expr.exprs = new_expressions;
            }
            _ => {}
        }
        n.visit_mut_children_with(self);
    }
}

pub fn teamscale_transformer<S: SourceMapper>(mapper: Arc<S>) -> impl Fold + VisitMut {
    chain!(
        as_folder(FileIdVisitor {}),
        as_folder(TransformVisitor {})
    )
}

pub fn transformer<S: SourceMapper>(mapper: Arc<S>) -> impl Fold + VisitMut {
    chain!(
        istanbul_transformer(mapper.clone()),
        teamscale_transformer(mapper.clone())
    )
}

pub fn istanbul_transformer<S: SourceMapper>(mapper: Arc<S>) -> impl Fold + VisitMut {
    let visitor = swc_coverage_instrument::create_coverage_instrumentation_visitor(
        mapper,
        NoopComments {},
        InstrumentOptions {
            coverage_variable: "__coverage__".to_string(),
            compact: false,
            report_logic: false,
            ignore_class_methods: Default::default(),
            input_source_map: Option::None,
            instrument_log: Default::default(),
            debug_initial_coverage_comment: false,
        },
        String::from("Hello.js"),
    );

    as_folder(visitor)
}

fn mapper_arc<S: SourceMapper>(mapper: S) -> Arc<S> {
    Arc::new(mapper)
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct PluginOptions {
    pub include_origin_patterns: Vec<String>,
    pub exclude_origin_patterns: Vec<String>,
}

impl Default for PluginOptions {
    fn default() -> Self {
        PluginOptions {
            include_origin_patterns: Default::default(),
            exclude_origin_patterns: Default::default(),
        }
    }
}

#[plugin_transform]
pub fn process_transform(
    mut program: Program,
    metadata: TransformPluginProgramMetadata,
) -> Program {
    // See https://github.com/vercel/next.js/tree/canary/packages/next-swc/crates/styled_components as an example.

    let plugin_config = metadata.get_transform_plugin_config();

    let plugin_options: PluginOptions = if let Some(plugin_config) = plugin_config {
        serde_json::from_str(&plugin_config).unwrap_or_else(|f| {
            println!("Could not deserialize instrumentation option");
            println!("{:#?}", f);
            Default::default()
        })
    } else {
        Default::default()
    };

    let mapper = mapper_arc(metadata.source_map);
    let mut pass = transformer(mapper);
    program.visit_mut_with(&mut pass);

    program
}
