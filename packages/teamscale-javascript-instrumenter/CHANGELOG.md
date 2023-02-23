We use [Semantic Versioning](https://semver.org/).

# New Release

- [fix] Removing quotes from all command line argument strings. This makes the instrumenter more robust.
- [feature] A new parameter `--exclude-bundle` allows for skipping the instrumentation of specified input files.

# 0.0.1-beta.44

- [fix] Library `source-map` upgraded to address https://github.com/mozilla/source-map/issues/432

# 0.0.1-beta.42

- [fix] Tab crash due to object creation frequency of instrumented code (and too slow garbage collection). 

# 0.0.1-beta.41

- [fix] Partial instrumentation did consider the wrong source map for identifying code origins.

# 0.0.1-beta.40

- [fix] Partial instrumentation of bundles did no longer work.

# 0.0.1-beta.39

- [fix] The coverage interceptor was initialized too often leading to tab crashes.

# 0.0.1-beta.38 

- [fix] The worker thread that aggregated the coverage in the browser ran out of memory for some apps.

# 0.0.1-beta.37

- [fix] The instrumentation added too much overhead to the code executed. Moved parts to a background process.

# 0.0.1-beta.36

- [feature] Allow for specifying a full URL where the collector process is reachable. For example, `wss://test.local:8043/`. 

# 0.0.1-beta.35

- [feature] Multiple include/exclude patterns can be specified. Separated by a blank.

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
