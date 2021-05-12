import typescript from 'rollup-plugin-typescript2';
import workerLoader from 'rollup-plugin-web-worker-loader';

export default [{
  input: 'src/vaccine/main.ts',
  plugins: [
    workerLoader(),
    typescript({project: 'tsconfig.vaccine.json'})
  ],
  output: {
    file: 'dist/vaccine.js',
    format: 'cjs'
  }
}];

