import { cleanSourceCode } from '../src/instrumenter/Coverable';

test('Remove All Coverage Increments', () => {
	const cleaned = cleanSourceCode(
		`
	function foo() {
		cov_104fq7oo4i().f[0]++;
		saySomething();
		var i = 1;
		i++;
	}
	`,
		false,
		loc => false
	);
	expect(cleaned).toContain('i++');
	expect(cleaned).not.toContain('f[0]++');
});

test('Remove No Coverage Increments', () => {
	const cleaned = cleanSourceCode(
		`
	function foo() {
		cov_104fq7oo4i().f[0]++;
		saySomething();
		var i = 1;
		i++;
	}
	`,
		false,
		loc => true
	);
	expect(cleaned).toContain('i++');
	expect(cleaned).toContain('f[0]++');
});

test('Remove Some Coverage Increments', () => {
	const cleaned = cleanSourceCode(
		`
	function foo() {
		cov_104fq7oo4i().f[0]++;
		cov_104fq7oo4i().f[1]++;
		saySomething();
		var i = 1;
		f++;
	}
	`,
		false,
		loc => loc.start.line === 3
	);
	expect(cleaned).toContain('f++');
	expect(cleaned).toContain('f[0]++');
	expect(cleaned).not.toContain('f[1]++');
});
