use std::path::PathBuf;

use swc_ecma_transforms_testing::{test, test_fixture};
use swc_ecma_visit::{as_folder};
use teamscale_istanbul_postprocessor_swc_plugin::TransformVisitor;

#[testing::fixture("tests/fixtures/test1/input.js")]
fn fixture_test1(input_path: PathBuf) {
    let fixture_path = input_path.parent().unwrap();
    let output_path = fixture_path.join("output.js");

    test_fixture(
        Default::default(),
        &|_t| as_folder(TransformVisitor),
        &input,
        &output_path,
    );
}