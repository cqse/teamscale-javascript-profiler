use std::sync::Arc;
use swc_common::comments::NoopComments;
use swc_common::SourceMap;
use swc_coverage_instrument::InstrumentOptions;
use swc_common::{chain, pass::Optional, FileName};
use swc_ecmascript::visit::{noop_fold_type, Fold, as_folder};
use swc_ecma_ast::UpdateOp;
use swc_ecmascript::visit::{VisitMut, VisitMutWith};
use swc_core::{
    ast::Program,
    plugin::{
        plugin_transform,
        proxies::TransformPluginProgramMetadata,
    },
    visit::FoldWith,
};

#[derive(Debug)]
pub struct TransformVisitor;

impl VisitMut for TransformVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html

    fn visit_mut_update_op(&mut self, n: &mut UpdateOp) {
        // dbg!(self);
        n.visit_mut_children_with(self);  
    }
}

pub fn transformer() -> impl Fold + VisitMut {
    as_folder(TransformVisitor {})
}

#[plugin_transform]
pub fn process_transform(mut program: Program, data: TransformPluginProgramMetadata) -> Program {
    // See https://github.com/vercel/next.js/tree/canary/packages/next-swc/crates/styled_components as an example.

    let mut pass = transformer();    
    
    program.visit_mut_with(&mut pass);

    program
}