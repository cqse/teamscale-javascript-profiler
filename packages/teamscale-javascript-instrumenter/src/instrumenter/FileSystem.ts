import { InvalidConfigurationException } from '@cqse/commons';
import * as fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { glob } from 'glob';

/**
 * Does the given `path` point to an existing file?
 */
export function isExistingFile(path: string): boolean {
	return fs.existsSync(path) && fs.lstatSync(path).isFile();
}

/**
 * Does the given `path` point to an existing directory?
 */
export function isExistingDirectory(path: string): boolean {
	return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

/**
 * Ensure that the given directory `path` exists.
 */
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

export function findSubFolders(startFromFolder: string, folderName: string): string[] {
	const matches: string[] = [];
	const entries = fs.readdirSync(startFromFolder, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(startFromFolder, entry.name);
		if (entry.name === folderName && entry.isDirectory()) {
			matches.push(fullPath);
		}
		if (entry.isDirectory()) {
			const nestedMatches = findSubFolders(fullPath, folderName);
			matches.push(...nestedMatches);
		}
	}

	return matches;
}

/**
 * Is the given directory empty?
 */
export function isDirectoryEmpty(path: string): boolean {
	return !isExistingDirectory(path) || fs.readdirSync(path).length > 0;
}

/**
 * Expand a given Glob pattern to a list of files.
 *
 * @param toExpand - The Glob pattern.
 */
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

	return glob.sync(globPattern, { nodir: true });
}
