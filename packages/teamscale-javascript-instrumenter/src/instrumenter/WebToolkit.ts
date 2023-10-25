import path from 'path';
import { findSubFolders, isExistingDirectory, isExistingFile, sourceMapFromMapFile } from './FileSystem';
import {
	CallExpression,
	Expression,
	isArrayExpression,
	isCallExpression,
	isExpression,
	isExpressionStatement,
	isIdentifier,
	isMemberExpression,
	isStringLiteral
} from '@babel/types';
import { parse } from '@babel/parser';
import { IllegalArgumentException } from '@cqse/commons';
import { Bundle, GwtBundle } from './Task';
import { RawSourceMap } from 'source-map';

/**
 * Information on a GWT function call, typically with code to be evaluated as arguments.
 */
export type GwtCallInfos = { codeArguments: string[]; functionName: string; codeAsArrayArgument: boolean };

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

function expressionToString(expression: Expression): string {
	if (isMemberExpression(expression) && isExpression(expression.property)) {
		return `${expressionToString(expression.object)}.${expressionToString(expression.property)}`;
	} else if (isIdentifier(expression)) {
		return expression.name;
	}
	throw new IllegalArgumentException('Type of expression not yet supported.');
}

function extractQualifiedFunctionName(call: CallExpression): string {
	if (isMemberExpression(call.callee) || isIdentifier(call.callee)) {
		return expressionToString(call.callee);
	}
	throw new IllegalArgumentException('Type of callee not yet supported.');
}

/**
 * Extract the GWT function calls from the GWT bundle. These function calls
 * do have the actual application code as arguments.
 *
 * Examples of `bundleContent` (without the double quotes):
 * 		"showcase.onScriptDownloaded(["var $wnd =  .....  __gwtModuleFunction.__moduleStartupDone($gwt.permProps);\n//# sourceURL=showcase-0.js\n"]);"
 * 	    "$wnd.showcase.runAsyncCallback3("function bc(a){Wb((Ze(),Xe),a) ..... nZ5b(El)(3);\n//# sourceURL=showcase-3.js\n")
 */
export function extractGwtCallInfos(bundleContent: string): GwtCallInfos | null {
	const ast = parse(bundleContent);
	if (ast.program.body.length === 0) {
		return null;
	}
	if (!isExpressionStatement(ast.program.body[0])) {
		return null;
	}
	const call = ast.program.body[0].expression;
	if (!isCallExpression(call)) {
		return null;
	}
	const qualifiedFunctionName = extractQualifiedFunctionName(call);
	const firstArgument = call.arguments[0];

	if (isArrayExpression(firstArgument)) {
		const codeArguments = [];
		for (const element of firstArgument.elements) {
			if (isStringLiteral(element)) {
				codeArguments.push(element.value);
			} else {
				throw new Error(`Did expect only string arguments in the call of "${qualifiedFunctionName}".`);
			}
		}
		return { codeArguments, functionName: qualifiedFunctionName, codeAsArrayArgument: true };
	} else if (isStringLiteral(firstArgument)) {
		const codeArgument = firstArgument.value;
		return { codeArguments: [codeArgument], functionName: qualifiedFunctionName, codeAsArrayArgument: false };
	}

	return null;
}

/**
 * Load the source map for the given GWT bundle.
 */
export function loadInputSourceMapsGwt(taskFile: string, bundleFile: GwtBundle): Array<RawSourceMap | undefined> {
	// taskFile:
	//    war/stockwatcher/E2C1FB09E006E0A2420123D036967150.cache.js
	//    war/showcase/deferredjs/28F63AD125178AAAB80993C11635D26F/5.cache.js
	const mapDirs = determineSymbolMapsDir(taskFile);

	const fileNumberMatcher = /sourceURL=(.*)-(\d+).js(\\n)*\s*$/;

	const mapModules: Array<[string, number]> = bundleFile.codeArguments.map(code => {
		const matches = fileNumberMatcher.exec(code);
		if (!matches) {
			return ['', -1];
		}
		return [matches[1], Number.parseInt(matches[2])];
	});

	const sourceMapFiles = mapModules.map(module => {
		for (const mapDir of mapDirs) {
			const mapFileCandidate = `${mapDir}/${bundleFile.fragmentId}_sourceMap${module[1]}.json`;
			if (isExistingFile(mapFileCandidate)) {
				return mapFileCandidate;
			}
		}
		return undefined;
	});

	return sourceMapFiles.map(file => {
		if (file) {
			return sourceMapFromMapFile(file);
		}
		return undefined;
	});
}

/**
 * Determine the ID of the given GWT bundle file.
 */
export function determineGwtFileUid(filename: string): string | undefined {
	const fileUidMatcher = /.*([0-9A-Fa-f]{32}).*/;
	const uidMatches = fileUidMatcher.exec(filename);
	if (!uidMatches || uidMatches.length < 2) {
		return undefined;
	}
	return uidMatches[1];
}

/**
 * Is the given bundle a GWT bundle?
 */
export function isGwtBundle(bundle: Bundle): bundle is GwtBundle {
	return bundle.type === 'gwt';
}
