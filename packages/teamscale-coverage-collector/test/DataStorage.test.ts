import { DataStorage, ProjectCoverage } from '../src/storage/DataStorage';
import Logger, { LogLevel } from 'bunyan';
import { StdConsoleLogger } from '../src/utils/StdConsoleLogger';
import tmp from 'tmp';
import * as dat from 'date-and-time';
import path from 'path';
import * as fs from 'fs';

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

test('Test that coverage files are timestamped before file ending', () => {
	const dataStorage = new DataStorage(createLogger());
	const targetDir = tmp.dirSync({ unsafeCleanup: true });
	const targetFileName = path.join(targetDir.name, 'coverage.simple');
	const date = new Date();

	dataStorage.dumpToSimpleCoverageFile(targetFileName, date);

	const formattedDate = dat.format(date, dataStorage.DATE_FORMAT);
	const coverageFiles = fs.readdirSync(targetDir.name);
	expect(coverageFiles.length).toBe(1);
	expect(coverageFiles[0]).toBe(`coverage-${formattedDate}.simple`);

	targetDir.removeCallback();
});

test('Test that coverage files without file ending are timestamped', () => {
	const dataStorage = new DataStorage(createLogger());
	const targetDir = tmp.dirSync({ unsafeCleanup: true });
	const targetFileName = path.join(targetDir.name, 'coverage');
	const date = new Date();

	dataStorage.dumpToSimpleCoverageFile(targetFileName, date);

	const formattedDate = dat.format(date, dataStorage.DATE_FORMAT);
	const coverageFiles = fs.readdirSync(targetDir.name);
	expect(coverageFiles.length).toBe(1);
	expect(coverageFiles[0]).toBe(`coverage-${formattedDate}`);

	targetDir.removeCallback();
});

test('Test that coverage file paths are trimmed', () => {
	const dataStorage = new DataStorage(createLogger());
	const targetDir = tmp.dirSync({ unsafeCleanup: true });
	const targetFilePathWithLeadingAndTailingSpaces = ` ${path.join(targetDir.name, 'coverage')} `;
	const date = new Date();

	dataStorage.dumpToSimpleCoverageFile(targetFilePathWithLeadingAndTailingSpaces, date);

	const formattedDate = dat.format(date, dataStorage.DATE_FORMAT);
	const coverageFiles = fs.readdirSync(targetDir.name);
	expect(coverageFiles.length).toBe(1);
	expect(coverageFiles[0]).toBe(`coverage-${formattedDate}`);

	targetDir.removeCallback();
});

test('Coverage is reset after dump', () => {
	const dataStorage = new DataStorage(createLogger());
	const targetDir = tmp.dirSync({ unsafeCleanup: true });
	const targetFileName = path.join(targetDir.name, 'coverage');
	const firstDumpDate = new Date();
	const project = 'test_project';
	const coveredFile = 'test_file';
	const coveredLines = [1, 2, 3];

	dataStorage.putCoverage(project, coveredFile, coveredLines);
	const [, firstWrittenLines] = dataStorage.dumpToSimpleCoverageFile(targetFileName, firstDumpDate);

	const secondDumpDate = new Date();
	const [, secondWrittenLines] = dataStorage.dumpToSimpleCoverageFile(targetFileName, secondDumpDate);

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
