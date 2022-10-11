use std::sync::Arc;

use swc_common::{SourceMapper, Span};

pub struct SourceOriginPattern<'a> {
    pub mapper: Arc<dyn SourceMapper + 'a>,
    pub include_origin_patterns: Vec<String>,
    pub exclude_origin_patterns: Vec<String>,
}

pub trait SourceMapMatcher {
    fn is_included(&self, span: Span) -> bool;
}

impl SourceMapMatcher for SourceOriginPattern<'_> {
    fn is_included(&self, span: Span) -> bool {
        println!("Span High {} Low {}", span.lo.0, span.hi.0);
        let lines = self.mapper.span_to_snippet(span);
        if lines.is_ok() {
            let filename = self.mapper.span_to_filename(span);
            println!("Filename: {}", filename);
            return true;
        }

        false
    }
}
