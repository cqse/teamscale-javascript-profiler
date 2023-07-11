# Teamscale JavaScript Profiler: Coverage Collector

The JavaScript Coverage Collector is part of a tool suite for obtaining
coverage information from JavaScript applications that are under test.
This tool suite is used in context of the Teamscale Software Intelligence Platform. 
The collected coverage information can be dumped to coverage 
files in the [Teamscale Simple Coverage Format](https://docs.teamscale.com/reference/upload-formats-and-samples/).

The Teamscale JavaScript Profiler consists of this Coverage Collector and the
[JavaScript Instrumenter](https://www.npmjs.com/package/@teamscale/javascript-instrumenter).
More details on using them (in combination) can be found 
in the [Teamscale Documentation](https://docs.teamscale.com/howto/recording-test-coverage-for-javascript/).

The JavaScript Coverage Collector starts a server process that listens for 
code coverage information from manually or automatically exercised (tested) 
JavaScript applications. The server also handles source maps to map coverage 
information back to the original source code.

## Building

The Collector is written in TypeScript/JavaScript. For building and running it,
NodeJs (>= v16) and pnpm are needed as prerequisites.

```
pnpm clean
pnpm install
pnpm build
```

## Running the Collector

There are several options to run the Collector. For example, via `yarn` by running

```
yarn collector --port 54678 --dump-to-file=./coverage.simple
```

or via `npx` by running

```
npx @teamscale/coverage-collector --port 54678 --dump-to-file=./coverage.simple
```

Note that NodeJs applications (as the Collector) can only access a limited
amount of RAM by default. Ensure to increase the 'max old space' as needed,
for example, by setting a corresponding environment variable.

```
export NODE_OPTIONS="$NODE_OPTIONS --max-old-space-size=8192"
```

