# ADR 0001: Instrument JavaScript Bundles (Pure JavaScript Code)

## Context

The pipeline used to build Web applications got quiet complex over the years. 
The JavaScript code that is executed in the Web browser is typically a bundle 
composed of the application code and its dependencies (libraries).
The (pure) JavaScript code itself is often transpiled from other programming 
languages, for example, TypeScript, or from JavaScript with language 
extensions such as JSX.

Tools like Babel and SWC make it easy for developers to add support for custom
language extensions and transpile the code back to pure JavaScript.

## Directions

The coverage instrumenter could either support instrumenting the code the
developer has written or the bundle that is deployed and sent to the Web browser.

## Decision

We instrument the final bundle only and use source maps for mapping back to
the origins of the code.

As a result, we have to implement support for pure JavaScript code only.
We can keep the implementation of the instrumenter lean and have not care
about language extensions or other programming languages the code could
have been transpiled from.

## Status

Accepted

## Consequences

We have to use source maps for deciding which lines in the final JavaScript
bundle to instrument or not. 
