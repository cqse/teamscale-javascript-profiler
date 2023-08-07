import path from 'path';
import { findSubFolders, isExistingDirectory } from './FileSystem';
import {
	CallExpression,
	Expression,
	isArrayExpression,
	isCallExpression,
	isExpressionStatement,
	isIdentifier,
	isMemberExpression,
	isStringLiteral
} from '@babel/types';
import { parse } from '@babel/parser';
import { IllegalArgumentException } from '@cqse/commons';

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

export function extractFileUid(filename: string): string | undefined {
	const fileUidMatcher = /(.*)\.(cache|sourceMap\d+)\.js$/gmu;
	const matches = fileUidMatcher.exec(path.basename(filename));
	if (!matches) {
		return undefined;
	}
	return matches[1];
}

function expressionToString(expression: Expression): string {
	if (isMemberExpression(expression)) {
		return `${expressionToString(expression.object)}.${expressionToString(expression.property as any)}`;
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
		if (isStringLiteral(firstArgument.elements[0])) {
			const codeArgument = firstArgument.elements[0].value;
			return { codeArguments: [codeArgument], functionName: qualifiedFunctionName, codeAsArrayArgument: true };
		}
	} else if (isStringLiteral(firstArgument)) {
		const codeArgument = firstArgument.value;
		return { codeArguments: [codeArgument], functionName: qualifiedFunctionName, codeAsArrayArgument: false };
	}

	return null;
}
