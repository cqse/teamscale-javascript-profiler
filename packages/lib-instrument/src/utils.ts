import {
    CallExpression,
    Identifier,
    NumericLiteral, SourceLocation,
    VariableDeclaration
} from "@babel/types";
import {RawSourceMap} from "source-map";
import {NodePath} from "@babel/core";

export type InstrumentationOptions = Partial<{
    /** Report boolean value of logical expressions */
    reportLogic: boolean;

    /** Use an evaluated function to find coverageGlobalScope */
    coverageGlobalScopeFunc: boolean;

    /** Names of methods to ignore by default on classes */
    ignoreClassMethods: string[];

    /** The input source map, that maps the uninstrumented code back to the original code */
    inputSourceMap?: RawSourceMap;

    /** Token to add in the very beginning to indicate that the instrumentation has been performed */
    isInstrumentedToken?: string;

    /** Code to add before the instrumented input code */
    codeToPrepend?: string;

    /** Callback for determining if a given code fragment should be instrument */
    shouldInstrumentCallback?: (path: NodePath, loc: SourceLocation) => boolean;
}>;

export type CodeRange = {
    start: { line?: number; column?: number };
    end: { line?: number; column?: number };
};

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
 * Create a line coverage reporting statement node.
 */
export function newLineCoverageExpression(
    originFileId: string,
    range: CodeRange
): CallExpression {
    return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: '_$l' } as Identifier,
        arguments: [
            { type: 'Identifier', name: originFileId } as Identifier,
            { type: 'NumericLiteral', value: range.start.line } as NumericLiteral,
            { type: 'NumericLiteral', value: range.end.line } as NumericLiteral,
        ]
    };
}

