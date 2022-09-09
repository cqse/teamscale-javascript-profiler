#![deny(unused)]

use std::{path::PathBuf, sync::Arc};
use swc_common::{SourceMap, FilePathMapping, FileName};
use swc_core::{
    ecma::parser::{EsConfig, Syntax},
    ecma::transforms::testing::test_fixture,
};
use swc_plugin_teamscale_instrumenter::transformer;

#[testing::fixture("tests/fixtures/**/input.js")]
fn fixture(input: PathBuf) {
    let test_dir = input.parent().unwrap();

    test_fixture(
        Syntax::Es(EsConfig {
            jsx: true,
            ..Default::default()
        }),
        &|_| {        
            let sm = SourceMap::new(FilePathMapping::empty());
            sm.new_source_file(FileName::Custom("Hello.js".to_string()), 
            "foo".to_string());    
            let a = Arc::new(sm);
            transformer(a)
        },
        &input,
        &test_dir.join("output.js"),
    )
}