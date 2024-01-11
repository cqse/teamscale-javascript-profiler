# ADR 0004: One-Phase Instrumentation: Passing names of the original files to the collector.

## Approach 1: Send them with each coverage bundle.

Advantages:
- No separate message with information about file mapping.

Drawbacks: 
- Additional overhead with each coverage reporting, which is time-critical (but in a separate Web worker).

## Approach 2: Send only files not covered so far with each coverage bundle.

Advantages:
- Self-contained messages: Both information about the covered files and the 
  covered statements/lines/functions contained.

Drawbacks: 
- Additional data structures and logic needed for checking which files are already known to the collector.

## Approach 3: Send all before any coverage in the beginning, separately.

Drawbacks: 
- The list of all files and their identifies has to be collected somewhere; additional code to inject.
- There must be code to ensure that the file mapping is sent before the coverage; or code 
  at the collector the post-map coverage that has been received to the origins.

## Decision

We chose Approach 1 since it provides the best balance between 
code complexity, protocol complexity, and data volume to send. 