# Teamscale JavaScript Profiler

This is a mono repository that includes all components to instrument 
JavaScript applications in order to collect coverage information and the tools
for aggregating this information and sending it to [Teamscale](https://www.cqse.eu/en/teamscale/).

## Motivation

Users want to do Test Gap analysis for their JavaScript/TypeScript code. 
This is easy for unit tests, where you can just use [IstanbulJS](https://istanbul.js.org/) to get coverage. 
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
Teamscale uses the coverage information, for example, to conduct a Test Gap analysis.`

## Requirements on Test Subjects

The instrumented code must be executed in a (possibly headless) Browser environment
that supports at least *ECMAScript 2015*. Furthermore, we require that
a *DOM* and *WebSockets* are available in that execution environment.
In other words, the approach supports Edge >= v79, Firefox >= v54, Chrome >= v51, and
Safari >= v10. Instrumented applications cannot be executed in NodeJS.

To use this coverage collecting approach, the applications' Cross-Origin Resource Sharing (CORS)
has to be adjusted. The instrumented application sends coverage information via
WebSockets to a collecting server. That is, communication via WebSockets must be allowed.
For example, if the collecting server is running on the same machine
as the (possibly headless) browser, then communicating with localhost must be allowed
by adding `ws://localhost:*` for `connect-src`, `blob`, and `worker-src` to
the `Content-Security-Policy` header.

## Contributing

We welcome any contributions to this project. Feel free to send us pull requests,
bug tickets, or feature requests.

## Publishing

The following steps have to be taken to publish the packages from this repository in `nodejs.org`.

1. Ensure that the version to release was built successfully, the code was reviewed
  by the responsible team, and that all tests and automatic quality checks pass.

2. Login with a user that has permissions to publish packages for the organizations
`@teamscale` and `@cqse` using:

```
npm login
```

Publish the chosen package using the following command:

```
npm publish
```

Please note that the published versions of the packages might not be available 
immediately if a registry other than npmjs is used to retrieve them.
This might be the case if your organization uses products 
like the Nexus Repository Manager.
