We use [Semantic Versioning](https://semver.org/).

# New Release

# 0.0.1-beta.34

- [fix] The full source code range (start to end column) was not mapped back to the original source.
- [fix] Branch coverage was not collected while being necessary in the presence of sequence expressions.

# 0.0.1-beta.30

- [fix] The logger was logging asynchronously making it hard to debug the progress.
- [fix] Too many files were instrumented in parallel causing memory and performance issues.

# 0.0.1-beta.29

- [fix] Branch counters were present even though they are currently not supported.

# 0.0.1-beta.24

- [feature] JavaScript bundles can now be instrumented partially if a source map is present.

# 0.0.1-beta.21

- [fix] Include/exclude pattern and the paths to match were not normalized

# 0.0.1-beta.20

- [feature] Automatic release now for NPM packages and Docker images 
