import { DataStorage, ProjectCoverage } from '../src/storage/DataStorage';
import Logger, { LogLevel } from 'bunyan';
import { StdConsoleLogger } from '../src/utils/StdConsoleLogger';
import tmp from 'tmp';
import * as dat from 'date-and-time';
import path from 'path';

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

test('Test that timestamped coverage file are created inside the target directory', () => {
	const dataStorage = new DataStorage(createLogger());
	const targetDir = tmp.dirSync({ unsafeCleanup: true });
	const date = new Date();

	const [coverageFile] = dataStorage.dumpToSimpleCoverageFile(targetDir.name, date);

	const formattedDate = dat.format(date, dataStorage.DATE_FORMAT);
	expect(path.dirname(coverageFile)).toBe(targetDir.name);
	expect(coverageFile).toContain(`coverage-${formattedDate}.simple`);

	targetDir.removeCallback();
});

test('Test that coverage folder paths are trimmed', () => {
	const dataStorage = new DataStorage(createLogger());
	const targetDirWithoutLeadingAndTailingSpaces = tmp.dirSync({ unsafeCleanup: true });
	const targetDirWithLeadingAndTailingSpaces = ` ${targetDirWithoutLeadingAndTailingSpaces.name} `;
	const date = new Date();

	const [coverageFile] = dataStorage.dumpToSimpleCoverageFile(targetDirWithLeadingAndTailingSpaces, date);

	expect(path.dirname(coverageFile)).toBe(targetDirWithoutLeadingAndTailingSpaces.name);

	targetDirWithoutLeadingAndTailingSpaces.removeCallback();
});

test('Coverage is reset after dump', () => {
	const dataStorage = new DataStorage(createLogger());
	const targetDir = tmp.dirSync({ unsafeCleanup: true });
	const firstDumpDate = new Date();
	const project = 'test_project';
	const coveredFile = 'test_file';
	const coveredLines = [1, 2, 3];

	dataStorage.putCoverage(project, coveredFile, coveredLines);
	const [, firstWrittenLines] = dataStorage.dumpToSimpleCoverageFile(targetDir.name, firstDumpDate);

	const secondDumpDate = new Date();
	const [, secondWrittenLines] = dataStorage.dumpToSimpleCoverageFile(targetDir.name, secondDumpDate);

	expect(firstWrittenLines).toBeGreaterThan(0);
	expect(secondWrittenLines).toBe(0);
});

function createLogger() {
	return Logger.createLogger({
		name: 'Collector',
		streams: [
			// console output
			{ level: 'info' as LogLevel, stream: new StdConsoleLogger(), type: 'raw' }
		]
	});
}
