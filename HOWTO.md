# Recording Test Coverage for JavaScript Applications

This document describes how test coverage information can be recorded for
a JavaScript application using the Teamscale JavaScript Profiler.

This approach is particularly suited for scenarios without tools to determine
and collect the coverage produced by users testing the UI manually, or for 
legacy systems that use a testing approach with no explicit means to 
collect coverage information.
Alternatives for this approach are discussed [later](#alternatives) in this document.

*ATTENTION*: The Teamscale JavaScript Profiler is still in the public
beta phase. Your development and testing environment might not yet be fully
supported by this approach. Please contact our support (support@teamscale.com) 
in case you encounter any issues.

The profiler consists of two major components: the instrumenter and the collector.
The instrumenter adds statements to the code that signal reaching a particular code line
when running it in the browser. The obtained coverage is aggregated in the Web browser and
sent to a collecting server (the collector) once a second. Besides the coverage information,
also the source maps of the code in the browser are sent to the collector.
The collector uses the source map to map the coverage information back to the original code
and builds a coverage report that can be handed over to Teamscale.
Teamscale uses the coverage information, for example, 
for [Test Gap analysis](https://docs.teamscale.com/reference/test-gap-analysis/).

# Prerequisites

To use the approach, a number of prerequisites have to be in place.

The instrumented code must be executed in a (possibly headless) Browser environment
that supports at least *ECMAScript 2015*. Furthermore, we require that
a *DOM* and *WebSockets* are available in that execution environment.
In other words, the approach supports Edge >= v79, Firefox >= v54, Chrome >= v51, and
Safari >= v10. Instrumented applications cannot be executed in NodeJS.

To run the components of the profiler, NodeJS in at least version 14 is needed.

# Preparing your Application

Before we can instrument the application for sending coverage information
to the coverage collector, the application has to be prepared:
(1) source maps are needed to map back to the original code,
(2) and the content security policy has to be adjusted to allow for
sending the coverage information to the collector.

## Source Maps

The code that is executed in the browser does often not correspond to the
code written by the developers. It can be the result of several
transformation steps, for example, compilation (transpilation) from other 
languages, source code minimization, or bundling. 

The presence of source map files in the code of the test subject ensures
that the tested code can be mapped back to the original.
Depending on your build pipeline, a different approach must be chosen
to add the source maps to the test subject's code bundle.

For example, when the tool [Vite](https://vitejs.dev/config/#build-sourcemap) 
is used to bundle the code, the addition of source map information can be enabled 
by setting `build: { sourcemap: true }` or `build: { sourcemap: 'inline' }`.
Similar options are provided by other tools, for example, in Rollup `output: { sourceMap: true }`,
or in the [Typescript](https://www.typescriptlang.org/tsconfig#inlineSourceMap) 
compiler `{ compilerOptions: { sourceMap: true, inlineSources: true } }`.

## Content Security Policy

To use this coverage collecting approach, the application's Cross-Origin Resource Sharing (CORS)
has to be adjusted. The instrumented application sends coverage information via
WebSockets to a collecting server. That is, communication via WebSockets must be allowed.
For example, if the collecting server is running on the same machine
as the browser, then communicating with localhost must be allowed
by adding `ws://localhost:*` for `connect-src`, `blob`, and `worker-src` to
the `Content-Security-Policy` header.

The following snippet shows the content security policy that has to be added
for allowing accessing the collector at host `<collectorHost>` on port `<port>`:

```
connect-src 'self' ws://<collectorHost>:<port>;
script-src 'self' blob: ws://<collectorHost>:<port>;
worker-src 'self' blob: ws://<collectorHost>:<port>;
```

# Coverage Collection

Before we describe how the code has to be instrumented to produce and send coverage 
information, we now describe how to set up the coverage collector.
The address of this collector is later instrumented into the code of the test subject.

## Installing and Running

The collector is available as a NodeJS package. The package is
available with the name `@teamscale/coverage-collector` in the NodeJS package manager.

### Running using NPX

The collector can be installed and started using the `npx` command. The following
command starts the collector on port `54678` and instructs it to dump
the received coverage to the file `./coverage.simple`:

```
npx @teamscale/coverage-collector --port 54678 --dump-to-file=./coverage.simple
```

### Running as Node Script

The package `@teamscale/coverage-collector` can be added as a development dependency 
to the `package.json` file. For example, by running `npm install -D @teamscale/coverage-collector`
(or `yarn add -D @teamscale/coverage-collector`). 

After installing the package it should be registered in the `package.json`
and be available locally for being executed.
Please check the [NPM package registry](https://www.npmjs.com/package/@teamscale/coverage-collector)
for the latest version of the package regularly.

Now we have to start the collector before testing is done, and have to stop it 
after this process has been finished. For this, we propose to use the `pm2` package---can
be installed using `npm install -D pm2` (or `yarn add -D pm2`).
The usage of pm2 is illustrated by following scripts in a `package.json` (assuming that `yarn` is used):

```
"scripts": {
  "collector": "coverage-collector",
  "pretest": "npx pm2 delete CC; npx pm2 start npm --name CC -- run collector",
  "test": "jest",
  "posttest": "npx pm2 delete CC"
},
```

Please see the [npmjs documentation](https://docs.npmjs.com/cli/v8/using-npm/scripts) for details
on the `pre` and `post` scripts used in above example. 

ATTENTION: These scripts do not include an instrumentation step, which is 
mandatory for producing coverage information. Such a step will be introduced
later in this document.

## Configuration

The collector has three parameters that are relevant for typical application scenarios.

### Collector Port

```
-p PORT, --port PORT  The port to receive coverage information on.
```

The port the collector is listening on for information from the JavaScript
applications under test is configured with the parameter `--port`. By default,
the collector will listen on port `54678`. Please make sure that this port 
is accessible (allowed by firewalls) by all clients conducting tests.

### Coverage File

```
-f DUMP_TO_FILE, --dump-to-file DUMP_TO_FILE  Target file
```

The collector dumps coverage information to a file in the Teamscale Simple
Coverage format. By default, this file is written after the collector terminates.
The target file can be configured with the parameter `--dump-to-file`. By
default, coverage information is written to the file `coverage.simple` in the
current working directory.

### Dump Interval

```
-s DUMP_AFTER_SECS, --dump-after-secs DUMP_AFTER_SECS
                        Dump the coverage information to the target file every N seconds.
```

The collector can be configured to dump coverage information regularly after 
a configured time interval has elapsed. The parameter `--dump-after-secs` allows to 
specify the number of seconds after the information is dumped. The default is
set to `120` seconds. To disable this feature you can set it to zero (`0`) seconds.

# Instrumentation

Before the coverage collector can receive any coverage information from a JavaScript
application, this application has to be prepared to send this coverage information.
Our JavaScript instrumenter package can be used to prepare (instrument) the JavaScript
application to test such that coverage information is produced and sent to the collector.

## Installing and Running

The instrumenter is available as a NodeJS package with the name `@teamscale/javascript-instrumenter`.

We recommend `npx` to execute the instrumenter. For example, the following command is used
to instrument the Angular ["Tour of Heroes"](https://angular.io/tutorial) app.
Assume that this app was built into the folder `test/casestudies/angular-hero-app/dist`:
```
npx @teamscale/javascript-instrumenter \
    test/casestudies/angular-hero-app/dist/ \
    --in-place \
    --include-origin src/app/**/*
```
This command instructs the instrumenter to instrument the code in the target
folder `test/casestudies/angular-hero-app/dist/`.
The instrumentation is done in-place (`--in-place`), that is, existing files are replaced
by their instrumented counterparts. 

## Configuration

The instrumenter can be configured by several parameters. We discuss some of them 
in the following sub-sections.

### Collector

```
-c COLLECTOR, --collector COLLECTOR
                       The collector (host:port) to send coverage information to.
```
The parameter `--collector` allows for specifying the collector to send the coverage 
information to. The hostname (or IP address) and the port must be provided, 
separated by a colon. Please note that the specified collector must be reachable 
from clients that run the instrumented app to be able to collect coverage.

### Instrumentation Includes and Excludes

```
-x EXCLUDE_ORIGIN, --exclude-origin EXCLUDE_ORIGIN
                       Glob pattern of files in the source origin to not produce coverage for.

-k INCLUDE_ORIGIN, --include-origin INCLUDE_ORIGIN
                       Glob pattern of files in the source origin to produce coverage for.
```

The instrumenter determines whether to instrument a particular code fragment or not
by using an include/exclude lists. These lists consist of file names found in the original (!)
source code files the given file to instrument was built from. That is, the source map
that is assumed to be present for files to instrument is used to check if an instrumentation
should be performed.

### Target Path

The instrumenter can either replace existing files by their instrumented counterparts,
or it can write the instrumented versions to separate target path.

```  
-i, --in-place        If set, the original files to instrument are replaced (!!) by their instrumented counterparts.
```

If set, the flag `--in-place` instructs the instrumenter to replace the un-instrumented
input files by their instrumented counterparts. Please be carefully when using this parameter: 
Make sure that important changes to your code were saved in a separate location
before performing the instrumentation. Typically, the in-pace instrumentation
is performed on a target directory of the build process.

```
-o TO, --to TO        Path (directory or file name) to write the instrumented version to.
```

In case the in-place instrumentation is not used and files are written to
a separate path, the parameter `--to` has to be used to specify the target path.

# Uploading Coverage for Inspection

When the code to be tested was instrumented and the collector is running, code coverage
will be produced and collected when running the code. By default, the collector
will write a coverage file in the Teamscale Simple Coverage format.

Whenever a testing process has been finished (for example, in the build pipeline),
the coverage must be provided to Teamscale for being used, for example,
for a Test Gap Analysis. This is can be done by using the [Teamscale Upload Tool](https://github.com/cqse/teamscale-upload)
or by using the REST API directly. More details can be found in the
[Teamscale documentation](https://docs.teamscale.com/howto/uploading-external-results/).

# Alternatives
<a name="alternatives" />

We describe one approach to record test coverage of JavaScript applications
here. However, depending on the development setup and testing approach,
there is a number of alternatives available, for example, [Cypress](https://www.cypress.io/) 
can dump coverage information from the V8 JavaScript engine. 
Another example is [NYC](https://github.com/istanbuljs/nyc), which can be used for 
collecting coverage of NodeJS applications.

