use std::sync::Arc;

use glob::Pattern;
use swc_common::{SourceMapper, Span};

pub struct SourceOriginPattern {
    include_origins: Vec<Pattern>,
    exclude_origins: Vec<Pattern>,
}

impl <'a> SourceOriginPattern<'a> {

    pub fn new(mapper: Arc<dyn SourceMapper + 'a>,
        include_origin_patterns: Vec<String>,
        exclude_origin_patterns: Vec<String>) -> Self {

        let include_origins = pattern_strings_to_patterns(&include_origin_patterns);
        let exclude_origins = pattern_strings_to_patterns(&exclude_origin_patterns);

        SourceOriginPattern { mapper, 
            include_origins, exclude_origins }
    }

}

fn pattern_strings_to_patterns(input: &Vec<String>) -> Vec<Pattern> {
    input.iter()
        .map(|s| normalize_pattern_str(s))
        .map(|s| Pattern::new(s.as_str()).expect("Expecting a valid input pattern"))
        .collect()
}

fn normalize_pattern_str(pattern_str: &String) -> String {
    pattern_str.to_string()
}

fn normalize_path(path: &String) -> String {
    path.to_string()
}

fn remove_trailing_working_dir(path: &String) -> String {
    path.to_string()
}

fn remove_prefix(prefix: &String, remove_from: &String) -> String {
    remove_from.to_string()
}

pub trait SourceMapMatcher {
    fn is_any_included(&self, origin_files: Vec<String>) -> bool;
}

fn matching(to_filter: Vec<String>, any_of_patterns: Vec<Pattern>) -> usize {
    let result: usize = 0;
    for element in to_filter {
        for pattern in any_of_patterns {
            if pattern.matches(element.as_str()) {
                result = result + 1;
            }
        }
    }
    return result;
}

impl SourceMapMatcher for SourceOriginPattern<'_> {

    fn is_any_included(&self, origin_files: Vec<String>) -> bool {
        if origin_files.is_empty() {
            return true;
        }

        let normalized_origin_files: Vec<String> = origin_files.iter()
            .map(|s| normalize_path(s))
            .collect();

        if !self.exclude_origins.is_empty() {
            let m = matching(normalized_origin_files, self.exclude_origins);
            if m == origin_files.len() {
                return false;
            }
        }

        if !self.include_origins.is_empty() {
            let m = matching(normalized_origin_files, self.include_origins);
            return m > 0;
        }

        true
    }

}

pub fn is_included<'a> (pattern: SourceOriginPattern, mapper: Arc<dyn SourceMapper + 'a>, span: &Span) -> bool {
    false
}

#[test]
fn test_include_pattern_without_extension() {
    SourceOriginPattern::new()
}