import path from 'path';
import { findSubFolders, isExistingDirectory } from './FileSystem';

/**
 * There are different places where a 'symbolMaps' folder can be:
 * (1) within the `WEB-INF` folder (`WEB-INF/deploy/<module-name>/symbolMaps`)
 * or (2) it can be a sibling of the parent `deferredjs` folder.
 *
 * @param taskFile - Path to the JS bundle file to start searching from.
 */
export function determineSymbolMapsDir(taskFile: string): string[] {
	const symbolMapDirs = [];
	let webInfDir: string | null = null;
	const pathComponents = path.resolve(taskFile).split(path.sep);
	for (let i = pathComponents.length - 2; i >= 0; i--) {
		const fullDirPath = pathComponents.slice(0, i).join(path.sep);
		const webInfDirCandidate = path.join(fullDirPath, 'WEB-INF');
		if (isExistingDirectory(webInfDirCandidate)) {
			webInfDir = webInfDirCandidate;
		}
		const symbolMapDirCandidate = path.join(fullDirPath, 'symbolMaps');
		if (isExistingDirectory(symbolMapDirCandidate)) {
			symbolMapDirs.push(symbolMapDirCandidate);
		}
	}

	if (webInfDir != null) {
		findSubFolders(webInfDir, 'symbolMaps').forEach(dir => symbolMapDirs.push(dir));
	}

	return symbolMapDirs;
}

export function extractFileUid(filename: string): string | undefined {
	const fileUidMatcher = /(.*)\.(cache|sourceMap\d+)\.js$/gmu;
	const matches = fileUidMatcher.exec(path.basename(filename));
	if (!matches) {
		return undefined;
	}
	return matches[1];
}
