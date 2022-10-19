# Bulding the Plugin as WASM

First compile the plugin into WebAssemply.

```
cargo build --target wasm32-wasi --release
cargo build --target wasm32-unknown-unknown --release 
```

Then, do some prepacking to put everything into the right place using.

```
npm run prepack
```

How, the package is ready for publishing and being used in the mono repo 
by the other packages.