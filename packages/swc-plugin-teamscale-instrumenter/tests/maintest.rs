#![deny(unused)]

use std::{path::{PathBuf, Path}, sync::Arc, fs::File, io::Read};
use istanbul_oxide::SourceMap;
use swc_core::{
    ecma::parser::{EsConfig, Syntax},
    ecma::transforms::testing::{test_fixture, FixtureTestConfig},
};
use swc_plugin_teamscale_instrumenter::{
    transformer::coverage_statements::profiler_transformer,
    utils::source_origin::SourceOriginPattern,
};

fn read_sourcemap(file_name: &Path) -> Option<SourceMap> {
    let opened = File::open(file_name);
    if opened.is_ok() {
        let mut file = opened.expect("Expecting the file to be open");
        let mut data = String::new();
        file.read_to_string(&mut data).unwrap();
            
        return Some(serde_json::from_str(&mut data).expect("JSON was not well-formatted"))
    }
    None
}

#[testing::fixture("tests/fixtures/**/input.js")]
fn fixture(input: PathBuf) {
    let test_dir = input.parent().unwrap();

    test_fixture(
        Syntax::Es(EsConfig {
            jsx: true,
            ..Default::default()
        }),
        &|tester| {        
            let pattern = Arc::new(SourceOriginPattern::new(vec![],vec!["input.js".to_string()]));
            let input_source_map: Option<SourceMap> = read_sourcemap(&Path::new(test_dir).join("input.js.map"));
            profiler_transformer(tester.cm.clone(), pattern, input_source_map)
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
