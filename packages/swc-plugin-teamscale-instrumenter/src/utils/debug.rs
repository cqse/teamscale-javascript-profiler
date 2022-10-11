use std::{sync::Arc, collections::HashMap};

use swc::{Compiler, IdentCollector, config::SourceMapsConfig,};
use swc_common::SourceMap;
use swc_core::{ecma::codegen::Node, ecma::visit::{VisitWith}};
use swc_ecma_quote::swc_ecma_ast::EsVersion;

/// Prints the given AST node to the console.
/// For debugging purposes.
///
pub fn print_node<T>(n: &T)
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