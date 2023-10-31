import {ParseResult, parseSync, traverse} from '@babel/core';
import {defaults} from '@istanbuljs/schema';

import {MAGIC_KEY, MAGIC_VALUE} from './constants';
import {CodeRange} from "./source-coverage";

export type IstanbulCoverageObject = {
    path: string;
    hash: string;
    gcv: string;
    coverageData: CoverageData;
}

export interface BranchMapping {
    loc: CodeRange;
    type: string;
    locations: CodeRange[];
    line?: number;
}

export interface FunctionMapping {
    name: string;
    decl: CodeRange;
    loc: CodeRange;
    line?: number;
}

export type CoverageData = {
    path: string;
    statementMap: { [key: string]: CodeRange };
    fnMap: { [key: string]: FunctionMapping };
    branchMap: { [key: string]: BranchMapping };
    s: { [key: string]: number };
    f: { [key: string]: number };
    b: { [key: string]: number[] };
    inputSourceMap: object,
    _coverageSchema?: string,
    hash?: string
}

/**
 * Return an AST for the given code object, which might already be an AST.
 */
function getAst(code: string | object) {
    if (typeof code === 'object' &&
        'type' in code &&
        typeof code.type === 'string') {
        // Assume code is already a babel ast.
        return code as ParseResult;
    }

    if (typeof code !== 'string') {
        throw new Error('Code must be a string');
    }

    // Parse as leniently as possible
    return parseSync(code, {
        babelrc: false,
        configFile: false,
        parserOpts: {
            allowAwaitOutsideFunction: true,
            allowImportExportEverywhere: true,
            allowReturnOutsideFunction: true,
            allowSuperOutsideMethod: true,
            sourceType: 'script',
            plugins: defaults.instrumenter.parserPlugins
        }
    });
}

export function readInitialCoverage(code: string | object): IstanbulCoverageObject | null {
    const ast = getAst(code);
    if (!ast) {
        return null;
    }

    let covScope;
    traverse(ast, {
        ObjectProperty(path) {
            const {node} = path;
            if (
                !node.computed &&
                path.get('key').isIdentifier() &&
                'name' in node.key &&
                node.key.name === MAGIC_KEY
            ) {
                const magicValue = path.get('value').evaluate();
                if (!magicValue.confident || magicValue.value !== MAGIC_VALUE) {
                    return;
                }
                covScope =
                    path.scope.getFunctionParent() ||
                    path.scope.getProgramParent();
                path.stop();
            }
        }
    });

    if (!covScope) {
        return null;
    }

    const result: Partial<IstanbulCoverageObject> = {};

    for (const key of ['path', 'hash', 'gcv', 'coverageData']) {
        const binding = covScope.getOwnBinding(key);
        if (!binding) {
            return null;
        }
        const valuePath = binding.path.get('init');
        const value = valuePath.evaluate();
        if (!value.confident) {
            return null;
        }
        result[key] = value.value;
    }


    delete result.coverageData?.[MAGIC_KEY];
    delete result.coverageData?.hash;

    return result as IstanbulCoverageObject;
}
