use std::{sync::Arc, collections::HashMap};

// use swc::{config::SourceMapsConfig, Compiler, IdentCollector};
use swc_core::{
    ecma::{codegen::Node, visit::VisitWith},
    ecma::{ast::EsVersion}, common::SourceMap,
};

// pub fn print_node<T>(n: &T)
// where
//     T: Node + VisitWith<IdentCollector>,
// {
//     let c = Compiler::new(Arc::new(SourceMap::default()));
//     let output = c.print(
//         n,
//         Option::None,
//         Option::None,
//         true,
//         EsVersion::Es2018,
//         SourceMapsConfig::default(),
//         &HashMap::default(),
//         Option::None,
//         false,
//         Option::None,
//         false,
//         false,
//     );
//     println!("AST PRINT OUTPUT {}", output.expect("Foo").code);
// }
