We use [Semantic Versioning](https://semver.org/).

# New Release

# 0.1.0-beta.8

- [fix] `--relative-collector` option was not applied correctly due to empty `location` field

# 0.1.0-beta.7

- [fix] `--relative-collector` option was not parsed correctly.

# 0.1.0-beta.6

- [feature] Add `--relative-collector` to support Kubernetes deployments of the collector.

# 0.1.0-beta.5

- [fix] Exclude patterns were not printed properly when providing the instrumentation summary.
- [fix] The instrumentation caused tab crashes when too many statements were executed in a time period.

# 0.1.0-beta.4

- [feature] The instrumenter provides statistics on the number of origin file names 
    that matched the include/exclude patterns.
- [fix] Path starting with `../` where not matched by `**`; removing this prefix now from the path to match.

# 0.1.0-beta.1

- [feature] New instrumentation architecture that (1) reduces the memory requirements during instrumentation
    and when running the instrumented application in the browser, (2) makes instrumentation
    significantly faster, (3) reduces the bundle sizes, and (4) does no longer depend on including
    the original source maps.

# 0.0.1-beta.60

- [security] Critical security issue in the Babel dependency (CVE-2023-45133).

# 0.0.1-beta.55

- [feature] Support for instrumenting GWT (Google Web Toolkit) bundles added.
- [fix] The instrumenter did traverse parts of the code needlessly, adding a performance burden. 

# 0.0.1-beta.53

- [fix] Path normalization under windows did not work as expected

# 0.0.1-beta.52

- [fix] The instrumented app did send some garbage information not adding value.
- [fix] `--exclude-bundle` failed to exclude file paths staring with `./`

# 0.0.1-beta.51

- [fix] The instrumenter created colliding identifiers in case no Ecmascript modules were used.

# 0.0.1-beta.50

- [feature] Unquote inputs in nested quotes.
- [feature] Log all input arguments in debug mode.

# 0.0.1-beta.49

- [fix] Coverage instrumentation led to tab crashes for complex applications.

# 0.0.1-beta.46

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
