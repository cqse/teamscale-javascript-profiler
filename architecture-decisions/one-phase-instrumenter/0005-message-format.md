# ADR 0005: One-Phase Instrumentation: Message and their format, between browser and collector. 

## Approach 1: Grouped by file

```
@/foo/bar/path.tsx
l10-13
f4,42-9,19
f5,61-7,11
b7,123-7,145
s18,5-19,67
```

The `@` prefix is used to indicate the start of coverage for a new file, followed by the file name.
Four coverage types are supported: line (`l`), function (`f`), branch (`b`), and statement (`s`).
The intervals are inclusive, that is, the `to` element is included---`l1-2` means coverage of the first and the second line. 

## Approach 2: File ids, per coverage

```
0=/foo/bar/path.tsx
1=/foo/wauz.ts
0;l10-13
0;f4,42-9,19
0;b7,123-7,145
1;s18,5-19,67
```

Compared to Approach 2, Approach 1 is less cryptic and easier to follow.

## Approach 3: Grouped by File and Coverage Type

```
@/foo/bar/path.tsx
l10-13;42-23
f4,42-9,19;5,61-7,11
b7,123-7,145;7,123-2,145
s18,5-19,67
```

A bit more compact, closer to the implementation.
However, Approach 1 is a bit cleaner and easier to understand.
Also, the savings in data to send are only small.

## Approach 4: One line per file

```
@/foo/bar/path.tsx;l10-13;f4,42-9,19;f5,61-7,11;b7,123-7,145;s18,5-19,67
``` 

Advantage: Easier to parse, compared to Approach 1.

## Decision

We use Approach 4 since it is easy to read (and understand) and parse.
