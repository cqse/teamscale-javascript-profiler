#![deny(unused)]

use std::{path::PathBuf};
use swc_ecma_transforms_testing::test_fixture;
use swc_ecmascript::{
    parser::{EsConfig, Syntax}
};

use teamscale_istanbul_postprocessor_swc_plugin::{transformer};

#[testing::fixture("tests/fixtures/**/input.js")]
fn fixture(input: PathBuf) {
    let test_dir = input.parent().unwrap();

    test_fixture(
        Syntax::Es(EsConfig {
            jsx: true,
            ..Default::default()
        }),
        &|_| {        
            transformer()
        },
        &input,
        &test_dir.join("output.js"),
    )
}