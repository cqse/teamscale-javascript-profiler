use std::io::Cursor;
use std::sync::Arc;

use std::vec;

use sourcemap::SourceMap as SM;
use istanbul_oxide::SourceMap;
use swc_core::common::util::take::Take;
use swc_core::common::{chain, Span, DUMMY_SP, SourceMapper};
use swc_core::common::comments::NoopComments;
use swc_core::ecma::ast::{Pat, MemberProp, Lit, VarDeclKind, ModuleItem, MemberExpr, UpdateExpr, ExprOrSpread, Number, VarDecl, VarDeclarator, BindingIdent, Str, Script, BlockStmt, Module};

use swc_core::{
    ecma::ast::{CallExpr, Callee, Decl, Expr, Ident, Stmt, UpdateOp},
    ecma::visit::{as_folder, Fold, VisitMut, VisitMutWith},
};

use swc_coverage_instrument::InstrumentOptions;

use crate::transformer::file_id_consts::FileIdVisitor;
use crate::utils::source_origin::SourceMapMatcher;

use super::file_id_consts::{COV_FN_NAME_TO_HASH, COV_FN_NAME_TO_NUMBER};

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

fn extract_called_cov_fn_name(call_expr: &CallExpr) -> Option<String> {
    let expr = call_expr.callee.as_expr()?;
    let ident = expr.as_ref().as_ident()?;

    let cov_fn_name = ident.sym.to_string();
    let prefix: String = cov_fn_name[0..4].into();

    if prefix.eq_ignore_ascii_case("cov_") {
        return Some(cov_fn_name);
    }

    None
}

fn extract_member_expr_numliteral(member_expr: &MemberExpr) -> Option<i32> {
    let prop = member_expr.prop.as_computed()?;
    let literal = prop.expr.as_ref().as_lit()?;

    if let Lit::Num(num) = literal {
        return Some(num.value as i32);
    }

    None
}

fn extract_increment_member_expr(expr: &Expr) -> Option<&MemberExpr> {
    return extract_increment_member_expr_from_update(expr.as_update()?);
}

fn extract_increment_member_expr_from_update(update_expr: &UpdateExpr) -> Option<&MemberExpr> {
    return if let UpdateOp::PlusPlus = update_expr.op {
        update_expr.arg.as_member()
    } else {
        None
    }
}

fn extract_branch_coverage_inc(update_expr: &UpdateExpr) -> Option<BranchCovInc> {
    match update_expr.op {
        UpdateOp::PlusPlus => (),
        _ => return None,
    };

    let member_expr_location = extract_increment_member_expr_from_update(&update_expr)?;
    let member_expr_branch = member_expr_location.obj.as_member()?;
    let member_expr_call = member_expr_branch.obj.as_member()?;
    let id = member_expr_call.prop.as_ident()?;

    if !id.sym.to_string().eq_ignore_ascii_case("b") {
        return None;
    }

    let location_no = extract_member_expr_numliteral(member_expr_location)?;
    let member_expr_obj_member = member_expr_location.obj.as_member().expect("foo");
    let branch_no = extract_member_expr_numliteral(member_expr_obj_member)?;
    let call_expr = member_expr_call.obj.as_call()?;
    let cov_fn_name = extract_called_cov_fn_name(call_expr)?;

    Some(BranchCovInc {
        cov_fn_name,
        branch_no,
        location_no,
    })
}

fn extract_statement_coverage_inc(expr: &Expr) -> Option<StatementCovInc> {
    let member_expr = extract_increment_member_expr(&expr)?;
    let statement_no = extract_member_expr_numliteral(member_expr)?;
    let member_expr = member_expr.obj.as_member()?;

    if let Some(id) = member_expr.prop.as_ident() {
        if !id.sym.to_string().eq_ignore_ascii_case("s") {
            return None;
        }
    } else {
        return None;
    }

    let call_expr = member_expr.obj.as_call()?;
    let cov_fn_name = extract_called_cov_fn_name(call_expr)?;

    Some(StatementCovInc {
        cov_fn_name,
        statement_no,
    })
}

fn extract_function_coverage_inc(expr: &Expr) -> Option<FunctionCovInc> {
    let member_expr = extract_increment_member_expr(&expr)?;
    let function_no = extract_member_expr_numliteral(member_expr)?;
    let member_expr = member_expr.obj.as_member()?;

    if let Some(id) = member_expr.prop.as_ident() {
        if !id.sym.to_string().eq_ignore_ascii_case("f") {
            return None;
        }
    } else {
        return None;
    }

    let call_expr = member_expr.obj.as_call()?;
    let cov_fn_name = extract_called_cov_fn_name(call_expr)?;

    Some(FunctionCovInc {
        cov_fn_name,
        function_no,
    })
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
        .expect(format!("Coverage function '{}' must be mapped to a fileid variable.", &cov_fn_name.as_str()).as_str());

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

pub struct TransformVisitor<'a> {
    active_span_stack: Vec<Span>,
    mapper: Arc<dyn SourceMapper + 'a>,
    input_source_map: Option<SM>,
    pattern: Arc<dyn SourceMapMatcher + 'a>,
}

