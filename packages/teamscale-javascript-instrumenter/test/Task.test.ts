import { OriginSourcePattern } from '../src/instrumenter/Task';

test('Test include pattern without extension', () => {
	const pattern = new OriginSourcePattern('./src/app/**/*', undefined);
	const result = pattern.isAnyIncluded(['./src/app/app.components.ts', './src/app/messages/messages.component.ts']);
	expect(result).toBeTruthy();
});

test('Test include pattern with extension', () => {
	const pattern = new OriginSourcePattern('src/app/**/*.ts', undefined);
	const result = pattern.isAnyIncluded(['src/app/app.components.ts', 'src/app/messages/messages.component.ts']);
	expect(result).toBeTruthy();
});

test('Test include pattern with extension. Path normalization', () => {
	const pattern = new OriginSourcePattern('src/app/**/*.ts', undefined);
	const result = pattern.isAnyIncluded(['./src/app/app.components.ts', './src/app/messages/messages.component.ts']);
	expect(result).toBeTruthy();
});
