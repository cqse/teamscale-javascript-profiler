import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse, { NodePath } from '@babel/traverse';
import {
	Node,
	CallExpression,
	Identifier,
	isCallExpression,
	isIdentifier,
	isMemberExpression,
	NumericLiteral,
	SourceLocation,
	UpdateExpression,
	StringLiteral,
	isVariableDeclaration,
	VariableDeclaration,
	VariableDeclarator,
	isFunctionDeclaration,
	ExpressionStatement,
	isSequenceExpression,
	SequenceExpression
} from '@babel/types';
import { IllegalStateException } from '@cqse/commons';

const COVERAGE_OBJ_FUNCTION_NAME_PREFIX = 'cov_';

function isUpdateExpressionPath(path: NodePath<any>): path is NodePath<UpdateExpression> {
	return path.node.type === 'UpdateExpression';
}

type CoverageIncrement = {
	type: 'statement' | 'branch' | 'function';
	coverageObjectId: string;
};

type StatementCoverageIncrement = CoverageIncrement & {
	type: 'statement';
	statementId: number;
};

type BranchCoverageIncrement = CoverageIncrement & {
	type: 'branch';
	branchId: number;
	locationId: number;
};

type FunctionCoverageIncrement = CoverageIncrement & {
	type: 'function';
	functionId: number;
};

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

	const fileIdMap: Map<string, string> = new Map<string, string>();
	let fileIdSeq = 0;

	traverse(ast, {
		enter(path: NodePath) {
			const grandParentPath = path.parentPath?.parentPath;
			if (isFunctionDeclaration(grandParentPath?.node)) {
				const functionName = (grandParentPath?.node.id as Identifier).name;
				if (functionName?.startsWith(COVERAGE_OBJ_FUNCTION_NAME_PREFIX)) {
					if (isVariableDeclaration(path.node)) {
						const declaration = path.node as VariableDeclaration;
						if (declaration.declarations.length === 1) {
							const declarator = declaration.declarations[0] as VariableDeclarator;
							if ((declarator.id as Identifier).name === 'hash') {
								// We take note of the hash that is stored within the `cov_*' function.
								const fileIdVarName = `_$fid${fileIdSeq++}`;
								const fileId = (declarator.init as StringLiteral).value;
								fileIdMap.set(functionName, fileIdVarName);
								grandParentPath?.insertBefore(
									newStringConstDeclarationNode(fileIdVarName, fileId) as any
								);
							}
						}
					}
				}
			} else if (isUpdateExpressionPath(path)) {
				const increment = extractCoverageIncrement(path.node);
				if (increment) {
					const wantCoverageIncrement =
						path.node.loc && makeCoverable(path.node.loc) && increment.type !== 'function';

					const insertAsExpression = isSequenceExpression(path.parent);

					// Add a new coverage instrument if desired
					if (wantCoverageIncrement) {
						const fileIdVarName: string | undefined = fileIdMap.get(increment.coverageObjectId);
						if (!fileIdVarName) {
							throw new IllegalStateException(
								`File ID variable for coverage object with ID ${increment.coverageObjectId} not found!`
							);
						}

						insertNodeBefore(path, newCoverageIncrementNode(fileIdVarName, increment, insertAsExpression));
					}

					// Remove the existing coverage increment node
					path.remove();
				}
			}
		}
	});
	return generate(ast, {}, code).code;
}

/**
 * We cannot just run `path.insertBefore` to add a new element to an AST.
 * See https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-inserting-a-sibling-node .
 *
 * Special handling for some container nodes is needed.
 */
function insertNodeBefore(path: NodePath<Node>, toInsert: Node): void {
	if (isSequenceExpression(path.parent)) {
		(path.parentPath as NodePath<SequenceExpression>).unshiftContainer('expressions', [toInsert]);
	} else {
		path.insertBefore(toInsert);
	}
}

/**
 * Creates a new string constant AST node.
 */
function newStringConstDeclarationNode(name: string, value: string): VariableDeclaration {
	return {
		type: 'VariableDeclaration',
		kind: 'const',
		declarations: [
			{
				type: 'VariableDeclarator',
				id: {
					type: 'Identifier',
					name
				},
				init: {
					type: 'StringLiteral',
					value
				}
			}
		]
	} as VariableDeclaration;
}

/**
 * Creates a new coverage increment statement.
 */
function newCoverageIncrementNode(fileIdVarName: string, increment: CoverageIncrement, asExpression: boolean): Node {
	let expression: CallExpression;
	if (increment.type === 'branch') {
		expression = newBranchCoverageIncrementExpression(fileIdVarName, increment as BranchCoverageIncrement);
	} else if (increment.type === 'statement') {
		expression = newStatementCoverageIncrementExpression(fileIdVarName, increment as StatementCoverageIncrement);
	} else {
		throw new Error(`Unexpected coverage increment type: ${increment.type}`);
	}

	if (asExpression) {
		return expression;
	}

	return {
		type: 'ExpressionStatement',
		expression
	} as ExpressionStatement;
}

