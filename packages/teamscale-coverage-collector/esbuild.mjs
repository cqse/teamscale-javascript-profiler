import {build} from 'esbuild';

const options = {
  platform: 'node',
  entryPoints: ['src/main.ts'],
  minify: process.env.NODE_ENV === 'production',
  bundle: true,
  outfile: 'dist/collector.js',
  tsconfig: 'tsconfig.json',
  plugins: []
}

build(options).catch(err => {
  process.stderr.write(err.stderr)
  process.exit(1)
})
