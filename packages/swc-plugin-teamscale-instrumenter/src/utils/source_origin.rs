use std::{path::MAIN_SEPARATOR};

use glob::Pattern;
use crate::utils::performance::ScopedPerformanceCounter;

/// The patterns used to decide if a code fragment of a bundle
/// is to be instrumented. We have includes and excludes.
pub struct SourceOriginPattern {
    // Include GLOB pattern (see the `glob` crate)
    include_origins: Vec<Pattern>,
    // Exclude GLOB pattern (see the `glob` crate)
    exclude_origins: Vec<Pattern>,
}

impl SourceOriginPattern {
    /// The constructor for the origin pattern.
    /// It transforms given pattern strings to pattern objects.
    pub fn new(include_origin_patterns: Vec<String>, exclude_origin_patterns: Vec<String>) -> Self {
        let include_origins = pattern_strings_to_patterns(&include_origin_patterns);
        let exclude_origins = pattern_strings_to_patterns(&exclude_origin_patterns);

        SourceOriginPattern {
            include_origins,
            exclude_origins,
        }
    }

    pub fn print_patterns(&self) {
        self.exclude_origins.iter().map(|pattern| println!("Excluding: {}", pattern)).count();
        self.include_origins.iter().map(|pattern| println!("Including: {}", pattern)).count();
    }
}

fn pattern_strings_to_patterns(input: &Vec<String>) -> Vec<Pattern> {
    input
        .iter()
        .map(|s| normalize_pattern_str(s))
        .map(|s| Pattern::new(s.as_str()).expect("Expecting a valid input pattern"))
        .collect()
}

fn normalize_pattern_str(pattern_str: &String) -> String {
    unquote(remove_trailing_working_dir(pattern_str).to_string())
}

fn unquote(s: String) -> String {
    let chars: Vec<char> = s.chars().collect();
    if chars.len() > 0 && (chars[0] == '\'' || chars[0] == '\"') && chars[0] == chars[chars.len() - 1] {
        return s[1..s.len()-1].to_string();
    }
    s
}

fn normalize_path(path: &String) -> String {
    remove_trailing_working_dir(path)
}

fn remove_trailing_working_dir(path: &String) -> String {
    let current_dir_prefix = format!(".{}", MAIN_SEPARATOR);
    let result = remove_prefix(current_dir_prefix.as_str(), path);
    let result = remove_prefix("webpack:///", &result);
    let result = remove_prefix("./", &result);
    result
}

fn remove_prefix(prefix: &str, remove_from: &String) -> String {
    match remove_from.strip_prefix(prefix) {
        Some(without_prefix) => without_prefix.to_string(),
        None => remove_from.to_string(),
    }
}

fn matching(to_filter: &Vec<String>, any_of_patterns: &Vec<Pattern>) -> usize {
    let _perf = ScopedPerformanceCounter::new("matching");

    let mut result: usize = usize::default();
    for element in to_filter {
        for pattern in any_of_patterns.iter() {
            if pattern.matches(element.as_str()) {
                result = result.checked_add(1).expect("Expecting no overflow");
            }
        }
    }
    return result;
}

/// A matcher determining if any of the given source file paths
/// is to be included by the rules implemented in the trait.
pub trait SourceMapMatcher {
    fn is_any_included(&self, origin_files: Vec<String>) -> bool;
}

impl SourceMapMatcher for SourceOriginPattern {
    /// A source file is supposed to be included if not explicitly excluded by
    /// a pattern of if explicitly included. The exclude pattern has priority.
    fn is_any_included(&self, origin_files: Vec<String>) -> bool {
        let _perf = ScopedPerformanceCounter::new("is_any_included");

        if origin_files.is_empty() {
            return true;
        }

        let normalized_origin_files: Vec<String> =
            origin_files.iter().map(|s| normalize_path(s)).collect();

        if !self.exclude_origins.is_empty() {
            let m = matching(&normalized_origin_files, &self.exclude_origins);
            if m == origin_files.len() {
                return false;
            }
        }

        if !self.include_origins.is_empty() {
            let m = matching(&normalized_origin_files, &self.include_origins);
            return m > 0;
        }

        true
    }
}

#[cfg(test)]
mod tests {
    use super::SourceOriginPattern;
    use super::SourceMapMatcher;

    #[test]
    fn test_include_pattern_without_extension() {
        let opattern = SourceOriginPattern::new(vec!["./src/app/**/*".into()], vec![]);
        assert!(opattern.is_any_included(vec![
            "./src/app/app.components.ts".into(),
            "./src/app/messages/messages.component.ts".into()
        ]));
    }

    #[test]
    fn test_include_pattern_single_webpack_file() {
        let opattern = SourceOriginPattern::new(vec!["./src/app/**/*.*".into()], vec![]);
        assert!(opattern.is_any_included(vec![
            "webpack:///./src/app/dashboard/dashboard.component.ts".into()
        ]));
    }

