# Teamscale JavaScript Profiler: Instrumenter

The JavaScript Coverage-Forwarding Instrumenter is part of a tool suite for obtaining
coverage information from JavaScript applications that are under test.
This tool suite is used in context of the Teamscale Software Intelligence Platform.
The collected coverage information can be dumped to coverage files 
in the Teamscale Simple Coverage Format and sent to a Teamscale instance.

The Teamscale JavaScript Profiler consists of the [Coverage Collector](https://www.npmjs.com/package/@teamscale/coverage-collector) 
and this JavaScript Instrumenter.
More details on using them (in combination) can be found
in the [Teamscale Documentation](https://docs.teamscale.com/howto/recording-test-coverage-for-javascript/).

The Instrumenter instruments a given (set of) JavaScript file(s) such that (1) coverage 
information is produced and (2) forwarded to the Collector.

## Building

The Instrumenter is written in TypeScript/JavaScript. For building and running it,
NodeJs (>= v16) and pnpm are needed as prerequisites.

``` 
pnpm clean
pnpm install
pnpm build
```

## Workflow Integration

There are several options to run the Instrumenter. For example, via `yarn` by running

```
yarn instrumenter
```

or via `npx` by running

```
npx @teamscale/javascript-instrumenter
```

## Limitations

This tool inherits most of the limitations of IstanbulJs, including 
a considerable performance impact.

