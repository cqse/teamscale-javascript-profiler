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

## Documentation 

Please see our [HOWTO](https://docs.teamscale.com/howto/recording-test-coverage-for-javascript/) for details on using the profiler for your project.

## Download

- [Node Package of the Teamscale Coverage Collector](https://www.npmjs.com/package/@teamscale/coverage-collector)
- [Docker Image with the Teamscale Coverage Collector](https://hub.docker.com/r/cqse/teamscale-coverage-collector/tags/)
- [Node Package of the Teamscale JavaScript Instrumenter](https://www.npmjs.com/package/@teamscale/javascript-instrumenter)

## Contributing

We welcome any contributions to this project. Feel free to send us pull requests,
bug tickets, or feature requests.
