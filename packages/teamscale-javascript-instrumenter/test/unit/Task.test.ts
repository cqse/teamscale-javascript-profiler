import { FileExcludePattern, OriginSourcePattern } from '../../src/instrumenter/Task';
import micromatch from "micromatch";

describe('OriginSourcePattern', () => {
	test('Include pattern without extension', () => {
		const pattern = new OriginSourcePattern(['./src/app/**/*'], undefined);
		const result = pattern.isAnyIncluded([
			'./src/app/app.components.ts',
			'./src/app/messages/messages.component.ts'
		]);
		expect(result).toBeTruthy();
	});

	test('Include pattern, vueJs', () => {
		const pattern = new OriginSourcePattern(['**/*.*'], undefined);
		const result = pattern.isAnyIncluded(['../../node_modules/@vue/shared/dist/shared.esm-bundler.js']);
		expect(result).toBeTruthy();
	});

	test('Include pattern, vueJs, partial path', () => {
		const pattern = new OriginSourcePattern(['**/dist/*.js'], undefined);
		const result = pattern.isAnyIncluded(['shared/dist/shared.esm-bundler.js']);
		expect(result).toBeTruthy();
	});


	test('Include pattern with extension', () => {
		const pattern = new OriginSourcePattern(['src/app/**/*.ts'], undefined);
		const result = pattern.isAnyIncluded(['src/app/app.components.ts', 'src/app/messages/messages.component.ts']);
		expect(result).toBeTruthy();
	});

	test('Include pattern with extension. Path normalization', () => {
		const pattern = new OriginSourcePattern(['src/app/**/*.ts'], undefined);
		const result = pattern.isAnyIncluded([
			'./src/app/app.components.ts',
			'./src/app/messages/messages.component.ts'
		]);
		expect(result).toBeTruthy();
	});

	test('Exclude pattern with extension. Path normalization', () => {
		const pattern = new OriginSourcePattern(undefined, ['src/app/**/*.ts']);
		expect(
			pattern.isAnyIncluded(['./berg/app/app.components.ts', './src/app/messages/messages.component.ts'])
		).toBeTruthy();
		expect(pattern.isAnyIncluded(['./berg/app/app.components.ts'])).toBeTruthy();
		expect(pattern.isAnyIncluded(['./src/app/app.components.ts'])).toBeFalsy();
	});

	test('Exclude and include pattern', () => {
		const pattern = new OriginSourcePattern(['src/bar/**/*.ts'], ['src/foo/**/*.ts']);
		expect(
			pattern.isAnyIncluded(['./src/bar/app.components.ts', './src/foo/messages/messages.component.ts'])
		).toBeTruthy();
		expect(pattern.isAnyIncluded(['./src/foo/messages/messages.component.ts'])).toBeFalsy();
		expect(pattern.isAnyIncluded(['./src/bar/messages/messages.component.ts'])).toBeTruthy();
		expect(
			pattern.isAnyIncluded([
				'./test/foo/unittest.test.ts',
				'./test/bar/unittest.test.ts',
				'./build/main.ts',
				'main.ts'
			])
		).toBeFalsy();
	});

	test('Exclude patterns only', () => {
		const pattern = new OriginSourcePattern([], ['src/foo/messages/*.ts']);
		expect(
			pattern.isAnyIncluded(['./src/bar/app.components.ts', './src/foo/messages/messages.component.ts'])
		).toBeTruthy();
		expect(pattern.isAnyIncluded(['./src/foo/messages/messages.component.ts'])).toBeFalsy();
		expect(pattern.isAnyIncluded(['src/foo/messages/messages.component.ts'])).toBeFalsy();
		expect(pattern.isAnyIncluded(['webpack:///src/foo/messages/messages.component.ts'])).toBeFalsy();
		expect(pattern.isAnyIncluded(['./src/bar/messages/messages.component.ts'])).toBeTruthy();
		expect(pattern.isAnyIncluded(['./test/bar/unittest.test.ts', './build/main.ts', 'main.ts'])).toBeTruthy();
	});

	test('Exclude and include pattern on file extensions', () => {
		const pattern = new OriginSourcePattern(
			['**/*.java', '**/*.md'],
			['**/*.cc', '**/*.cpp', '**/*.h', '**/*.hpp']
		);
		expect(pattern.isAnyIncluded(['./ServerConnector.java', './Server.h'])).toBeTruthy();
		expect(
			pattern.isAnyIncluded(['./ServerConnector.java', './ServerVerifier.java', './ServerStarter.java'])
		).toBeTruthy();
		expect(
			pattern.isAnyIncluded([
				'./ServerConnector.java',
				'./ServerVerifier.java',
				'./ServerStarter.java',
				'main.cpp',
				'Logger.java'
			])
		).toBeTruthy();
		expect(pattern.isAnyIncluded(['proj/docs/README.md'])).toBeTruthy();
		expect(pattern.isAnyIncluded(['proj/src/reader.cpp', 'proj/test/reader_test.cpp'])).toBeFalsy();
	});

	test('Exclude and include pattern precedence', () => {
		const pattern = new OriginSourcePattern(
			['**/ab/**', '**/cd/**'],
			['**/ef/**', '**/gh/**', '**/ij/**', '**/kl/**']
		);
		expect(pattern.isAnyIncluded(['./xy/ef/file1.ts', './kl/file2.ts'])).toBeFalsy();
		expect(pattern.isAnyIncluded(['./xy/ef/file1.ts', './kl/file2.ts', './xy/ij/ab/file3.ts'])).toBeFalsy(); // exclude has precedence over include
	});
});

describe('FileExcludePattern', () => {
	test('Exclude pattern with extension. Path normalization', () => {
		const pattern = new FileExcludePattern(['./**/(runtime|vendor)*.js']);
		expect(pattern.isExcluded('./src/app/index.js')).toBeFalsy();
		expect(pattern.isExcluded('vendor.5d3bc21.js')).toBeTruthy();
		expect(pattern.isExcluded('./assets/vendor.5d3bc21.js')).toBeTruthy();
		expect(pattern.isExcluded('.\\assets\\vendor.5d3bc21.js')).toBeTruthy();
	});
});
