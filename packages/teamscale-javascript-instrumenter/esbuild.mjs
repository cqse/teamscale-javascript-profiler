import {build} from 'esbuild';
import inlineWorkerPlugin from 'esbuild-plugin-inline-worker';

const options = {
  entryPoints: ['src/vaccine/main.ts'],
  minify: process.env.NODE_ENV === 'production',
  bundle: true,
  outfile: 'dist/vaccine.js',
  tsconfig: 'tsconfig.vaccine.json',
  plugins: [inlineWorkerPlugin()]
}

build(options).catch(err => {
  process.stderr.write(err.stderr)
  process.exit(1)
})
