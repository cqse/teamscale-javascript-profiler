import {createHash} from 'crypto';
import {Node, NodePath, template} from '@babel/core';
import {Visitor} from "@babel/traverse";
import {defaults} from '@istanbuljs/schema';
import {
    ArrowFunctionExpression,
    BlockStatement, ClassMethod, Comment, ConditionalExpression,
    Expression, FunctionDeclaration, FunctionExpression,
    Identifier, IfStatement,
    LogicalExpression, ObjectMethod, Program,
    SequenceExpression, SourceLocation, Statement, SwitchCase,
    UpdateExpression
} from "@babel/types";

type BabelTypes = typeof import("@babel/types")

import {CodeRange, SourceCoverage} from './source-coverage';
import {SHA, MAGIC_KEY, MAGIC_VALUE} from './constants';
import {RawSourceMap} from "source-map";

// pattern for istanbul to ignore a section
const COMMENT_RE = /^\s*istanbul\s+ignore\s+(if|else|next)(?=\W|$)/;
// pattern for istanbul to ignore the whole file
const COMMENT_FILE_RE = /^\s*istanbul\s+ignore\s+(file)(?=\W|$)/;
// source map URL pattern
const SOURCE_MAP_RE = /[#@]\s*sourceMappingURL=(.*)\s*$/m;

// generate a variable name from hashing the supplied file path
function genVar(filename: string) {
    const hash = createHash(SHA);
    hash.update(filename);
    return 'cov_' + parseInt(hash.digest('hex').substr(0, 12), 16).toString(36);
}

type CovNode = Node & { __cov__?: Record<string, unknown> };

type LeafNode = { node: Node, parent: Node, property: string };

export type VisitorOutput = {
    fileCoverage?: unknown;
    sourceMappingURL?: unknown;
} | undefined;

// VisitState holds the state of the visitor, provides helper functions
// and is the `this` for the individual coverage visitors.
class VisitState {

    types: BabelTypes;
    varName: string;
    attrs: Record<string, unknown>;
    nextIgnore: Node | null;
    cov: SourceCoverage;
    ignoreClassMethods: string[];
    sourceMappingURL: string | null;
    reportLogic: boolean;

    constructor(
        types: BabelTypes,
        sourceFilePath: string,
        inputSourceMap: RawSourceMap | undefined,
        ignoreClassMethods: string[] = [],
        reportLogic = false
    ) {
        this.varName = genVar(sourceFilePath);
        this.attrs = {};
        this.nextIgnore = null;
        this.cov = new SourceCoverage(sourceFilePath);

        if (typeof inputSourceMap !== 'undefined') {
            this.cov.inputSourceMap(inputSourceMap);
        }
        this.ignoreClassMethods = ignoreClassMethods;
        this.types = types;
        this.sourceMappingURL = null;
        this.reportLogic = reportLogic;
    }

    // should we ignore the node? Yes, if specifically ignoring
    // or if the node is generated.
    shouldIgnore(path: NodePath): boolean {
        return this.nextIgnore !== null || !path.node.loc;
    }

    // extract the ignore comment hint (next|if|else) or null
    hintFor(node: Node): string | null {
        let hint: string | null = null;
        if (node.leadingComments) {
            node.leadingComments.forEach(c => {
                const v = (
                    c.value || /* istanbul ignore next: paranoid check */ ''
                ).trim();
                const groups = v.match(COMMENT_RE);
                if (groups) {
                    hint = groups[1];
                }
            });
        }
        return hint;
    }

    // extract a source map URL from comments and keep track of it
    maybeAssignSourceMapURL(node: Node) {
        const extractURL = comments => {
            if (!comments) {
                return;
            }
            comments.forEach(c => {
                const v = (
                    c.value || /* istanbul ignore next: paranoid check */ ''
                ).trim();
                const groups = v.match(SOURCE_MAP_RE);
                if (groups) {
                    this.sourceMappingURL = groups[1];
                }
            });
        };
        extractURL(node.leadingComments);
        extractURL(node.trailingComments);
    }

    // for these expressions the statement counter needs to be hoisted, so
    // function name inference can be preserved
    counterNeedsHoisting(path: NodePath): boolean {
        return (
            path.isFunctionExpression() ||
            path.isArrowFunctionExpression() ||
            path.isClassExpression()
        );
    }

    // all the generic stuff that needs to be done on enter for every node
    onEnter(path: NodePath) {
        const n = path.node;

        this.maybeAssignSourceMapURL(n);

        // if already ignoring, nothing more to do
        if (this.nextIgnore !== null) {
            return;
        }

        // check hint to see if ignore should be turned on
        const hint = this.hintFor(n);
        if (hint === 'next') {
            this.nextIgnore = n;
            return;
        }

        // else check custom node attribute set by a prior visitor
        if (this.getAttr(path.node, 'skip-all') !== null) {
            this.nextIgnore = n;
        }

        // else check for ignored class methods
        if (
            path.isFunctionExpression() &&
            this.ignoreClassMethods.some(
                name => path.node.id && name === path.node.id.name
            )
        ) {
            this.nextIgnore = n;
            return;
        }

        if (
            path.isClassMethod() &&
            this.ignoreClassMethods.some(name => name === (path.node.key as Identifier).name)
        ) {
            this.nextIgnore = n;
            return;
        }
    }

    // all the generic stuff on exit of a node,
    // including resetting ignores and custom node attrs
    onExit(path: NodePath) {
        // restore ignore status, if needed
        if (path.node === this.nextIgnore) {
            this.nextIgnore = null;
        }
        // nuke all attributes for the node
        delete (path.node as CovNode).__cov__;
    }

    // set a node attribute for the supplied node
    setAttr(node: CovNode, name: string, value: unknown) {
        node.__cov__ = node.__cov__ || {};
        node.__cov__[name] = value;
    }

    // retrieve a node attribute for the supplied node or null
    getAttr(node: CovNode, name: string): unknown {
        const c = node.__cov__;
        if (!c) {
            return null;
        }
        return c[name];
    }

    //
    increase(type: string, id: string | number, index: number | null): UpdateExpression {
        const T = this.types;
        const wrap: (expr: Expression) => Expression =
            index !== null
                ? // If `index` present, turn `x` into `x[index]`.
                x => T.memberExpression(x, T.numericLiteral(index), true)
                : x => x;
        return this.types.updateExpression(
            '++',
            wrap(
                T.memberExpression(
                    T.memberExpression(
                        T.callExpression(T.identifier(this.varName), []),
                        T.identifier(type)
                    ),
                    T.numericLiteral(id as number),
                    true
                )
            )
        );
    }

    // Reads the logic expression conditions and conditionally increments truthy counter.
    increaseTrue(type: string, id: string | number, index: number, node: Node): SequenceExpression {
        const T = this.types;
        const tempName = `${this.varName}_temp`;

        return T.sequenceExpression([
            T.assignmentExpression(
                '=',
                T.memberExpression(
                    T.callExpression(T.identifier(this.varName), []),
                    T.identifier(tempName)
                ),
                node as Expression // Only evaluates once.
            ),
            T.parenthesizedExpression(
                T.conditionalExpression(
                    this.validateTrueNonTrivial(T, tempName),
                    this.increase(type, id, index),
                    T.nullLiteral()
                )
            ),
            T.memberExpression(
                T.callExpression(T.identifier(this.varName), []),
                T.identifier(tempName)
            )
        ]);
    }

    validateTrueNonTrivial(T: BabelTypes, tempName: string): LogicalExpression {
        return T.logicalExpression(
            '&&',
            T.memberExpression(
                T.callExpression(T.identifier(this.varName), []),
                T.identifier(tempName)
            ),
            T.logicalExpression(
                '&&',
                T.parenthesizedExpression(
                    T.logicalExpression(
                        '||',
                        T.unaryExpression(
                            '!',
                            T.callExpression(
                                T.memberExpression(
                                    T.identifier('Array'),
                                    T.identifier('isArray')
                                ),
                                [
                                    T.memberExpression(
                                        T.callExpression(
                                            T.identifier(this.varName),
                                            []
                                        ),
                                        T.identifier(tempName)
                                    )
                                ]
                            )
                        ),
                        T.memberExpression(
                            T.memberExpression(
                                T.callExpression(
                                    T.identifier(this.varName),
                                    []
                                ),
                                T.identifier(tempName)
                            ),
                            T.identifier('length')
                        )
                    )
                ),
                T.parenthesizedExpression(
                    T.logicalExpression(
                        '||',
                        T.binaryExpression(
                            '!==',
                            T.callExpression(
                                T.memberExpression(
                                    T.identifier('Object'),
                                    T.identifier('getPrototypeOf')
                                ),
                                [
                                    T.memberExpression(
                                        T.callExpression(
                                            T.identifier(this.varName),
                                            []
                                        ),
                                        T.identifier(tempName)
                                    )
                                ]
                            ),
                            T.memberExpression(
                                T.identifier('Object'),
                                T.identifier('prototype')
                            )
                        ),
                        T.memberExpression(
                            T.callExpression(
                                T.memberExpression(
                                    T.identifier('Object'),
                                    T.identifier('values')
                                ),
                                [
                                    T.memberExpression(
                                        T.callExpression(
                                            T.identifier(this.varName),
                                            []
                                        ),
                                        T.identifier(tempName)
                                    )
                                ]
                            ),
                            T.identifier('length')
                        )
                    )
                )
            )
        );
    }

    insertCounter(path: NodePath, increment: Expression): void {
        const T = this.types;
        if (path.isBlockStatement()) {
            path.node.body.unshift(T.expressionStatement(increment));
        } else if (path.isStatement()) {
            path.insertBefore(T.expressionStatement(increment));
        } else if (
            this.counterNeedsHoisting(path) &&
            T.isVariableDeclarator(path.parent)
        ) {
            // make an attempt to hoist the statement counter, so that
            // function names are maintained.
            const grandParentPath = path.parentPath?.parentPath;
            if (grandParentPath && T.isExportNamedDeclaration(grandParentPath.parent)) {
                grandParentPath.parentPath?.insertBefore(
                    T.expressionStatement(increment)
                );
            } else if (
                grandParentPath &&
                (T.isProgram(grandParentPath.parent) ||
                    T.isBlockStatement(grandParentPath.parent))
            ) {
                grandParentPath.insertBefore(T.expressionStatement(increment));
            } else {
                path.replaceWith(T.sequenceExpression([increment, path.node as Expression]));
            }
        } /* istanbul ignore else: not expected */ else if (
            path.isExpression()
        ) {
            path.replaceWith(T.sequenceExpression([increment, path.node]));
        } else {
            console.error(
                'Unable to insert counter for node type:',
                path.node.type
            );
        }
    }

    insertStatementCounter(path: NodePath) {
        /* istanbul ignore if: paranoid check */
        if (!(path.node?.loc)) {
            return;
        }
        const index = this.cov.newStatement(path.node.loc);
        const increment = this.increase('s', index, null);
        this.insertCounter(path, increment);
    }

    insertFunctionCounter(path: NodePath<CallableNode>) {
        const T = this.types;

        if (!(path.node?.loc)) {
            return;
        }
        const n = path.node;

        // get location for declaration
        let declarationLocation: CodeRange | undefined;
        switch (n.type) {
            case 'FunctionDeclaration':
            case 'FunctionExpression':
                /* istanbul ignore else: paranoid check */
                if (n.id) {
                    declarationLocation = n.id.loc ?? undefined;
                }
                break;
        }

        if (!declarationLocation) {
            declarationLocation = {
                start: n.loc!.start,
                end: { line: n.loc!.start.line, column: n.loc!.start.column + 1 }
            };
        }

        const name = getName(path.node);
        const index = this.cov.newFunction(name, declarationLocation, path.node.body.loc ?? undefined);
        const increment = this.increase('f', index, null);
        const body = path.get('body') as NodePath;

        /* istanbul ignore else: not expected */
        if (body.isBlockStatement()) {
            body.node.body.unshift(T.expressionStatement(increment));
        } else {
            console.error(
                'Unable to process function body node type:',
                path.node.type
            );
        }
    }

    getBranchIncrement(branchId: string | number, loc) {
        const index = this.cov.addBranchPath(branchId, loc);
        return this.increase('b', branchId, index);
    }

    getBranchLogicIncrement(path: { node: Node }, branchId: string | number, loc: SourceLocation | null | undefined) {
        const index = this.cov.addBranchPath(branchId, loc ?? undefined);
        return [
            this.increase('b', branchId, index),
            this.increaseTrue('bT', branchId, index, path.node)
        ];
    }

    insertBranchCounter(path: NodePath, branchName: number, loc: SourceLocation | null | undefined) {
        const increment = this.getBranchIncrement(
            branchName,
            loc ?? path.node.loc
        );
        this.insertCounter(path, increment);
    }

    findLeaves(node: Node, accumulator: LeafNode[], parent: Node | undefined, property: string | undefined) {
        if (!node) {
            return;
        }

        if (node.type === 'LogicalExpression') {
            const hint = this.hintFor(node);
            if (hint !== 'next') {
                this.findLeaves(node.left, accumulator, node, 'left');
                this.findLeaves(node.right, accumulator, node, 'right');
            }
        } else {
            accumulator.push({
                node,
                parent: parent!,
                property: property!
            });
        }
    }
}

// generic function that takes a set of visitor methods and
// returns a visitor object with `enter` and `exit` properties,
// such that:
//
// * standard entry processing is done
// * the supplied visitors are called only when ignore is not in effect
//   This relieves them from worrying about ignore states and generated nodes.
// * standard exit processing is done
//
function entries(...enter) {
    // the enter function
    const wrappedEntry = function (this: VisitState, path: NodePath, node: Node) {
        this.onEnter(path);
        if (this.shouldIgnore(path)) {
            return;
        }
        enter.forEach(e => {
            e.call(this, path, node);
        });
    };
    const exit = function (this: VisitState, path: NodePath) {
        this.onExit(path);
    };
    return {
        enter: wrappedEntry,
        exit
    };
}

function coverStatement(this: VisitState, path: NodePath) {
    this.insertStatementCounter(path);
}

/* istanbul ignore next: no node.js support */
function coverAssignmentPattern(this: VisitState, path: NodePath) {
    const n = path.node;
    const b = this.cov.newBranch('default-arg', n.loc);
    this.insertBranchCounter(path.get('right') as NodePath, b, undefined);
}

type CallableNode = ArrowFunctionExpression
    | ClassMethod
    | ObjectMethod
    | FunctionDeclaration
    | FunctionExpression;

function coverFunction(this: VisitState, path: NodePath<CallableNode>) {
    this.insertFunctionCounter(path);
}

function coverVariableDeclarator(this: VisitState, path: NodePath) {
    this.insertStatementCounter(path.get('init') as NodePath);
}

function coverClassPropDeclarator(this: VisitState, path: NodePath) {
    this.insertStatementCounter(path.get('value') as NodePath);
}

function makeBlock(this: VisitState, path: NodePath) {
    const T = this.types;
    if (!path.node) {
        path.replaceWith(T.blockStatement([]));
    }

    if (!path.isBlockStatement()) {
        path.replaceWith(T.blockStatement([path.node as Statement]));

        const block = path.node as BlockStatement;
        path.node.loc = block.body[0].loc;
        block.body[0].leadingComments = path.node.leadingComments;
        path.node.leadingComments = undefined;
    }
}

function blockProp(prop) {
    return function (this: VisitState, path: NodePath) {
        makeBlock.call(this, path.get(prop) as NodePath);
    };
}

function makeParenthesizedExpressionForNonIdentifier(this: VisitState, path: NodePath) {
    const T = this.types;
    if (path.node && !path.isIdentifier()) {
        path.replaceWith(T.parenthesizedExpression(path.node as Expression));
    }
}

function parenthesizedExpressionProp(prop) {
    return function (this: VisitState, path: NodePath) {
        makeParenthesizedExpressionForNonIdentifier.call(this, path.get(prop) as NodePath);
    };
}

function convertArrowExpression(this: VisitState, path: NodePath<ArrowFunctionExpression>) {
    const node = path.node;
    const T = this.types;
    if (!T.isBlockStatement(node.body)) {
        const bloc = node.body.loc;
        if (node.expression === true) {
            node.expression = false;
        }
        node.body = T.blockStatement([T.returnStatement(node.body)]);
        // restore body location
        node.body.loc = bloc;
        // set up the location for the return statement so it gets
        // instrumented
        node.body.body[0].loc = bloc;
    }
}

function coverIfBranches(this: VisitState, path: NodePath<IfStatement>) {
    const n = path.node;
    const hint = this.hintFor(n);
    const ignoreIf = hint === 'if';
    const ignoreElse = hint === 'else';
    const branch = this.cov.newBranch('if', n.loc);

    if (ignoreIf) {
        this.setAttr(n.consequent, 'skip-all', true);
    } else {
        this.insertBranchCounter(path.get('consequent'), branch, n.loc);
    }

    if (ignoreElse) {
        this.setAttr(n.alternate!, 'skip-all', true);
    } else {
        this.insertBranchCounter(path.get('alternate') as NodePath, branch, undefined);
    }
}

function createSwitchBranch(this: VisitState, path: NodePath) {
    const b = this.cov.newBranch('switch', path.node.loc);
    this.setAttr(path.node, 'branchName', b);
}

function coverSwitchCase(this: VisitState, path: NodePath<SwitchCase>) {
    const T = this.types;
    const b = this.getAttr(path.parentPath.node, 'branchName') as (string | number);
    if (b === null) {
        throw new Error('Unable to get switch branch name');
    }

    const increment = this.getBranchIncrement(b, path.node.loc);
    path.node.consequent.unshift(T.expressionStatement(increment));
}

function coverTernary(this: VisitState, path: NodePath<ConditionalExpression>) {
    const n = path.node;
    const branch = this.cov.newBranch('cond-expr', path.node.loc);
    const cHint = this.hintFor(n.consequent);
    const aHint = this.hintFor(n.alternate);

    if (cHint !== 'next') {
        this.insertBranchCounter(path.get('consequent'), branch, undefined);
    }

    if (aHint !== 'next') {
        this.insertBranchCounter(path.get('alternate'), branch, undefined);
    }
}

function coverLogicalExpression(this: VisitState, path: NodePath<LogicalExpression>) {
    const T = this.types;
    if (path.parentPath.node.type === 'LogicalExpression') {
        return; // already processed
    }

    const leaves: LeafNode[] = [];
    this.findLeaves(path.node, leaves, undefined, undefined);

    const branchId = this.cov.newBranch(
        'binary-expr',
        path.node.loc,
        this.reportLogic
    );

    for (const leaf of leaves) {
        const hint = this.hintFor(leaf.node);
        if (hint === 'next') {
            continue;
        }

        if (this.reportLogic) {
            const increment = this.getBranchLogicIncrement(
                leaf,
                branchId,
                leaf.node.loc
            );
            if (!increment[0]) {
                continue;
            }
            leaf.parent[leaf.property] = T.sequenceExpression([
                increment[0],
                increment[1]
            ]);
            continue;
        }

        const increment = this.getBranchIncrement(branchId, leaf.node.loc);
        if (!increment) {
            continue;
        }

        leaf.parent[leaf.property] = T.sequenceExpression([
            increment,
            leaf.node as Expression
        ]);
    }
}

const codeVisitor: Visitor = {
    ArrowFunctionExpression: entries(convertArrowExpression, coverFunction),
    AssignmentPattern: entries(coverAssignmentPattern),
    BlockStatement: entries(), // ignore processing only
    ExportDefaultDeclaration: entries(), // ignore processing only
    ExportNamedDeclaration: entries(), // ignore processing only
    ClassMethod: entries(coverFunction),
    ClassDeclaration: entries(parenthesizedExpressionProp('superClass')),
    ClassProperty: entries(coverClassPropDeclarator),
    ClassPrivateProperty: entries(coverClassPropDeclarator),
    ObjectMethod: entries(coverFunction),
    ExpressionStatement: entries(coverStatement),
    BreakStatement: entries(coverStatement),
    ContinueStatement: entries(coverStatement),
    DebuggerStatement: entries(coverStatement),
    ReturnStatement: entries(coverStatement),
    ThrowStatement: entries(coverStatement),
    TryStatement: entries(coverStatement),
    VariableDeclaration: entries(), // ignore processing only
    VariableDeclarator: entries(coverVariableDeclarator),
    IfStatement: entries(
        blockProp('consequent'),
        blockProp('alternate'),
        coverStatement,
        coverIfBranches
    ),
    ForStatement: entries(blockProp('body'), coverStatement),
    ForInStatement: entries(blockProp('body'), coverStatement),
    ForOfStatement: entries(blockProp('body'), coverStatement),
    WhileStatement: entries(blockProp('body'), coverStatement),
    DoWhileStatement: entries(blockProp('body'), coverStatement),
    SwitchStatement: entries(createSwitchBranch, coverStatement),
    SwitchCase: entries(coverSwitchCase),
    WithStatement: entries(blockProp('body'), coverStatement),
    FunctionDeclaration: entries(coverFunction),
    FunctionExpression: entries(coverFunction),
    LabeledStatement: entries(coverStatement),
    ConditionalExpression: entries(coverTernary),
    LogicalExpression: entries(coverLogicalExpression)
};

const globalTemplateAlteredFunction = template(`
        var Function = (function(){}).constructor;
        var global = (new Function(GLOBAL_COVERAGE_SCOPE))();
`);
const globalTemplateFunction = template(`
        var global = (new Function(GLOBAL_COVERAGE_SCOPE))();
`);
const globalTemplateVariable = template(`
        var global = GLOBAL_COVERAGE_SCOPE;
`);
// the template to insert at the top of the program.
const coverageTemplate = template(
    `
    function COVERAGE_FUNCTION () {
        var path = PATH;
        var hash = HASH;
        GLOBAL_COVERAGE_TEMPLATE
        var gcv = GLOBAL_COVERAGE_VAR;
        var coverageData = INITIAL;
        var coverage = global[gcv] || (global[gcv] = {});
        if (!coverage[path] || coverage[path].hash !== hash) {
            coverage[path] = coverageData;
        }

        var actualCoverage = coverage[path];
        {
            // @ts-ignore
            COVERAGE_FUNCTION = function () {
                return actualCoverage;
            }
        }

        return actualCoverage;
    }
`,
    {preserveComments: true}
);
// the rewire plugin (and potentially other babel middleware)
// may cause files to be instrumented twice, see:
// https://github.com/istanbuljs/babel-plugin-istanbul/issues/94
// we should only instrument code for coverage the first time
// it's run through istanbul-lib-instrument.
function alreadyInstrumented(path: NodePath, visitState): boolean {
    return path.scope.hasBinding(visitState.varName);
}

function getParentComments(path: NodePath | null): Array<Comment> {
    if (!path?.parent) {
        return [];
    }

    if (!('comments' in path.parent)) {
        return [];
    }

    return path.parent.comments as Array<Comment>;
}

function shouldIgnoreFile(programNodePath: NodePath | null): boolean {
    if (!programNodePath) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return getParentComments(programNodePath).some(c => COMMENT_FILE_RE.test(c.value));
}

function getName(node: Node | null): string | undefined {
    if (node) {
        if ('id' in node && node.id && 'name' in node.id!) {
            return node.id.name;
        }
        if ('name' in node) {
            return node.name as string;
        }
    }

    return undefined;
}

export type ProgramVisitorOptions = {
    /** the global coverage variable name */
    coverageVariable: string;

    /** report boolean value of logical expressions */
    reportLogic: boolean;

    /** the global coverage variable scope (default: `this`) */
    coverageGlobalScope: string;

    /** use an evaluated function to find coverageGlobalScope */
    coverageGlobalScopeFunc: boolean;

    /** names of methods to ignore by default on classes */
    ignoreClassMethods: string[];

    /** the input source map, that maps the uninstrumented code back to the original code */
    inputSourceMap?: RawSourceMap;
};

/**
 * programVisitor is a `babel` adaptor for instrumentation.
 *
 * It returns an object with two methods `enter` and `exit`.
 * These should be assigned to or called from `Program` entry and exit functions
 * in a babel visitor.
 * These functions do not make assumptions about the state set by Babel and thus
 * can be used in a context other than a Babel plugin.
 *
 * The exit function returns an object that currently has the following keys:
 *
 * `fileCoverage` - the file coverage object created for the source file.
 * `sourceMappingURL` - any source mapping URL found when processing the file.
 *
 * @param types - an instance of babel-types.
 * @param sourceFilePath - the path to source file.
 * @param opts - additional options.
 */
export function programVisitor(types: BabelTypes, sourceFilePath = 'unknown.js', opts: ProgramVisitorOptions) {
    const T = types;
    opts = {
        ...defaults.instrumentVisitor,
        ...opts
    };
    const visitState = new VisitState(
        types,
        sourceFilePath,
        opts.inputSourceMap,
        opts.ignoreClassMethods,
        opts.reportLogic
    );

    return {
        enter(path: NodePath<Program>): void {
            if (shouldIgnoreFile(path.find(p => p.isProgram()))) {
                return;
            }
            if (alreadyInstrumented(path, visitState)) {
                return;
            }
            path.traverse(codeVisitor, visitState);
        },
        exit(path: NodePath<Program>) {
            if (alreadyInstrumented(path, visitState)) {
                return undefined;
            }

            visitState.cov.freeze();
            const coverageData = visitState.cov.toJSON();
            if (shouldIgnoreFile(path.find(p => p.isProgram()))) {
                return {
                    fileCoverage: coverageData,
                    sourceMappingURL: visitState.sourceMappingURL
                };
            }
            coverageData[MAGIC_KEY] = MAGIC_VALUE;
            const hash = createHash(SHA)
                .update(JSON.stringify(coverageData))
                .digest('hex');
            coverageData.hash = hash;
            if (
                coverageData.inputSourceMap &&
                Object.getPrototypeOf(coverageData.inputSourceMap) !==
                Object.prototype
            ) {
                coverageData.inputSourceMap = {
                    ...coverageData.inputSourceMap
                };
            }
            const coverageNode = T.valueToNode(coverageData);
            delete coverageData[MAGIC_KEY];
            delete coverageData.hash;
            let gvTemplate;
            if (opts.coverageGlobalScopeFunc) {
                if (path.scope.getBinding('Function')) {
                    gvTemplate = globalTemplateAlteredFunction({
                        GLOBAL_COVERAGE_SCOPE: T.stringLiteral(
                            'return ' + opts.coverageGlobalScope
                        )
                    });
                } else {
                    gvTemplate = globalTemplateFunction({
                        GLOBAL_COVERAGE_SCOPE: T.stringLiteral(
                            'return ' + opts.coverageGlobalScope
                        )
                    });
                }
            } else {
                gvTemplate = globalTemplateVariable({
                    GLOBAL_COVERAGE_SCOPE: opts.coverageGlobalScope
                });
            }
            const cv = coverageTemplate({
                GLOBAL_COVERAGE_VAR: T.stringLiteral(opts.coverageVariable),
                GLOBAL_COVERAGE_TEMPLATE: gvTemplate,
                COVERAGE_FUNCTION: T.identifier(visitState.varName),
                PATH: T.stringLiteral(sourceFilePath),
                INITIAL: coverageNode,
                HASH: T.stringLiteral(hash)
            });

            // explicitly call this.varName to ensure coverage is always initialized
            const body = path.node.body;
            body.unshift(
                T.expressionStatement(
                    T.callExpression(T.identifier(visitState.varName), [])
                )
            );
            body.unshift(cv as Statement);

            return {
                fileCoverage: coverageData,
                sourceMappingURL: visitState.sourceMappingURL
            };
        }
    };
}