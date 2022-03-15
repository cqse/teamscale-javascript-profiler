import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse, { NodePath } from '@babel/traverse';
import {
	ExpressionStatement,
	isCallExpression,
	isIdentifier,
	isMemberExpression,
	isNumericLiteral,
	isUpdateExpression,
	SourceLocation
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
			if (isCoverageIncrementNode(path)) {
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

	return (
		expr.operator === '++' &&
		isMemberExpression(expr.argument) &&
		isMemberExpression(expr.argument.object) &&
		isCallExpression(expr.argument.object.object) &&
		isIdentifier(expr.argument.object.object.callee) &&
		expr.argument.object.object.callee.name.startsWith('cov_') &&
		isNumericLiteral(expr.argument.property)
	);
}
