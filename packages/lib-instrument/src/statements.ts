import {
    CallExpression,
    Expression,
    ExpressionStatement, Identifier,
    isSequenceExpression, NumericLiteral, sequenceExpression,
    SequenceExpression, VariableDeclaration
} from "@babel/types";
import {NodePath} from "@babel/core";
import {CodeRange} from "./source-coverage";

type CoverageIncrement = {
    originFileId: string;
    covers: CodeRange;
};

/**
 * We cannot just run `path.insertBefore` to add a new element to an AST.
 * See https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-inserting-a-sibling-node .
 *
 * Special handling for some container nodes is needed.
 */
export function insertNodeBefore(path: NodePath<Node>, toInsert: Expression | ExpressionStatement): void {
    if (isSequenceExpression(path.parent)) {
        (path.parentPath as NodePath<SequenceExpression>).unshiftContainer('expressions', [toInsert as Expression]);
    } else {
        path.insertBefore(toInsert);
    }
}

/**
 * Create a branch coverage increment node.
 */
export function newBranchCoverageExpression(originFileId: string, range: CodeRange): CallExpression {
    // TODO: Use the source map to determine the original code
    return newRangeCoverageExpression('_$b', originFileId, range);
}

/**
 * Create a statement coverage increment node.
 */
export function newStatementCoverageExpression(originFileId: string, range: CodeRange): CallExpression {
    // TODO: Use the source map to determine the original code
    return newRangeCoverageExpression('_$s', originFileId, range);
}

/**
 * Create a function coverage reporting statement node.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function newFunctionCoverageExpression(originFileId: string, range: CodeRange, declarationRange: CodeRange): CallExpression {
    // TODO: Use the source map to determine the original code
    return newRangeCoverageExpression('_$f', originFileId, range);
}

/**
 * Creates a new string constant AST node.
 */
export function newStringConstDeclarationNode(name: string, value: string): VariableDeclaration {
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
 * Create a function coverage reporting statement node.
 */
function newRangeCoverageExpression(
    coverageFunctionName: string,
    originFileId: string,
    range: CodeRange
): CallExpression {
    return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: coverageFunctionName } as Identifier,
        arguments: [
            { type: 'Identifier', name: originFileId } as Identifier,
            { type: 'NumericLiteral', value: range.start.line } as NumericLiteral,
            { type: 'NumericLiteral', value: range.start.column } as NumericLiteral,
            { type: 'NumericLiteral', value: range.end.line } as NumericLiteral,
            { type: 'NumericLiteral', value: range.end.column } as NumericLiteral,
        ]
    };
}

export function newLineRangeCoverageExpression(
    increment: CoverageIncrement
): Expression {
    if (increment.covers.start.line == increment.covers.end.line) {
        return newSingleLineCoverageExpression(increment.originFileId, increment.covers.start.line!);
    }

    const result: Expression[] = [];
    for (let line= increment.covers.start.line!; line<increment.covers.end.line!; line++) {
        result.push(newSingleLineCoverageExpression(increment.originFileId, line));
    }

    return sequenceExpression(result);
}

export function newSingleLineCoverageExpression(originFileId: string, line: number): Expression {
    return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: '_$l' } as Identifier,
        arguments: [
            { type: 'Identifier', name: originFileId } as Identifier,
            { type: 'NumericLiteral', value: line } as NumericLiteral,
        ]
    };
}

