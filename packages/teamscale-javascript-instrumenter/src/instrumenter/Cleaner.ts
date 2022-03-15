import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse, { NodePath } from '@babel/traverse';
import { Identifier, SourceLocation, UpdateExpression } from '@babel/types';

/**
 * Remove IstanbulJs instrumentations based on the given
 * hook `makeCoverable`. Instrumentation is removed of `makeCoverable` returns `false`.
 */
export function cleanSourceCode(
	code: string,
	esModules: boolean,
	makeCoverable: (location: SourceLocation) => boolean
): string {
	const ast = parse(code, { sourceType: esModules ? 'module' : 'script' });
	traverse(ast, {
		enter(path) {
			if (isCoverageIncrementNode(path)) {
				if (path.node.loc && !makeCoverable(path.node.loc)) {
					path.remove();
				}
			}
		}
	});
	return generate(ast, {}, code).code;
}

function isCoverageIncrementNode(path: NodePath) {
	if (!path.isExpressionStatement()) {
		return false;
	}

	const expr = path.node.expression;
	if (expr.type !== 'UpdateExpression') {
		return false;
	}

	const updateExpr: UpdateExpression = expr as UpdateExpression;
	return (
		updateExpr.operator === '++' &&
		updateExpr.argument.type === 'MemberExpression' &&
		updateExpr.argument.object.type === 'MemberExpression' &&
		updateExpr.argument.object.object.type === 'CallExpression' &&
		updateExpr.argument.object.object.callee.type === 'Identifier' &&
		(updateExpr.argument.object.object.callee as Identifier).name.startsWith('cov_') &&
		updateExpr.argument.property.type === 'NumericLiteral'
	);
}
