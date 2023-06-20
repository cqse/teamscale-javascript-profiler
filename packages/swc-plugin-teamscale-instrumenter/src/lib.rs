#![allow(clippy::not_unsafe_ptr_arg_deref)]

extern crate core;

pub mod transformer;
pub mod utils;

// The target WebAssembly must be 32bit! (At most 4GB of RAM to use.)
// #[cfg(not(target_pointer_width = "32"))]
// compile_error!("compilation is only allowed for 32-bit targets");

use std::sync::Arc;
use serde::{Deserialize, Serialize};
use swc_common::{BytePos, SourceMapper, Span, SyntaxContext};
use swc_common::source_map::Pos;
use swc_core::{
    ecma::ast::Program,
    ecma::visit::VisitMutWith,
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};
use transformer::coverage_statements::profiler_transformer;
use utils::source_origin::SourceOriginPattern;
use crate::utils::performance::{end, report, ScopedPerformanceCounter, start};

// The plugin can be configured with the following
// configuration parameters.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct PluginOptions {
    pub include_origin_patterns: Vec<String>,
    pub exclude_origin_patterns: Vec<String>,
    pub input_source_map: Option<String>
}

/// The default values for the plugin options
impl Default for PluginOptions {
    fn default() -> Self {
        PluginOptions {
            include_origin_patterns: Default::default(),
            exclude_origin_patterns: Default::default(),
            input_source_map: Default::default(),
        }
    }
}

/// The entry function of the SWC plugin.
#[plugin_transform]
pub fn process_transform(
    mut program: Program,
    metadata: TransformPluginProgramMetadata,
) -> Program {
    {
        let _perf = ScopedPerformanceCounter::new("process_transform");

        // Retrieve the configuration options
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

        // The source origin patterns used to decide which fractions of the input
        // files or bundles to instrument.
        let pattern = Arc::new(SourceOriginPattern::new(
            plugin_options.include_origin_patterns,
            plugin_options.exclude_origin_patterns));

        // Provide the source mapper in an Arc
        let mapper = Arc::new(metadata.source_map);

        // Build the transformer passes to apply
        let mut pass = profiler_transformer(mapper, pattern, plugin_options.input_source_map);

        // Apply the transformation
        program.visit_mut_with(&mut pass);
    }

    report();

    // ... and return the transformed (since mutable) result
    program
}
