# JavaScript Coverage Collector (JASCO)

The JavaScript Coverage Collector is part of a tool suite for obtaining
coverage information from JavaScript applications that are under test.
This tool suite is used in context of the Teamscale Software Intelligence Platform: 
The collected coverage information can then either be dumped to 
coverage files (Teamscale Simple Coverage Format) or sent to a Teamscale instance.

The JavaScript Coverage Collector starts a server process that listens for 
code coverage information from manually or automatically exercised (tested) 
JavaScript applications. The server also handles source maps to map coverage 
information back to the original source code.

## Building

The Collector is written in TypeScript/JavaScript. For building and running it,
NodeJs (>= v14) and Yarn (>= v1.22) are needed as prerequisites.

```
yarn install
yarn build
```

## Running the Collector

There are several options to run the Collector. For example, via `yarn` by running

```
yarn serve --port 54678 --dump-to-file=./coverage.simple
```

or via `npx` by running

```
npx @teamscale/istanbul-collector --port 54678 --dump-to-file=./coverage.simple
```

## Publishing

The list of files to publish is defined by the `files` attribute in `package.json`.
The actual files packed by npm can be listed by running `npx npm-packlist`.

