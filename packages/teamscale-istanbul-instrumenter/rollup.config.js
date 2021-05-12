import typescript from 'rollup-plugin-typescript2';
import workerLoader from 'rollup-plugin-web-worker-loader';

export default [{
  input: 'src/vaccine/main.ts',
  cache: false,
  plugins: [
    workerLoader({preserveSource: true}),
    typescript({tsconfig: 'tsconfig.vaccine.json', clean: true})
  ],
  output: {
    file: 'dist/vaccine.js',
    format: 'cjs'
  }
}];

