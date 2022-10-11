#![deny(unused)]

use std::{path::PathBuf, sync::Arc};
use swc_common::{SourceMap, FilePathMapping};
use swc_core::{
    ecma::parser::{EsConfig, Syntax},
    ecma::transforms::testing::{test_fixture, FixtureTestConfig},
};
use swc_plugin_teamscale_instrumenter::{transformer::coverage_statements::profiler_transformer, utils::source_origin::SourceOriginPattern};

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
            let mapper: Arc<SourceMap> = Arc::new(sm);
            let pattern = Arc::new(SourceOriginPattern { 
                mapper: mapper.clone(), include_origin_patterns: vec![], exclude_origin_patterns: vec![] } );
            profiler_transformer(mapper, pattern)
        },
        &input,
        &test_dir.join("output.js"),
        FixtureTestConfig {
            sourcemap: true,
            allow_error: false,
            ..Default::default()
        }  
    )
}