#![deny(unused)]

use std::{path::PathBuf, sync::Arc};
use swc_core::{
    ecma::parser::{EsConfig, Syntax},
    ecma::transforms::testing::{test_fixture, FixtureTestConfig},
};
use swc_plugin_teamscale_instrumenter::{
    transformer::coverage_statements::profiler_transformer,
    utils::source_origin::SourceOriginPattern,
};

#[testing::fixture("tests/fixtures/**/input.js")]
fn fixture(input: PathBuf) {
    let test_dir = input.parent().unwrap();

    test_fixture(
        Syntax::Es(EsConfig {
            jsx: true,
            ..Default::default()
        }),
        &|tester| {        
            let pattern = Arc::new(SourceOriginPattern {
                mapper: tester.cm.clone(),
                include_origin_patterns: vec![],
                exclude_origin_patterns: vec![],
            });
            profiler_transformer(tester.cm.clone(), pattern)
        },
        &input,
        &test_dir.join("output.js"),
        FixtureTestConfig {
            sourcemap: false,
            allow_error: false,
            ..Default::default()
        },
    )
}
