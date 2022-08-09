import { instrumentWithSwc } from '../../src/instrumenter/Instrumenter';

test('Remove Function Coverage Increments', () => {
	const code = `
	function foo() {
		var a = 9;
		a = a + 1;
		console.log(a);
	}
		
	function bar() {
		saySomething();
		var i = 1;
		i++;
		foo();
	}
	`;

	const instrumented = instrumentWithSwc('test.js', code, undefined);
	console.log(instrumented);
});
