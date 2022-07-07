import { cleanSourceCode } from '../../src/instrumenter/Postprocessor';
import * as fs from 'fs';
import path from 'path';

test('Remove All Coverage Increments', () => {
	const cleaned = cleanSourceCode(
		`
	function cov_104fq7oo4i() {
		var path = '/home/user/test/casestudies/plain-ts/dist/main.js';
		var hash = '6822844a804c1e9986ac4bd4a45b85893bde8b33';
		var global = new Function('return this')();
	}
	
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
	function cov_104fq7oo4i() {
		var path = '/home/user/test/casestudies/plain-ts/dist/main.js';
		var hash = '6822844a804c1e9986ac4bd4a45b85893bde8b33';
		var global = new Function('return this')();
	}
	
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
	expect(cleaned).not.toContain('f[0]++');
});

test('Remove Function Coverage Increments', () => {
	const cleaned = cleanSourceCode(
		`
	function cov_104fq7oo4i() {
		var path = '/home/user/test/casestudies/plain-ts/dist/main.js';
		var hash = '6822844a804c1e9986ac4bd4a45b85893bde8b33';
		var global = new Function('return this')();
	}
		
	function foo() {
		cov_104fq7oo4i().s[0]++;
		cov_104fq7oo4i().f[0]++;
		cov_104fq7oo4i().f[1]++;
		cov_104fq7oo4i().b[2][0]++;
		saySomething();
		var i = 1;
		f++;
	}
	`,
		false,
		loc => loc.start.line === 9
	);
	expect(cleaned).toContain('f++');
	expect(cleaned).toContain('_$stmtCov(_$fid0, 0)');
	expect(cleaned).not.toContain('f[0]++');
	expect(cleaned).not.toContain('f[1]++');
});

test('Different types of coverage must be removed', () => {
	const cleaned = cleanSourceCode(
		`
	function cov_104fq7oo4i() {
		var path = '/home/user/test/casestudies/plain-ts/dist/main.js';
		var hash = '6822844a804c1e9986ac4bd4a45b85893bde8b33';
		var global = new Function('return this')();
	}
		
	function foo() {
		cov_104fq7oo4i().f[0]++;
		cov_104fq7oo4i().f[1]++;
		cov_2pvvu1hl8v().b[2][0]++;
		cov_2pvvu1hl8v().b[2][1]++;
		saySomething();
		var i = 1;
		f++;
	}
	`,
		false,
		loc => false
	);
	expect(cleaned).toContain('f++');
	expect(cleaned).not.toContain('f[0]++');
	expect(cleaned).not.toContain('f[0]++');
	expect(cleaned).not.toContain('b[2][0]++');
	expect(cleaned).not.toContain('b[2][1]++');
});

test('Remove unsupported coverage only', () => {
	const cleaned = cleanSourceCode(
		`
	function cov_104fq7oo4i() {
		var path = '/home/user/test/casestudies/plain-ts/dist/main.js';
		var hash = '6822844a804c1e9986ac4bd4a45b85893bde8b33';
		var global = new Function('return this')();
	}
	
	function cov_2pvvu1hl8v() {
		var path = '/home/user/test/casestudies/plain-ts/dist/main.js';
		var hash = '6822844a804c1e9986ac4bd4a45b85893bde8b33';
		var global = new Function('return this')();
	}
		
	function foo() {
		cov_104fq7oo4i().f[0]++;
		cov_104fq7oo4i().f[1]++;
		cov_2pvvu1hl8v().b[2][0]++;
		cov_2pvvu1hl8v().b[2][1]++;
		saySomething();
		var i = 1;
		f++;
	}
	`,
		false,
		loc => true
	);
	expect(cleaned).toContain('f++');
	expect(cleaned).toContain('_$brCov(_$fid1, 2, 0)');
	expect(cleaned).toContain('_$brCov(_$fid1, 2, 1)');
});

test('Also handle coverage increments in sequence expressions.', () => {
	const cleaned = cleanSourceCode(
		`
	function cov_oqh6rsgrd() {
		var path = '/home/user/test/casestudies/plain-ts/dist/main.js';
		var hash = '6822844a804c1e9986ac4bd4a45b85893bde8b33';
		var global = new Function('return this')();
	}
		
	function s(e, r) {
	  cov_oqh6rsgrd().f[6]++;
	  cov_oqh6rsgrd().s[18]++;
	  return e > 5 ? (cov_oqh6rsgrd().b[3][0]++, r + 1) : (cov_oqh6rsgrd().b[3][1]++, (cov_oqh6rsgrd().b[5][0]++, e > 5) && (cov_oqh6rsgrd().b[5][1]++, 123 === r) ? (cov_oqh6rsgrd().b[4][0]++, r + 2) : (cov_oqh6rsgrd().b[4][1]++, r + 3));
	}
	`,
		false,
		loc => true
	);
	expect(cleaned).not.toContain('b[3][0]++');
	expect(cleaned).toContain('_$brCov(_$fid0, 3, 0)');
});

test('Remove the coverage from an instrument Angular bundle.', () => {
	const instrumentedJs: string = fs.readFileSync(path.join(__dirname, 'inputs', 'angular-main.instrumented.js'), {
		encoding: 'utf8',
		flag: 'r'
	});
	const cleaned = cleanSourceCode(instrumentedJs, false, loc => false);
	expect(cleaned).toContain('cov_so9kzdjvn');
	expect(cleaned).not.toContain('cov_so9kzdjvn().s[');
});
