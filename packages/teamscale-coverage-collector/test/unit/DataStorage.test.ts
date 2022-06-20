import { ProjectCoverage } from '../../src/storage/DataStorage';

test('Test if coverage is aggregated in the storage', () => {
	const storage = new ProjectCoverage('42');
	storage.putLine('main.ts', 1);
	storage.putLine('main.ts', 2);
	storage.putLine('main.ts', 4);
	const lines = new Set();
	for (const coverage of storage.getCoverage()) {
		coverage.coveredLines.forEach(l => lines.add(l));
	}
	expect(lines).toContain(1);
	expect(lines).toContain(2);
	expect(lines).toContain(4);
	expect(lines).not.toContain(3);
});
