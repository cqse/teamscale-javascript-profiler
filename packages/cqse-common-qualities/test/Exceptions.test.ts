import { IllegalArgumentException } from '../lib';
import { IllegalStateException, ImplementMeException, InvalidConfigurationException } from '../src';

test('IllegalArgumentException', () => {
	expect(() => {
		throw new IllegalArgumentException('Illegal Argument');
	}).toThrowError();
	expect(() => {
		new IllegalArgumentException('Illegal Argument');
	}).not.toThrowError();
	expect(() => {
		throw new IllegalArgumentException();
	}).toThrowError();
	expect(() => {
		new IllegalArgumentException();
	}).not.toThrowError();
});

test('ImplementMeException', () => {
	expect(() => {
		throw new ImplementMeException('Argument');
	}).toThrowError();
	expect(() => {
		new ImplementMeException('Argument');
	}).not.toThrowError();
	expect(() => new ImplementMeException('Argument').message).toBeDefined();
	expect(() => new ImplementMeException().message).toBeDefined();
	expect(() => {
		throw new ImplementMeException();
	}).toThrowError();
	expect(() => {
		new ImplementMeException();
	}).not.toThrowError();
});

test('IllegalStateException', () => {
	expect(() => {
		throw new IllegalStateException('Argument');
	}).toThrowError();
	expect(() => {
		new IllegalStateException('Argument');
	}).not.toThrowError();
});

test('InvalidConfigurationException', () => {
	expect(() => {
		throw new InvalidConfigurationException('Argument');
	}).toThrowError();
	expect(() => {
		new InvalidConfigurationException('Argument');
	}).not.toThrowError();
});
