# ADR 0003: One-Phase Instrumentation: Separate coverage function for each file in the origin?

For each line/statement/branch/function we call a function indicating
that we achieved coverage. There are several requirements to satisfy:
- The time overhead added by the instrumentation shall be low.
- The memory overhead (load to the GC) added by the instrumentation shall be low.
- The bundle size should not grow too much.

## Approach 1: One function per coverage type, covered origin file as argument

```javascript
foo();
_$stmt(_$o23, 12, 12);
bar();
_$stmt(_$o23, 13, 14);
```

Advantages:
- Better to understand, less explanation needed.
Drawbacks:
- Coverage statements are a bit longer, bundle size increases.

## Approach 2: Separate coverage functions for each file in the origin 

The number of arguments is reduced, one variable lookup less.

```javascript
foo();
_$s23(12, 12);
bar();
_$s23(13, 14);
```

Advantages: 
- Compact coverage statements, smaller bundle sizes.

Drawbacks:
- A separate function for each file origin has to be introduced.
- No performance benefits expected.

## Decision

One function for each coverage type is fine. We might re-consider this choice
of bundle sizes become a problem (again).