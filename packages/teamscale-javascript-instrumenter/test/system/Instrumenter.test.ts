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

test('Instrumentation: React App. Vendor.js. Skip its instrumentation based on pattern.', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'vite-react-vendor.js')],
			in_place: false,
			exclude_bundle: ['**/*-vendor.js'],
			collector: 'localhost:54321',
			to: outputDir
		})
	).resolves.toHaveProperty('excluded', 1);
});

test('Instrumentation: React App. Vendor.js. Skip its instrumentation based on a quoted pattern.', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'vite-react-vendor.js')],
			in_place: false,
			exclude_bundle: ['"**/*-vendor.js"'],
			collector: 'localhost:54321',
			to: outputDir
		})
	).resolves.toHaveProperty('excluded', 1);
});

test('Instrumentation: React App. Vendor.js. Skip its instrumentation based on a multiply quoted pattern.', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'vite-react-vendor.js')],
			in_place: false,
			exclude_bundle: ['""\'**/*-vendor.js\'""'],
			collector: 'localhost:54321',
			to: outputDir
		})
	).resolves.toHaveProperty('excluded', 1);
});

test('Instrumentation: React App. Vendor.js; single quoted collector config; TS-33372', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'vite-react-vendor.js')],
			in_place: false,
			collector: '\'localhost:54321\'',
			to: outputDir
		})
	).resolves.toHaveProperty('translated', 1);
});

test('Instrumentation: React App. Vendor.js; double quoted collector config; TS-33372', () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	return expect(
		App.runForConfigArguments({
			inputs: [path.join(__dirname, 'inputs', 'vite-react-vendor.js')],
			in_place: false,
			collector: '"localhost:54321"',
			to: outputDir
		})
	).resolves.toHaveProperty('translated', 1);
});

test('Instrumentation: Angular App', async () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	const result = await App.runForConfigArguments({
		inputs: [path.join(__dirname, 'inputs', 'angular-hero-main-es5.js')],
		in_place: false,
		collector: 'localhost:54321',
		to: outputDir
	});
	const matchStats = result.task?.originSourcePattern.retrieveMatchingFiles();

	expect(matchStats?.excludePatterns.length).toStrictEqual(0);
	expect(matchStats?.neitherExcludedNorIncluded.length).toStrictEqual(19);
	expect(matchStats?.neitherExcludedNorIncluded).toContain("src/app/app.component.ts")
	expect(result).toHaveProperty('translated', 1);
});

test('Instrumentation: Polyfill', async () => {
	const outputDir = path.join(__dirname, '..', '..', 'outputs');
	const result = await App.runForConfigArguments({
		inputs: [path.join(__dirname, 'inputs', 'polyfills.js')],
		exclude_origin: ['node_modules/**/*.*'],
		in_place: false,
		collector: 'localhost:54321',
		to: outputDir
	});
	const matchStats = result.task?.originSourcePattern.retrieveMatchingFiles();

	expect(matchStats?.excludePatterns).toContain("node_modules/**/*.*")
	expect(matchStats?.excludeMatches).toContain("node_modules/zone.js/fesm2015/zone.js")
	expect(result).toHaveProperty('translated', 1);
});
