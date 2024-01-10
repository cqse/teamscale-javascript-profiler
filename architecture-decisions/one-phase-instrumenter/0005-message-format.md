# ADR 0005: One-Phase Instrumentation: Message and their format, between browser and collector. 

## Approach 1: Grouped by file

```
@/foo/bar/path.tsx
10-13
18-19
```

The `@` prefix is used to indicate the start of coverage for a new file, followed by the file name.
The coverage is provided at line level, with a start and an end line, separated by `-`.
The intervals are inclusive, that is, the `to` element is included---`1-2` means coverage of the first and the second line. 

## Approach 2: File ids, per coverage

```
0=/foo/bar/path.tsx
1=/foo/wauz.ts
0;10-13
1;18-19
```

Compared to Approach 2, Approach 1 is less cryptic and easier to follow.

## Approach 3: One line per file

```
@/foo/bar/path.tsx;10-13;18-19
``` 

Advantage: Easier to parse, compared to Approach 1.

## Decision

We use Approach 3 since it is easy to read (and understand) and parse.
