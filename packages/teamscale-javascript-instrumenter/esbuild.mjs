import {build} from 'esbuild';
import inlineWorkerPlugin from 'esbuild-plugin-inline-worker';

const options = {
  entryPoints: ['src/vaccine/main.ts'],
  minify: true,
  bundle: true,
  outfile: 'dist/vaccine.js',
  tsconfig: 'tsconfig.vaccine.json',
  plugins: [inlineWorkerPlugin()]
}

build(options).catch(err => {
  process.stderr.write(err.stderr)
  process.exit(1)
})
