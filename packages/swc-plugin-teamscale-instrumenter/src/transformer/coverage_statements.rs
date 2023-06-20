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
use crate::utils::performance::{end, ScopedPerformanceCounter, start};
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

fn extract_increment_member_expr_from_update(update_expr: &UpdateExpr) -> Option<&MemberExpr> {
    return if let UpdateOp::PlusPlus = update_expr.op {
        update_expr.arg.as_member()
    } else {
        None
    }
}

struct CoverageUpdateExpr<'a> {
    first_member_expr: &'a MemberExpr,
    second_member_expr: &'a MemberExpr,
    third_member_expr: Option<&'a MemberExpr>,
    cov_fn_name: String,
    inc_type: String
}

fn extract_coverage_inc(update_expr: &UpdateExpr) -> Option<CoverageUpdateExpr> {    
    let _perf = ScopedPerformanceCounter::new("extract_coverage_inc");

    let first_member_expr = extract_increment_member_expr_from_update(&update_expr)?;
    let second_member_expr = first_member_expr.obj.as_member()?;
    let third_member_expr = second_member_expr.obj.as_member();
    let last_member_expr = if third_member_expr.is_some() {
        third_member_expr.unwrap()
    } else {
        second_member_expr
    };

    let call_expr = last_member_expr.obj.as_call()?;
    let cov_fn_name = extract_called_cov_fn_name(call_expr)?;
    let id = last_member_expr.prop.as_ident()?;

    return Some(CoverageUpdateExpr {
        first_member_expr,
        second_member_expr,
        third_member_expr,
        cov_fn_name,
        inc_type: id.sym.to_string()
    })
}


fn extract_branch_coverage_inc(cov_update: &CoverageUpdateExpr) -> Option<BranchCovInc> {
    let _perf = ScopedPerformanceCounter::new("extract_branch_coverage_inc");

    if !cov_update.inc_type.eq_ignore_ascii_case("b") {
        return None;
    }

    let location_no = extract_member_expr_numliteral(cov_update.first_member_expr)?;
    let branch_no = extract_member_expr_numliteral(cov_update.second_member_expr)?;

    Some(BranchCovInc {
        cov_fn_name: cov_update.cov_fn_name.clone(),
        branch_no,
        location_no,
    })
}

fn extract_statement_coverage_inc(cov_update: &CoverageUpdateExpr) -> Option<StatementCovInc> {
    let _perf = ScopedPerformanceCounter::new("extract_statement_coverage_inc");

    if !cov_update.inc_type.eq_ignore_ascii_case("s") {
        return None;
    }

    let statement_no = extract_member_expr_numliteral(cov_update.first_member_expr)?;

    Some(StatementCovInc {
        cov_fn_name: cov_update.cov_fn_name.clone(),
        statement_no,
    })
}

fn extract_function_coverage_inc(cov_update: &CoverageUpdateExpr) -> Option<FunctionCovInc> {
    let _perf = ScopedPerformanceCounter::new("extract_function_coverage_inc");

    if !cov_update.inc_type.eq_ignore_ascii_case("f") {
        return None;
    }

    let function_no = extract_member_expr_numliteral(cov_update.first_member_expr)?;

    Some(FunctionCovInc {
        cov_fn_name: cov_update.cov_fn_name.clone(),
        function_no,
    })
}

fn extract_coverage_increment(expr: &Expr) -> CoverageIncrement {
    let _perf = ScopedPerformanceCounter::new("extract_coverage_increment");

    if let Some(update_expr) = expr.as_update() {
        if let Some(cov_update) = extract_coverage_inc(update_expr) {
            if let Some(branch_cov) = extract_branch_coverage_inc(&cov_update) {
                return CoverageIncrement::Branch(branch_cov)
            } else if let Some(fn_cov) = extract_function_coverage_inc(&cov_update) {
                return CoverageIncrement::Function(fn_cov)
            } else if let Some(stmt_cov) = extract_statement_coverage_inc(&cov_update) {
                return CoverageIncrement::Statement(stmt_cov)
            }
        }
    }

    CoverageIncrement::None()
}

fn new_statement_coverage_increment_call(inc: StatementCovInc) -> Expr {
    let _perf = ScopedPerformanceCounter::new("new_statement_coverage_increment_call");

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
    let _perf = ScopedPerformanceCounter::new("get_cov_obj_varname");

    let lookup_map = COV_FN_NAME_TO_NUMBER.lock().unwrap();
    let cov_obj_id = lookup_map
        .get(cov_fn_name)
        .expect(format!("Coverage function '{}' must be mapped to a fileid variable.", &cov_fn_name.as_str()).as_str());

    format!("_$fid{}", cov_obj_id)
}

fn new_branch_coverage_increment_call(inc: BranchCovInc) -> Expr {
    let _perf = ScopedPerformanceCounter::new("new_branch_coverage_increment_call");

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
    let _perf = ScopedPerformanceCounter::new("new_function_coverage_increment_call");

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
    let _perf = ScopedPerformanceCounter::new("new_fileid_decl");

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
    let _perf = ScopedPerformanceCounter::new("create_coverage_increment_replacement");

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
    is_current_stack_included: Vec<bool>,
    mapper: Arc<dyn SourceMapper + 'a>,
    input_source_map: Option<SM>,
    pattern: Arc<dyn SourceMapMatcher + 'a>,
}

