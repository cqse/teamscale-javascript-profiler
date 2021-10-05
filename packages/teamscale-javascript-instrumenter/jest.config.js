/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest/presets/js-with-babel',
	testEnvironment: 'node',
	transformIgnorePatterns: ['node_modules'],
	testMatch: ['**/test/**/*.test.ts'],
	clearMocks: true,
	coverageProvider: 'v8',
	coverageDirectory: 'coverage',
	collectCoverage: true
};
