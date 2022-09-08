use std::sync::Arc;
use std::vec;

use swc_common::{chain};
use swc_common::comments::NoopComments;
use swc_common::{SourceMapper, DUMMY_SP};
use swc_core::{
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
    ecma::visit::{as_folder, Fold, VisitMut, VisitMutWith},
    ecma::ast::{Program, UpdateOp},
};

use swc_coverage_instrument::InstrumentOptions;
use swc_ecma_quote::swc_ecma_ast::{Stmt, CallExpr, Callee, ExprStmt, Expr, Ident};

#[derive(Debug)]
pub struct TransformVisitor;

fn new_branch_coverage_increment() -> Expr {    
    Expr::Call(CallExpr {
            span: DUMMY_SP,
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new("foo".into(), DUMMY_SP)))),
            args: vec![],
            type_args: Option::None
    })
}

impl VisitMut for TransformVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html

    fn visit_mut_update_op(&mut self, n: &mut UpdateOp) {
        n.visit_mut_children_with(self);
    }

    fn visit_mut_stmt(&mut self, n: &mut Stmt) {
        n.visit_mut_children_with(self);
        match n.as_mut_expr() {
            Some(expr_stmt) => {
                match expr_stmt.expr.as_update() {
                    Some(update_expr) => {                    
                        match update_expr.arg.as_member() {
                            Some(member_expr) => {
                                match member_expr.obj.as_member() {
                                    Some(member_expr) => {
                                        match member_expr.obj.as_call() {
                                            Some(call_expr) => {
                                                println!("Call Expression!");     
                                                expr_stmt.expr = Box::new(new_branch_coverage_increment())
                                            },
                                            None => ()
                                        }                                        
                                    },
                                    None => ()
                                }                                
                            },
                            None => ()
                        }
                    },
                    None => ()
                }
            },
            None => ()
        }
    }
}

pub fn teamscale_transformer() -> impl Fold + VisitMut {
    as_folder(TransformVisitor {})
}

pub fn transformer<S: SourceMapper>(mapper: Arc<S>) -> impl Fold + VisitMut {
    chain!(istanbul_transformer(mapper), teamscale_transformer())
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

#[plugin_transform]
pub fn process_transform(mut program: Program, data: TransformPluginProgramMetadata) -> Program {    
    // See https://github.com/vercel/next.js/tree/canary/packages/next-swc/crates/styled_components as an example.

    let mapper = mapper_arc(data.source_map);
    let mut pass = transformer(mapper);

    program.visit_mut_with(&mut pass);

    program
}
