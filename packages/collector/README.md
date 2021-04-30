# JavaScript Coverage Collector

A server process that listens for information on code coverage of
manually or automatically exercised (tested) JavaScript applications.
Before any coverage information is provided to this collecting and
aggregating server, the source map has to be provided.

The information is dumped to a file in the Teamscale Simple Coverage format.

## Building

```
yarn install
yarn build
```

## Running the Server

```
yarn serve --port 54678 --dump-to-file=./coverage.simple
```