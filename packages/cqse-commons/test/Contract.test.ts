import { Contract } from '../src';

test('Predicates can be checked using `require`', () => {
	expect(() => Contract.require(true, 'Not expected to be violated')).not.toThrowError();
	expect(() => Contract.require(false, 'Expected to be violated')).toThrowError();
	expect(() => Contract.require(false)).toThrowError();
});

test('Checks using `requireDefined`', () => {
	expect(() => Contract.requireDefined(undefined, 'Expected to be violated')).toThrowError();
	expect(() => Contract.requireDefined(null, 'Expected to be violated')).toThrowError();
	expect(() => Contract.requireDefined(null)).toThrowError();
	expect(() => Contract.requireDefined(0, 'Not expected to be violated')).not.toThrowError();
	expect(() => Contract.requireDefined('', 'Not expected to be violated')).not.toThrowError();
	expect(() => Contract.requireDefined('abc', 'Not expected to be violated')).not.toThrowError();
	expect(() => Contract.requireDefined({}, 'Not expected to be violated')).not.toThrowError();
	expect(() => Contract.requireDefined(false, 'Not expected to be violated')).not.toThrowError();
	expect(() => Contract.requireDefined(true, 'Not expected to be violated')).not.toThrowError();
});

test('Checks using `requireNonEmpty`', () => {
	expect(() => Contract.requireNonEmpty('', 'Expected to be not empty.')).toThrowError();
	expect(() => Contract.requireNonEmpty('')).toThrowError();
	expect(() => Contract.requireNonEmpty('ABC', 'Expected to be not empty.')).not.toThrowError();
	expect(() => Contract.requireNonEmpty(' ', 'Expected to be not empty.')).not.toThrowError();
});

test('Checks using `requireStringPattern`', () => {
	expect(() => Contract.requireStringPattern('ABC', '^[A-Z]*$')).not.toThrowError();
	expect(() => Contract.requireStringPattern('abc', '^[A-Z]*$')).toThrowError();
});
