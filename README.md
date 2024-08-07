# Teamscale JavaScript Profiler

![Build](https://github.com/cqse/teamscale-javascript-profiler/actions/workflows/build-and-test.yml/badge.svg)

This is a mono repository that includes all components to instrument 
JavaScript applications in order to collect coverage information and the tools
for aggregating this information and sending it to [Teamscale](https://teamscale.com/product-overview).

**Public Beta.** The Teamscale JavaScript Profiler is still in the public beta phase. 
Your development and testing environment might not yet be fully supported by this approach. 
Please contact our support (support@teamscale.com) in case you encounter any issues.

## Motivation

Users want to do Test Gap analysis for their JavaScript/TypeScript code. 
This is easy for unit tests, where you can just use [IstanbulJS](https://istanbul.js.org/) 
or [C8](https://github.com/bcoe/c8) to get coverage. 
For automated UI tests there are existing solutions (for example, Puppeteer or Cypress) 
to produce coverage information directly from the headless browser or the testing tool. 
However, there are no tools to determine and collect the coverage produced by users testing the UI manually,
or for legacy systems that use a testing approach with no explicit means to collect coverage information.

## Architecture

The project consists of two major components: the instrumenter and the collector.
The instrumenter adds statements to the code that signal reaching a particular code line
when running it in the browser. The obtained coverage is aggregated in the Web browser and
sent to a collecting server (the collector) once a second. Besides the coverage information,
also the source maps of the code in the browser are sent to the collector.
The collector uses the source map to map the coverage information back to the original code
and builds a coverage report that can be handed over to Teamscale.
Teamscale uses the coverage information, for example, to conduct a Test Gap analysis.

## Documentation 

Please see our [HOWTO](https://docs.teamscale.com/howto/setting-up-profiler-tga/javascript/) for details on using the profiler for your project.

## Download

- [Node Package of the Teamscale Coverage Collector](https://www.npmjs.com/package/@teamscale/coverage-collector)
- [Docker Image with the Teamscale Coverage Collector](https://hub.docker.com/r/cqse/teamscale-coverage-collector/tags/)
- [Node Package of the Teamscale JavaScript Instrumenter](https://www.npmjs.com/package/@teamscale/javascript-instrumenter)

## Limitations

As any other software, the Teamscale JavaScript Profiler has known limitations:

1. *Runtime Performance*. The added statements for recording coverage can decrease
   the performance of the code considerably—by a factor of 2 to 10. 
   However, this is negligible for most application scenarios—for example, 
   if the application is idling most of the time and waiting for user inputs. 
   In many cases, it is possible to exclude parts of the application from being
   instrumented. See the [Teamscale Documentation](https://docs.teamscale.com/howto/setting-up-profiler-tga/javascript/#instrumented-app-is-slow). 
2. *Bundle Sizes.* The bundle sizes increase considerably by adding the
   coverage statements and the logic for collecting coverage and mapping back to the original code.
3. *Exposing Original File Paths.* The instrumented variants of the code include the
   relative paths of the files the code was transpiled from.
4. *Bi-Directional Channel.* The instrumented application sends coverage information via WebSockets. 
   This is a bidirectional data channel and therefore considered to be a security risk by some organizations.
5. *No Source Map.* The instrumented bundles are not shipped with valid source maps; debugging
   has to be performed based on the instrumented JavaScript code.

We have planed features to address all of above limitations. 
However, their prioritization depends on our users needs, so feel 
free to ask for addressing limitations or adding features via support@teamscale.com.   

## Releasing

Whenever there is a tested version that should be released, the following steps should be 
performed on the branch `master` in a single commit.

All tags are built automatically using [Github Actions](https://github.com/cqse/teamscale-jacoco-agent/actions) with the release binaries being uploaded to the GitHub Releases, NpmJs, and DockerHub.

Only use official releases in production.

### Approach 1: Manually

1. Increment the version of all packages in `./packages/` in their `package.json` file.
2. Update the changelog of the affected packages and move all changes from the section `Next Release` to a new version, e.g., `v0.0.1-beta.42`.
3. Commit the changes: `git commit -a -m "New release v0.0.1-beta.42"`
4. Create a git tag: `git tag "v0.0.1-beta.42" -m "New release version v0.0.1-beta.42"`
5. Push the changes and the tags: `git push --tags`

### Approach 2: Automated

Call `pnpm release` to perform all release steps automatically. 
Run `pnpm release --help` to see the list of available command line options, 
for example, `--minor` to create and release a new minor version.

### Versioning

We generally stick to Semantic Versioning. However, we might release new versions
of packages even if they do not contain any changes. 
We do this to identify packages of the JavaScript Profiler that are intended to
be used in combination and that are compatible to each other.

## Contributing

We welcome any contributions to this project. Feel free to send us pull requests,
bug tickets, or feature requests.
