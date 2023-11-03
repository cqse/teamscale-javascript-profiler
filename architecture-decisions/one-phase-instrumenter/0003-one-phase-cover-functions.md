# ADR 0003: One-Phase Instrumentation: Separate coverage function for each file in the origin?

For each line/statement/branch/function we call a function indicating
that we achieved coverage. There are several requirements to satisfy:
- The time overhead added by the instrumentation shall be low.
- The memory overhead (load to the GC) added by the instrumentation shall be low.
- The bundle size should not grow too much.

## Approach 1:

```javascript
foo();
_$stmt(_$o23, 12, 0, 12, 59);
bar();
_$stmt(_$o23, 13, 0, 13, 40);
```

Advantages:

Drawbacks:

## Approach 2: Separate coverage functions for each file in the origin. 

The number of arguments is reduced, one variable lookup less.

```javascript
foo();
_$s23(12, 0, 12, 59);
bar();
_$s23(13, 0, 13, 40);
```

## Decision

One function for each coverage type is fine. Likely to have a shorter call stack.