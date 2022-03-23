import { OriginSourcePattern } from '../src/instrumenter/Task';

test('Include pattern without extension', () => {
	const pattern = new OriginSourcePattern(['./src/app/**/*'], undefined);
	const result = pattern.isAnyIncluded(['./src/app/app.components.ts', './src/app/messages/messages.component.ts']);
	expect(result).toBeTruthy();
});

test('Include pattern with extension', () => {
	const pattern = new OriginSourcePattern(['src/app/**/*.ts'], undefined);
	const result = pattern.isAnyIncluded(['src/app/app.components.ts', 'src/app/messages/messages.component.ts']);
	expect(result).toBeTruthy();
});

test('Include pattern with extension. Path normalization', () => {
	const pattern = new OriginSourcePattern(['src/app/**/*.ts'], undefined);
	const result = pattern.isAnyIncluded(['./src/app/app.components.ts', './src/app/messages/messages.component.ts']);
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
});
