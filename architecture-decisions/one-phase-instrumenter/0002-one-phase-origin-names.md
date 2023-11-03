# ADR 0002: One-Phase Instrumentation: Placement of origin file names

Where to keep the names of the covered source files?

## Approach 1: In the instrumented bundles

Approach: Keep the names of the original source files in the instrumented bundles
and send them to the collector.

Advantages: 
- Everything in one place; no additional process of dealing with 
  files and handing them over. Simpler tooling and process.

Drawbacks:
- Information about the original source code is sent to the client (security).
- Data volume increases slightly (so no real drawback).

## Approach 2: In the instrumented bundles but encrypted

Advantages:
- Fewer security concerns (see the previous approach)
- Maintains the advantages of the previous approach.

## Approach 3: Separate meta files

Approach: Export the meta information into separate files to
be used by the collector.

Advantages:
- Less information to be sent to the Web browser

Drawbacks: 
- Additional files have to be managed and passed to the collector.

## Decision

Keep the file names in the JS bundles. In the first step without 
any encryption; later, this information can be encrypted using
a key known both by the instrumenter and the collector.

The list of file names (map of identifiers to names) is sent 
to the collector along with the coverage.