impl TransformVisitor<'_> {

    fn is_included<'a>(&self, span: Span) -> bool {
        let _perf = ScopedPerformanceCounter::new("is_included");

        if span.is_dummy() {
            println!("Unmappable dummy span identified. This should not happen.");
            return true;
        }

        if let Some(sm) = &self.input_source_map {
            let span_lines = self.mapper.span_to_lines(span).unwrap();
            for line in span_lines.lines {
                for column in line.start_col.0..line.end_col.0 {
                    if let Some(token) = sm.lookup_token(line.line_index as u32, column as u32) {
                        if let Some(origin_file_name) = token.get_source() {
                            return self.pattern.is_any_included(vec![origin_file_name.to_string()]);
                        }
                    }
                }
            }
        }

        true
    }

    fn push_active_span_opt(&mut self, span: Option<Span>) -> Option<Span> {
        let _perf = ScopedPerformanceCounter::new("push_active_span_opt");

        return match span {
            Some(element) => {
                if element.is_dummy() {
                    None
                } else {
                    self.active_span_stack.push(element.clone());
                    Some(element)
                }
            }
            None => None
        };
    }

    fn push_active_span(&mut self, span: &Span) -> Option<Span> {
        let _perf = ScopedPerformanceCounter::new("push_active_span");
        
        if span.is_dummy() {
            None
        } else {
            self.active_span_stack.push(span.clone());
            if self.is_current_stack_included.len() == 0 {
                return None
            }
            let peeked = self.is_current_stack_included.get(self.is_current_stack_included.len()-1);
            if let Some(value) = peeked {
                if !value {
                    return None
                }
            }

            self.is_current_stack_included.push(self.is_included(span.clone()));
            return Some(span.clone());
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

    fn is_span_included(&self, span: &Span) -> bool {
        let _perf = ScopedPerformanceCounter::new("is_span_included");
    
        let included = self.is_current_stack_included.last();
        if let Some(value) = included {
            if !value {
                return false;
            }
        }

        return if span.is_dummy() {
            return true;
        } else {
            self.is_included(span.clone())
        }
    }
}

trait SpanMapper {
    fn extract_span(&self) -> Option<Span>;
}

impl SpanMapper for Decl {
    fn extract_span(&self) -> Option<Span> {
        let _perf = ScopedPerformanceCounter::new("Decl::extract_span");
        return match self {
            Decl::Class(decl) =>
                Some(decl.class.span.clone()),
            Decl::Fn(decl) =>
                Some(decl.function.span.clone()),
            Decl::Var(decl) => Some(decl.span),
            _ => None
        }
    }
}

impl SpanMapper for Stmt {
    fn extract_span(&self) -> Option<Span> {
        let _perf = ScopedPerformanceCounter::new("Stmt::extract_span");
        return match self {
            Stmt::Expr(stmt) => Some(stmt.span.clone()),
            Stmt::Block(stmt) => Some(stmt.span.clone()),
            _ => None
        }
    }
}

impl SpanMapper for Expr {
    fn extract_span(&self) -> Option<Span> {
        let _perf = ScopedPerformanceCounter::new("Expr::extract_span");
        return match self {
            Expr::Seq(expr) => Some(expr.span.clone()),
            Expr::Fn(expr) => Some(expr.function.span.clone()),
            Expr::Class(expr) => Some(expr.class.span.clone()),
            _ => None
        }
    }
}

impl VisitMut for TransformVisitor<'_> {

    fn visit_mut_decl(&mut self, decl: &mut Decl) {
        let active_span = self.push_active_span_opt(decl.extract_span());
        decl.visit_mut_children_with(self);
        self.pop_active_span(active_span);
    }

    fn visit_mut_script(&mut self, n: &mut Script) {
        let _perf = ScopedPerformanceCounter::new("visit_mut_script");

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
        let _perf = ScopedPerformanceCounter::new("visit_mut_block_stmt");

        let active_span = self.push_active_span(&n.span);
        n.visit_mut_children_with(self);
        self.pop_active_span(active_span);
    }

    fn visit_mut_module(&mut self, n: &mut Module) {
        let _perf = ScopedPerformanceCounter::new("visit_mut_module");

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
        let _perf = ScopedPerformanceCounter::new("visit_mut_stmt");

        let active_span = self.push_active_span_opt(n.extract_span());
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
        let _perf = ScopedPerformanceCounter::new("visit_mut_expr");

        let active_span = self.push_active_span_opt(n.extract_span());
        match n {
            Expr::Seq(seq_expr) => {
                let mut new_expressions = vec![];
                for expr in seq_expr.exprs.iter() {
                    match create_coverage_increment_replacement(expr) {
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
        self.pop_active_span(active_span);
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
            is_current_stack_included: Vec::new(),
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
        teamscale_transformer(mapper.clone(), js_sourcemap, pattern.clone())
    )
}
