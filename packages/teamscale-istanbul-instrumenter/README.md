# JavaScript Coverage Forwarder Instrumenter (JACFIN)

The JavaScript Coverage Forwarder Instrumenter is part of a tool suite for obtaining
coverage information from JavaScript applications that are under test.
This tool suite is used in context of the Teamscale Software Intelligence Platform:
The collected coverage information can then either be dumped to
coverage files (Teamscale Simple Coverage Format) or sent to a Teamscale instance.

Instrument a given (set of) JavaScript file(s) such that (1) coverage 
information is produced and (2) forwarded to our collecting server.

## Building

``` 
yarn install
yarn build
```

## Workflow Integration

### Instrumenting a Single File

Adds information for coverage tracking to a single file, either
in-place (by replacing the previous content), or by producing a new file.

An in-place transformation is only allowed if the given file is already
the result of an automatic transformation process, that is, if a source-map is available.

If the source-map is not provided as an explicit argument, either
the file must contain source-map information, or the source-map file
must be placed along with the source file in the same directory.

```
yarn run --inplace ./the/path/to/the/file.js
```

```
yarn run --inplace ./the/path/to/the/file.js --source-map ./the/path/to/the/source.map
```

```
yarn run ./the/path/to/the/file.js --to ./the/file/path/to/write/to.js
```

### Instrumenting all JavaScript Files in a Folder

We think that dealing with sets of files, in particular including or excluding
files that match particular file masks should be done by other tools.
In a UNIX environment, you should consider using `find` with corresponding
filters and an `-exec` argument to run the instrumenter.

### Integration with Testing Frameworks

This is planned work: Provide a Babel plugin that provides a code transformation
such that coverage information is collected and this information is forwarded.

## Limitations

This tool inherits most of the limitations of IstanbulJs, including 
a considerable performance impact.