    #[test]
    fn test_include_pattern_with_wildcard_ext() {
        let opattern = SourceOriginPattern::new(vec!["src/app/**/*.*".into()], vec![]);
        assert!(opattern.is_any_included(vec![
            "./src/app/app.components.ts".into(),
            "./src/app/messages/messages.component.ts".into()
        ]));
        assert!(!opattern.is_any_included(vec![
            "node_modules/zone.js/fesm2015/zone.js".into(),
            "webpack:///./node_modules/@angular/core/fesm2015/core.mjs".into()
        ]));
    }

    #[test]
    fn test_include_pattern_with_extension() {
        let opattern = SourceOriginPattern::new(vec!["src/app/**/*.ts".into()], vec![]);
        assert!(opattern.is_any_included(vec![
            "src/app/app.components.ts".into(),
            "src/app/messages/messages.component.ts".into()
        ]));
    }

    #[test]
    fn include_pattern_with_extension_and_path_normalization() {
        let opattern = SourceOriginPattern::new(vec!["src/app/**/*.ts".into()], vec![]);
        assert!(opattern.is_any_included(vec![
            "./src/app/app.components.ts".into(),
            "./src/app/messages/messages.component.ts".into()
        ]));
    }

    #[test]
    fn exclude_pattern_with_extension_and_path_normalization() {
        let opattern = SourceOriginPattern::new(vec![], vec!["src/app/**/*.ts".into()]);
        assert!(opattern.is_any_included(vec![
            "./berg/app/app.components.ts".into(),
            "./src/app/messages/messages.component.ts".into()
        ]));
        assert!(opattern.is_any_included(vec!["./berg/app/app.components.ts".into()]));
        assert!(!opattern.is_any_included(vec!["./src/app/messages/messages.component.ts".into()]));        
    }

    #[test]
    fn exclude_and_include_pattern() {
        let opattern = SourceOriginPattern::new(
            vec!["src/bar/**/*.ts".into()],
            vec!["src/foo/**/*.ts".into()],
        );
        assert!(opattern.is_any_included(vec![
            "./src/foo/messages/messages.component.ts".into(),
            "./src/bar/messages/messages.component.ts".into()
        ]));
        assert!(!opattern.is_any_included(vec!["./src/foo/messages/messages.component.ts".into()]));
        assert!(opattern.is_any_included(vec!["./src/bar/messages/messages.component.ts".into()]));
        assert!(!opattern.is_any_included(vec![
            "./test/foo/unittest.test.ts".into(),
            "./test/bar/unittest.test.ts".into(),
            "./build/main.ts".into(),
            "main.ts".into()
        ]));
    }

    #[test]
    fn exclude_pattern_only() {
        let opattern = SourceOriginPattern::new(vec![], vec!["src/foo/messages/*.ts".into()]);
        assert!(opattern.is_any_included(vec![
            "./src/bar/app.components.ts".into(),
            "./src/foo/messages/messages.component.ts".into()
        ]));
        assert!(!opattern.is_any_included(vec!["./src/foo/messages/messages.component.ts".into()]));
        assert!(!opattern.is_any_included(vec!["src/foo/messages/messages.component.ts".into()]));
        assert!(!opattern.is_any_included(vec![
            "webpack:///src/foo/messages/messages.component.ts".into()
        ]));
        assert!(opattern.is_any_included(vec!["./src/bar/messages/messages.component.ts".into()]));
        assert!(opattern.is_any_included(vec![
            "./test/bar/unittest.test.ts".into(),
            "./build/main.ts".into(),
            "main.ts".into()
        ]));
    }

    #[test]
    fn exclude_and_include_pattern_on_file_extensions() {
        let opattern = SourceOriginPattern::new(
            vec!["**/*.java".into(), "**/*.md".into()],
            vec![
                "**/*.cc".into(),
                "**/*.cpp".into(),
                "**/*.h".into(),
                "**/*.hpp".into(),
            ],
        );
        assert!(
            opattern.is_any_included(vec!["./ServerConnector.java".into(), "./Server.h".into()])
        );
        assert!(opattern.is_any_included(vec![
            "./ServerConnector.java".into(),
            "./ServerVerifier.java".into(),
            "./ServerStarter.java".into()
        ]));
        assert!(!opattern.is_any_included(vec![
            "./ServerConnector.cpp".into(),
            "./ServerVerifier.cpp".into()
        ]));
    }

    #[test]
    fn exclude_and_include_pattern_precendence() {
        let opattern = SourceOriginPattern::new(
            vec!["**/ab/**".into(), "**/cd/**".into()],
            vec![
                "**/ef/**".into(),
                "**/gh/**".into(),
                "**/ij/**".into(),
                "**/kl/**".into(),
            ],
        );
        assert!(!opattern.is_any_included(vec!["./xy/ef/file1.ts".into(), "./kl/file2.ts".into()]));
        assert!(!opattern.is_any_included(vec![
            "./xy/ef/file1.ts".into(),
            "./kl/file2.ts".into(),
            "./xy/ij/ab/file3.ts".into()
        ]));
    }
}
