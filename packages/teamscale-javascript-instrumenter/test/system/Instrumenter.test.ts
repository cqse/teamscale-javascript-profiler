import * as path from 'path';
import { App } from '../../src/App';

test('Instrumentation: JS that was constructed from TS', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'plain-ts-main.js')],
			in_place: false,
			collector: 'localhost:54321',
			to: outputDir
		})
	).resolves.toHaveProperty('translated', 1);
});

test('Instrumentation: React App', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'vite-react-index.js')],
			in_place: false,
			collector: 'localhost:54321',
			to: outputDir
		})
	).resolves.toHaveProperty('translated', 1);
});

test('Instrumentation: React App. Vendor.js', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'vite-react-vendor.js')],
			in_place: false,
			collector: 'localhost:54321',
			to: outputDir
		})
	).resolves.toHaveProperty('translated', 1);
});

test('Instrumentation: Angular App', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'angular-hero-main-es5.js')],
			in_place: false,
			collector: 'localhost:54321',
			to: outputDir
		})
	).resolves.toHaveProperty('translated', 1);
});
