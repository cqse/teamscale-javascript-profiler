import { ImplementMeException, InvalidConfigurationException } from '@cqse/common-qualities';
import * as fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { glob } from 'glob';

export function specifiesFile(path: string): boolean {
	throw new ImplementMeException();
}

export function isExistingFile(path: string): boolean {
	return fs.existsSync(path) && fs.lstatSync(path).isFile();
}

export function isExistingDirectory(path: string): boolean {
	return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

export function ensureExistingDirectory(path: string): void {
	if (!fs.existsSync(path)) {
		mkdirp.sync(path);
	}

	if (!fs.lstatSync(path).isDirectory()) {
		throw new InvalidConfigurationException(
			`The specified path '${path}' does not point to an existing directory!`
		);
	}
}

export function isDirectoryEmpty(path: string): boolean {
	return !isExistingDirectory(path) || fs.readdirSync(path).length > 0;
}

export function expandToFileSet(toExpand: string): string[] {
	let globPattern = toExpand;
	if (fs.existsSync(toExpand)) {
		const stat = fs.lstatSync(toExpand, {});
		if (stat.isFile()) {
			return [toExpand];
		}

		if (stat.isDirectory()) {
			globPattern = `${toExpand}${path.sep}**`;
		}
	}

	const result: string[] = glob.sync(globPattern, { nodir: true });

	if (result.length === 0) {
		throw new InvalidConfigurationException(
			`No files to instrument found. \n\tWorking directory: '${process.cwd()}'\n\tPattern: '${globPattern}'`
		);
	}

	return result;
}
