#![allow(clippy::not_unsafe_ptr_arg_deref)]

pub mod transformer;
pub mod utils;

/**
 * The target WebAssembly must be 32bit!
 */
#[cfg(not(target_pointer_width = "32"))]
compile_error!("compilation is only allowed for 32-bit targets");

use std::sync::Arc;
use serde::{Deserialize, Serialize};
use swc_core::{
    ecma::ast::Program,
    ecma::visit::VisitMutWith,
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};
use transformer::coverage_statements::profiler_transformer;
use utils::source_origin::SourceOriginPattern;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct PluginOptions {
    pub include_origin_patterns: Vec<String>,
    pub exclude_origin_patterns: Vec<String>,
    pub input_source_map: Option<istanbul_oxide::SourceMap>
}

impl Default for PluginOptions {
    fn default() -> Self {
        PluginOptions {
            include_origin_patterns: Default::default(),
            exclude_origin_patterns: Default::default(),
            input_source_map: Default::default(),
        }
    }
}

#[plugin_transform]
pub fn process_transform(
    mut program: Program,
    metadata: TransformPluginProgramMetadata,
) -> Program {

    let plugin_config = metadata.get_transform_plugin_config();

    let plugin_options: PluginOptions = if let Some(plugin_config) = plugin_config {
        serde_json::from_str(&plugin_config).unwrap_or_else(|f| {
            println!("Could not deserialize instrumentation option");
            println!("{:#?}", f);
            Default::default()
        })
    } else {
        Default::default()
    };

    let mapper = Arc::new(metadata.source_map);

    let pattern = Arc::new(SourceOriginPattern::new(
        plugin_options.include_origin_patterns,
        plugin_options.exclude_origin_patterns));
    let mut pass = profiler_transformer(mapper, pattern, plugin_options.input_source_map);
    program.visit_mut_with(&mut pass);

    program
}