impl TransformVisitor<'_> {
    fn is_included<'a>(&self, span: Span) -> bool {
        if span.is_dummy() {
            return true;
        }

        if let Some(sm) = &self.input_source_map {
            let span_lines = self.mapper.span_to_lines(span).unwrap();
            for line in span_lines.lines {
                if let Some(token) = sm.lookup_token(line.line_index as u32, line.start_col.0 as u32) {
                    if let Some(origin_file_name) = token.get_source() {
                        return self.pattern.is_any_included(vec![origin_file_name.to_string()]);
                    }
                }
            }
        }

        true
    }

    fn push_active_stmt_span(&mut self, n: &mut Stmt) -> Option<Span> {
        match n.as_expr() {
            Some(expr_stmt) => {
                return self.push_active_span(&expr_stmt.span);
            }
            None => {}
        }

        None
    }

    fn push_active_span(&mut self, span: &Span) -> Option<Span> {
        if span.is_dummy() {
            None
        } else {
            self.active_span_stack.push(span.clone());
            Some(span.clone())
        }
    }

    fn pop_active_span(&mut self, span: Option<Span>) {
        match span {
            Some(_) => {
                self.active_span_stack.pop();        
            }
            None => {}
        }
    }

    fn active_span(&self) -> Option<Span> {
        if self.active_span_stack.is_empty() {
            return None;
        }

        match self.active_span_stack.get(self.active_span_stack.len() - 1) {
            Some(span) => Some(span.clone()),
            None => None,
        }
    }

    fn is_span_included(&self, span: &Span) -> bool {
        return if span.is_dummy() {
            let active = self.active_span();
            if active.is_some() {
                self.is_included(active.expect("Must be there").clone())
            } else {
                true
            }
        } else {
            self.is_included(span.clone())
        }
    }
}

impl VisitMut for TransformVisitor<'_> {
    fn visit_mut_span(&mut self, span: &mut Span) {
        let active_span = self.push_active_span(span);
        span.visit_mut_children_with(self);
        self.pop_active_span(active_span);
    }

    fn visit_mut_script(&mut self, n: &mut Script) {
        let active_span = self.push_active_span(&n.span);
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
        self.pop_active_span(active_span);
    }

    fn visit_mut_block_stmt(&mut self, n: &mut BlockStmt) {
        let active_span = self.push_active_span(&n.span);
        n.visit_mut_children_with(self);
        self.pop_active_span(active_span);
    }

    fn visit_mut_module(&mut self, n: &mut Module) {
        let active_span = self.push_active_span(&n.span);
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
        self.pop_active_span(active_span);
    }

    fn visit_mut_stmts(&mut self, stmts: &mut Vec<Stmt>) {
        stmts.visit_mut_children_with(self);
        stmts.retain(|s| !matches!(s, Stmt::Empty(..)));
    }

    fn visit_mut_module_items(&mut self, items: &mut Vec<ModuleItem>) {
        items.visit_mut_children_with(self);
        items.retain(|s| !matches!(s, ModuleItem::Stmt(Stmt::Empty(..))));
    }

    fn visit_mut_update_op(&mut self, n: &mut UpdateOp) {
        n.visit_mut_children_with(self);
    }

    fn visit_mut_stmt(&mut self, n: &mut Stmt) {
        let active_span = self.push_active_stmt_span(n);
        n.visit_mut_children_with(self);
        match n.as_mut_expr() {
            Some(expr_stmt) => match create_coverage_increment_replacement(&expr_stmt.expr) {
                Some(replacement) => {
                    if self.is_span_included(&expr_stmt.span) {
                        expr_stmt.expr = replacement;
                    } else {
                        n.take();
                    }
                }
                _ => {}
            },
            None => {}
        }
        self.pop_active_span(active_span);
    }

    fn visit_mut_expr(&mut self, n: &mut Expr) {
        match n {
            Expr::Seq(seq_expr) => {
                let mut new_expressions = vec![];
                for expr in seq_expr.exprs.iter() {
                    match create_coverage_increment_replacement(&expr) {
                        Some(replacement) => {
                            if self.is_span_included(&seq_expr.span) {
                                new_expressions.push(replacement);
                            }
                        }
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

pub fn teamscale_transformer(
    mapper: Arc<impl SourceMapper + 'static>,
    input_source_map: Option<SM>,
    origin_pattern: Arc<dyn SourceMapMatcher>,
) -> impl Fold + VisitMut {
    chain!(
        as_folder(FileIdVisitor {}),
        as_folder(TransformVisitor {
            active_span_stack: Vec::new(),
            mapper,
            input_source_map,
            pattern: origin_pattern.clone()
        })
    )
}

pub fn istanbul_transformer(mapper: Arc<impl SourceMapper>, input_source_map: Option<SourceMap>) -> impl Fold + VisitMut {
    let visitor = swc_coverage_instrument::create_coverage_instrumentation_visitor(
        mapper,
        NoopComments {},
        InstrumentOptions {
            coverage_variable: "__coverage__".to_string(),
            compact: false,
            report_logic: false,
            ignore_class_methods: Default::default(),
            input_source_map: input_source_map,
            instrument_log: Default::default(),
            debug_initial_coverage_comment: false,
        },
        String::from("Teamscale.js"),
    );

    as_folder(visitor)
}

pub fn profiler_transformer(
    mapper: Arc<impl SourceMapper + 'static>,
    pattern: Arc<dyn SourceMapMatcher>,
    input_source_map: Option<String>
) -> impl Fold + VisitMut {
    let js_sourcemap = if let Some(input) = &input_source_map {
        let mut cursor = Cursor::new(input.clone().into_bytes());
        Some(SM::from_reader(cursor).unwrap())
    } else {
        None
    };

    let oxide_sourcemap = if let Some(input) = &input_source_map {
        serde_json::from_str(input).ok() as Option<SourceMap>
    } else {
        None
    };

    chain!(
        istanbul_transformer(mapper.clone(), oxide_sourcemap),
        teamscale_transformer(mapper.clone(), js_sourcemap, pattern.clone()))
}
