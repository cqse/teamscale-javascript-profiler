We use [Semantic Versioning](https://semver.org/).

# New Release

# 0.1.0-beta.8

# 0.1.0-beta.7

# 0.1.0-beta.6

- [feature] Inform the user if no coverage was received after one minute since startup.
- [fix] Do not dump statistics on the number of messages received all 30s.

# 0.1.0-beta.5

- [feature] Provide statistics on the number of messages received, every 30s.

# 0.1.0-beta.1

- [feature] New instrumentation architecture that (1) reduces the memory requirements during instrumentation
    and when running the instrumented application in the browser, (2) makes instrumentation
    significantly faster, (3) reduces the bundle sizes, and (4) does no longer depend on including
    the original source maps.

# 0.0.1-beta.60

- [security] Critical security issue in the Babel dependency (CVE-2023-45133). 

# 0.0.1-beta.49

- [feature] Coverage uploading via proxy is now supported.

# 0.0.1-beta.44

- [feature] Upload reports to Artifactory is now supported.
- [fix] Library `source-map` upgraded to address https://github.com/mozilla/source-map/issues/432

# 0.0.1-beta.43

- [feature] `--enable-control-port` flag to enable a Rest API to control the collector parameters.

# 0.0.1-beta.42

- [fix] Reset coverage after dump
- [feature] Coverage files are now timestamped.
- [deprecation] Deprecated `dump_to_file` in favor of `dump_to_folder`. If `dump_to_file` is still used, a folder will be created at the provided path and timestamped coverage files will be saved within it.
- [feature] `--keep--overage-files` flag to keep coverage file on disk after successful upload to Teamsacle.

# 0.0.1-beta.36

- [feature] Logger now uses a simplified and more readable logging format by default.
  To get an additional log file with the old JSON format add the command line argument `-j` or `--json-log`.

# 0.0.1-beta.34

- [feature] Support for deriving coverage that spans multiple lines and columns.

# 0.0.1-beta.30

- [fix] The logger was logging asynchronously making it hard to debug the progress.

# 0.0.1-beta.28

- [fix] The logger could not resolve a dependency ('../diagnostics')

# 0.0.1-beta.22

- [feature] Logging of the status text in case of an error when uploading to Teamscale added.  

# 0.0.1-beta.20

- [feature] Docker image of the Coverage Collector now available.
- [fix] The version of collector and instrumenter are kept in sync from now on.

# 0.0.1-beta.8

- [fix] Reduced the collectors dump interval from 2 minutes to 6 hours. 
