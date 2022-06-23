import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse, { NodePath } from '@babel/traverse';
import {
	CallExpression,
	isCallExpression,
	isIdentifier,
	isMemberExpression,
	SourceLocation,
	UpdateExpression
} from '@babel/types';

function isUpdateExpressionPath(path: NodePath<any>): path is NodePath<UpdateExpression> {
	return path.node.type === 'UpdateExpression';
}

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
		enter(path: NodePath) {
			if (isUpdateExpressionPath(path)) {
				if (isCoverageIncrementNode(path)) {
					if (path.node.loc && !makeCoverable(path.node.loc)) {
						path.remove();
					}
				}
			}
		}
	});
	return generate(ast, {}, code).code;
}

/**
 * Checks if the given `path.node` to a statement like `cov_104fq7oo4i().f[0]++;`
 */
function isCoverageIncrementNode(path: NodePath<UpdateExpression>) {
	return extractCoverageCallExpression(path.node) !== undefined;
}

/**
 * Returns the call expression from `cov_2pvvu1hl8v().b[2][0]++;` if
 * the given UpdateExpression is a branch coverage update expression.
 */
function extractBranchCounterExpression(expr: UpdateExpression): CallExpression | undefined {
	if (
		expr.operator === '++' &&
		isMemberExpression(expr.argument) &&
		isMemberExpression(expr.argument.object) &&
		isMemberExpression(expr.argument.object.object) &&
		isCallExpression(expr.argument.object.object.object)
	) {
		// Branch counter
		return extractCoverageObjectCall(expr.argument.object.object.object);
	}

	return undefined;
}

/**
 * Returns the call expression from `cov_104fq7oo4i().f[0]++;` if
 * the given UpdateExpression is a function or statement coverage update expression.
 */
function extractFunctionOrStatementCounterExpression(expr: UpdateExpression): CallExpression | undefined {
	if (
		expr.operator === '++' &&
		isMemberExpression(expr.argument) &&
		isMemberExpression(expr.argument.object) &&
		isCallExpression(expr.argument.object.object)
	) {
		// Function and statement counter
		return extractCoverageObjectCall(expr.argument.object.object);
	}

	return undefined;
}

/**
 * Given an `UpdateExpression` extract the call expression returning the coverage object.
 */
function extractCoverageCallExpression(expr: UpdateExpression): CallExpression | undefined {
	return extractBranchCounterExpression(expr) ?? extractFunctionOrStatementCounterExpression(expr);
}

/**
 * Check if the given call expression is a coverage call expression.
 * If this is not the case return `undefined`, and the call expression itself otherwise.
 */
function extractCoverageObjectCall(callExpression: CallExpression | undefined): CallExpression | undefined {
	if (callExpression && isIdentifier(callExpression.callee) && callExpression.callee.name.startsWith('cov_')) {
		return callExpression;
	}

	return undefined;
}
