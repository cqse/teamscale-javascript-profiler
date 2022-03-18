import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse, { NodePath } from '@babel/traverse';
import {
	CallExpression,
	ExpressionStatement,
	isCallExpression,
	isIdentifier,
	isMemberExpression,
	isUpdateExpression,
	SourceLocation, UpdateExpression
} from '@babel/types';

/**
 * Remove IstanbulJs instrumentations based on the given
 * hook `makeCoverable`.
 *
 * An instrumentation is removed if the hook `makeCoverable` returns `false`.
 */
export function cleanSourceCode(
	code: string,
	esModules: boolean,
	makeCoverable: (location: SourceLocation) => boolean
): string {
	const ast = parse(code, { sourceType: esModules ? 'module' : 'script' });
	traverse(ast, {
		ExpressionStatement(path) {
			if (isUnsupportedCounterTypeIncrement(path)) {
				path.remove();
			} else if (isCoverageIncrementNode(path)) {
				if (path.node.loc && !makeCoverable(path.node.loc)) {
					path.remove();
				}
			}
		}
	});
	return generate(ast, {}, code).code;
}

/**
 * Checks if the given `path.node` to a statement like `cov_104fq7oo4i().f[0]++;`
 */
function isCoverageIncrementNode(path: NodePath<ExpressionStatement>) {
	const expr = path.node.expression;

	if (!isUpdateExpression(expr)) {
		return false;
	}

	return extractCoverageCallExpression(expr) !== undefined;
}

function isUnsupportedCounterTypeIncrement(path: NodePath<ExpressionStatement>) {
	if (!isUpdateExpression(path.node.expression)) {
		return false;
	}

	return extractBranchCounterExpression(path.node.expression) !== undefined;
}

function extractBranchCounterExpression(expr: UpdateExpression): CallExpression| undefined {
	if (expr.operator === '++' &&
		isMemberExpression(expr.argument) &&
		isMemberExpression(expr.argument.object) &&
		isMemberExpression(expr.argument.object.object) &&
		isCallExpression(expr.argument.object.object.object)) {
		// Branch counter
		return extractCoverageObjectCall(expr.argument.object.object.object);
	}

	return undefined;
}

function extractFunctionOrStatementCounterExpression(expr: UpdateExpression): CallExpression | undefined {
	if (expr.operator === '++' &&
		isMemberExpression(expr.argument) &&
		isMemberExpression(expr.argument.object) &&
		isCallExpression(expr.argument.object.object)) {
		// Function and statement counter
		return extractCoverageObjectCall(expr.argument.object.object);
	}

	return undefined;
}

function extractCoverageCallExpression(expr: UpdateExpression): CallExpression | undefined {
	return extractBranchCounterExpression(expr)
		?? extractFunctionOrStatementCounterExpression(expr);
}

function extractCoverageObjectCall(callExpression: CallExpression | undefined): CallExpression | undefined {
	if (callExpression && isIdentifier(callExpression.callee)
		&& callExpression.callee.name.startsWith('cov_')) {
		return callExpression;
	}

	return undefined;
}