import typescript from '@rollup/plugin-typescript';
import workerLoader from 'rollup-plugin-web-worker-loader';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
	{
		input: 'src/vaccine/main.ts',
		cache: false,
		plugins: [
			commonjs(),
			nodeResolve(),
			workerLoader({ preserveSource: true }),
			typescript({ tsconfig: 'tsconfig.vaccine.json' })
		],
		output: {
			file: 'dist/vaccine.js',
			format: 'iife',
			exports: 'named',
			sourcemap: true
		}
	}
];
