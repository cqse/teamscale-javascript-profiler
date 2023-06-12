import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse, { NodePath, Node as TraverseNode } from '@babel/traverse';
import {
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
	isFunctionDeclaration,
	isSequenceExpression,
	SequenceExpression,
	isUpdateExpression
} from '@babel/types';
import { IllegalStateException } from '@cqse/commons';

const COVERAGE_OBJ_FUNCTION_NAME_PREFIX = 'cov_';

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
 * Generator for identifiers that are unique across files to instrument.
 * Relevant in case no Ecmascript modules are used.
 *
 * We assume that the files to be executed in a browser can
 * stem from different runs of the instrumenter. We have to decrease
 * the probability of colliding identifiers.
 */
const fileIdSeqGenerator: { next: () => string } = (() => {
	const instrumenterRunId = process.pid;
	let fileIdSeq = 0;

	return {
		next: () => {
			fileIdSeq++;
			let num: number;
			if (fileIdSeq < 10000) {
				num = instrumenterRunId * 10000 + fileIdSeq;
			} else if (fileIdSeq < 100000) {
				num = instrumenterRunId * 100000 + fileIdSeq;
			} else {
				throw new Error(`Not more that 100k files supported to be instrumented in one run.`);
			}
			return num.toString(36);
		}
	};
})();

function getIstanbulCoverageFunctionDeclarationName(node: TraverseNode | undefined): string | undefined {
	if (!isFunctionDeclaration(node)) {
		return undefined;
	}

	const functionName = node.id?.name;
	if (functionName?.startsWith(COVERAGE_OBJ_FUNCTION_NAME_PREFIX)) {
		return functionName;
	} else {
		return undefined;
	}
}

/**
 * Adds constants with the file id to the header of the file to process
 * which are then used in the coverage broadcast functions as arguments.
 *
 * For example, `_$f0` is introduced as `const _$f0 = "6822844a804c1e9986ac4bd4a45b85893bde8b33";`
 * based on
 * ```
 * function cov_oqh6rsgrd() {
 *   var path = '/home/user/test/casestudies/plain-ts/dist/main.js';
 *   var hash = '6822844a804c1e9986ac4bd4a45b85893bde8b33';
 *   ....
 * }
 * ```
 *
 * And then used in the code, for example, for translating from
 * `cov_oqh6rsgrd().s[6]++;` to `_$stmtCov(_$fid0, 6);`.
 */
type FileIdMappingHandler = {
	enterPath: (path: NodePath) => void;
	getFileHashForCoverageObjectId: (coverageObjectId: string) => string | undefined;
};
function createFileIdMappingHandler(): FileIdMappingHandler {
	const fileIdMap: Map<string, string> = new Map<string, string>();

	return {
		enterPath(path: NodePath): void {
			if (!isVariableDeclaration(path.node)) {
				return;
			}

			const grandParentPath = path.parentPath?.parentPath;
			const coverageFunctionName = getIstanbulCoverageFunctionDeclarationName(grandParentPath?.node);
			if (grandParentPath && coverageFunctionName) {
				const declaration = path.node;
				if (declaration.declarations.length === 1) {
					const declarator = declaration.declarations[0];
					if (isIdentifier(declarator.id) && declarator.id.name === 'hash') {
						// We take note of the hash that is stored within the `cov_*' function.
						const fileIdVarName = `_$f${fileIdSeqGenerator.next()}`;
						const fileId = (declarator.init as StringLiteral).value;
						fileIdMap.set(coverageFunctionName, fileIdVarName);
						grandParentPath.insertBefore(newStringConstDeclarationNode(fileIdVarName, fileId) as any);
					}
				}
			}
		},
		getFileHashForCoverageObjectId(coverageObjectId: string): string | undefined {
			return fileIdMap.get(coverageObjectId);
		}
	};
}

/**
 * Replace the existing IstanbulJS-Coverage statements by our own
 * coverage statements. Some original statements are removed completely
 * if the fraction of the code is not to be instrumented.
 */
type PartialInstrumentationHandler = {
	enterPath: (path: NodePath, makeCoverable: (location: SourceLocation) => boolean) => void;
};
function createPartialInstrumentationHandler(
	fileIdMappingHandler: FileIdMappingHandler
): PartialInstrumentationHandler {
	return {
		enterPath(path: NodePath, makeCoverable: (location: SourceLocation) => boolean): void {
			if (!isUpdateExpression(path.node)) {
				return;
			}

			const increment = extractCoverageIncrement(path.node);
			if (!increment) {
				return;
			}

			const wantCoverageIncrement =
				path.node.loc && makeCoverable(path.node.loc) && increment.type !== 'function';

			// Add a new coverage instrument if desired
			if (wantCoverageIncrement) {
				const fileIdVarName: string | undefined = fileIdMappingHandler.getFileHashForCoverageObjectId(
					increment.coverageObjectId
				);
				if (!fileIdVarName) {
					throw new IllegalStateException(
						`File ID variable for coverage object with ID ${increment.coverageObjectId} not found!`
					);
				}

				const insertAsExpression = isSequenceExpression(path.parent);
				insertNodeBefore(path, newCoverageIncrementNode(fileIdVarName, increment, insertAsExpression));
			}

			// Remove the existing coverage increment node
			path.remove();
		}
	};
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
	const fileIdMappingHandler = createFileIdMappingHandler();
	const partialInstrumentationHandler = createPartialInstrumentationHandler(fileIdMappingHandler);

	traverse(ast, {
		enter(path: NodePath) {
			fileIdMappingHandler.enterPath(path);
			partialInstrumentationHandler.enterPath(path, makeCoverable);
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
function insertNodeBefore(path: NodePath<TraverseNode>, toInsert: TraverseNode): void {
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
	};
}

/**
 * Creates a new coverage increment statement.
 */
function newCoverageIncrementNode(
	fileIdVarName: string,
	increment: CoverageIncrement,
	asExpression: boolean
): TraverseNode {
	let expression: CallExpression;
	if (increment.type === 'branch') {
		expression = newBranchCoverageIncrementExpression(fileIdVarName, increment as BranchCoverageIncrement);
	} else if (increment.type === 'statement') {
		expression = newStatementCoverageIncrementExpression(fileIdVarName, increment as StatementCoverageIncrement);
	} else {
		throw new Error(`Unexpected coverage increment type: ${increment.type}`);
	}

	if (asExpression) {
		return expression as TraverseNode;
	}

	return {
		type: 'ExpressionStatement',
		expression
	} as TraverseNode;
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