/**
 * Create a branch coverage increment node.
 */
function newBranchCoverageIncrementExpression(
	fileIdVarName: string,
	increment: BranchCoverageIncrement
): CallExpression {
	return {
		type: 'CallExpression',
		callee: { type: 'Identifier', name: '_$brCov' } as Identifier,
		arguments: [
			{ type: 'Identifier', name: fileIdVarName } as Identifier,
			{ type: 'NumericLiteral', value: increment.branchId } as NumericLiteral,
			{ type: 'NumericLiteral', value: increment.locationId } as NumericLiteral
		]
	};
}

/**
 * Create a statement coverage increment node.
 */
function newStatementCoverageIncrementExpression(
	fileIdVarName: string,
	increment: StatementCoverageIncrement
): CallExpression {
	return {
		type: 'CallExpression',
		callee: { type: 'Identifier', name: '_$stmtCov' } as Identifier,
		arguments: [
			{ type: 'Identifier', name: fileIdVarName } as Identifier,
			{ type: 'NumericLiteral', value: increment.statementId } as NumericLiteral
		]
	};
}

/**
 * Returns the call expression from `cov_2pvvu1hl8v().b[2][0]++;` if
 * the given UpdateExpression is a branch coverage update expression.
 */
function extractBranchCoverageIncrement(expr: UpdateExpression): BranchCoverageIncrement | null {
	if (
		expr.operator === '++' &&
		isMemberExpression(expr.argument) &&
		isMemberExpression(expr.argument.object) &&
		isMemberExpression(expr.argument.object.object) &&
		isCallExpression(expr.argument.object.object.object) &&
		isCoverageObjectCall(expr.argument.object.object.object)
	) {
		const coverageObjectId = ((expr.argument.object.object.object as CallExpression).callee as Identifier).name;
		const branchId = (expr.argument.object.property as NumericLiteral).value;
		const locationId = (expr.argument.property as NumericLiteral).value;
		return { type: 'branch', branchId, locationId, coverageObjectId };
	}

	return null;
}

/**
 * Returns the call expression from `cov_104fq7oo4i().s[0]++;` if
 * the given UpdateExpression is a statement coverage update expression.
 */
function extractStatementCoverageIncrement(expr: UpdateExpression): StatementCoverageIncrement | null {
	if (
		expr.operator === '++' &&
		isMemberExpression(expr.argument) &&
		isMemberExpression(expr.argument.object) &&
		isCallExpression(expr.argument.object.object) &&
		isIdentifier(expr.argument.object.property) &&
		expr.argument.object.property.name === 's' &&
		isCoverageObjectCall(expr.argument.object.object)
	) {
		const coverageObjectId = ((expr.argument.object.object as CallExpression).callee as Identifier).name;
		const statementId = (expr.argument.property as NumericLiteral).value;
		return { type: 'statement', statementId, coverageObjectId };
	}

	return null;
}

/**
 * Returns the call expression from `cov_104fq7oo4i().f[0]++;` if
 * the given UpdateExpression is a function coverage update expression.
 */
function extractFunctionCoverageIncrement(expr: UpdateExpression): FunctionCoverageIncrement | null {
	if (
		expr.operator === '++' &&
		isMemberExpression(expr.argument) &&
		isMemberExpression(expr.argument.object) &&
		isCallExpression(expr.argument.object.object) &&
		isIdentifier(expr.argument.object.property) &&
		expr.argument.object.property.name === 'f' &&
		isCoverageObjectCall(expr.argument.object.object)
	) {
		const coverageObjectId = ((expr.argument.object.object as CallExpression).callee as Identifier).name;
		const functionId = (expr.argument.property as NumericLiteral).value;
		return { type: 'function', functionId, coverageObjectId };
	}

	return null;
}

/**
 * Given an `UpdateExpression` extract the call expression returning the coverage object.
 */
function extractCoverageIncrement(expr: UpdateExpression): CoverageIncrement | null {
	return (
		extractBranchCoverageIncrement(expr) ??
		extractStatementCoverageIncrement(expr) ??
		extractFunctionCoverageIncrement(expr)
	);
}

/**
 * Check if the given call expression is a coverage call expression.
 * If this is not the case return `undefined`, and the call expression itself otherwise.
 */
function isCoverageObjectCall(callExpression: CallExpression | undefined): boolean {
	return (
		callExpression !== undefined &&
		isIdentifier(callExpression.callee) &&
		callExpression.callee.name.startsWith(COVERAGE_OBJ_FUNCTION_NAME_PREFIX)
	);
}
