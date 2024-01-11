import {Node, NodePath, parse} from '@babel/core';
import {Visitor} from "@babel/traverse";
import {
    ArrowFunctionExpression,
    BlockStatement, CallExpression, ClassMethod, Comment, ConditionalExpression,
    Expression, FunctionDeclaration, FunctionExpression,
    Identifier, IfStatement,
    LogicalExpression, NumericLiteral, ObjectMethod, Program,
    SourceLocation, Statement, SwitchCase, VariableDeclaration
} from "@babel/types";

type BabelTypes = typeof import("@babel/types")

import {SourceMapConsumer} from "source-map";
import {CodeRange} from "./utils";
import {SourceOrigins} from "./origins";
import {InstrumentationOptions} from "./utils";

// Pattern for istanbul to ignore a section
const COMMENT_RE = /^\s*istanbul\s+ignore\s+(if|else|next)(?=\W|$)/;

// Pattern for istanbul to ignore the whole file
const COMMENT_FILE_RE = /^\s*istanbul\s+ignore\s+(file)(?=\W|$)/;

type CovNode = Node & { __cov__?: Record<string, unknown> };

type LeafNode = { node: Node, parent: Node, property: string };

/**
 * `VisitState` holds the state of the visitor, provides helper functions
 * and is the `this` for the individual coverage visitors.
 */
class VisitState {

    types: BabelTypes;
    attrs: Record<string, unknown>;
    nextIgnore: Node | null;
    ignoreClassMethods: string[];
    reportLogic: boolean;

    /** Callback to determine if the given source location should be instrumented. */
    shouldInstrumentCallback?: (path: NodePath, loc: SourceLocation) => boolean;

    public readonly origins: SourceOrigins;

    constructor(
        types: BabelTypes,
        inputSourceMapConsumer: SourceMapConsumer | undefined,
        ignoreClassMethods: string[] = [],
        reportLogic = false,
        shouldInstrumentCallback?: (path: NodePath, loc: SourceLocation) => boolean
    ) {
        this.attrs = {};
        this.nextIgnore = null;
        this.ignoreClassMethods = ignoreClassMethods;
        this.types = types;
        this.reportLogic = reportLogic;
        this.shouldInstrumentCallback = shouldInstrumentCallback;
        this.origins = new SourceOrigins(inputSourceMapConsumer);
    }

    /**
     * Use the configured callback, if available, to check if the given source
     * location should be instrumented.
     */
    shouldInstrument(path: NodePath, loc: SourceLocation): boolean {
        if (this.shouldInstrumentCallback) {
            return this.shouldInstrumentCallback(path, loc);
        }
        return true;
    }

    /** Should we ignore the node? Yes, if specifically ignoring or if the node is generated. */
    shouldIgnore(path: NodePath): boolean {
        return this.nextIgnore !== null || !path.node.loc;
    }

    /** Extract the ignore comment hint (next|if|else) or null. */
    hintFor(node: Node): string | null {
        let hint: string | null = null;
        if (node.leadingComments) {
            node.leadingComments.forEach(c => {
                const v = (c.value || '').trim();
                const groups = v.match(COMMENT_RE);
                if (groups) {
                    hint = groups[1];
                }
            });
        }
        return hint;
    }

    /**
     * For these expressions the statement counter needs to be hoisted, so
     * function name inference can be preserved.
     */
    counterNeedsHoisting(path: NodePath): boolean {
        return (
            path.isFunctionExpression() ||
            path.isArrowFunctionExpression() ||
            path.isClassExpression()
        );
    }

    /** All the generic stuff that needs to be done on enter for every node. */
    onEnter(path: NodePath) {
        const n = path.node;

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

    /**
     * All the generic stuff on exit of a node, including resetting ignores and custom node attrs.
     */
    onExit(path: NodePath) {
        // restore ignore status, if needed
        if (path.node === this.nextIgnore) {
            this.nextIgnore = null;
        }
        // nuke all attributes for the node
        delete (path.node as CovNode).__cov__;
    }

    /** Set a node attribute for the supplied node. */
    setAttr(node: CovNode, name: string, value: unknown) {
        node.__cov__ = node.__cov__ || {};
        node.__cov__[name] = value;
    }

    /** Retrieve a node attribute for the supplied node or null. */
    getAttr(node: CovNode, name: string): unknown {
        const c = node.__cov__;
        if (!c) {
            return null;
        }
        return c[name];
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
        } else if (
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

    insertFunctionCounter(path: NodePath<CallableNode>) {
        const T = this.types;

        if (!(path.node?.loc)) {
            return;
        }
        const n = path.node;

        let declarationLocation: SourceLocation | undefined;
        switch (n.type) {
            case 'FunctionDeclaration':
            case 'FunctionExpression':
                if (n.id) {
                    declarationLocation = n.id.loc ?? undefined;
                }
                break;
        }

        const body = path.get('body') as NodePath;
        const loc = path.node.loc ?? declarationLocation;
        const [originFileId, originPos] = this.origins.ensureKnownOrigin(loc);

        if (body.isBlockStatement() && this.shouldInstrument(path, originPos)) {
            // For functions, we only cover the first line of its body.
            originPos.end = originPos.start;
            const increment = newLineCoverageExpression(originFileId, originPos);
            body.node.body.unshift(T.expressionStatement(increment));
        }
    }

    insertStatementCounter(path: NodePath) {
        const loc = path.node?.loc;
        if (!loc) {
            return;
        }

        const [originFileId, originPos] = this.origins.ensureKnownOrigin(loc);
        if (!this.shouldInstrument(path, originPos)) {
            return;
        }

        const increment = newLineCoverageExpression(originFileId, originPos);
        this.insertCounter(path, increment);
    }

    insertBranchCounter(path: NodePath, loc: SourceLocation | null | undefined) {
        loc = loc ?? path.node.loc!;
        if (!loc) {
            return;
        }

        const [originFileId, originPos] = this.origins.ensureKnownOrigin(loc);
        if (this.shouldInstrument(path, originPos)) {
            const increment = newLineCoverageExpression(originFileId, originPos)
            this.insertCounter(path, increment);
        }
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

/**
 * Create a line coverage reporting statement node.
 */
function newLineCoverageExpression(
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
 * Generic function that takes a set of visitor methods and
 * returns a visitor object with `enter` and `exit` properties,
 * such that:
 *
 * - standard entry processing is done
 * - the supplied visitors are called only when ignore is not in effect;
 *   it reliefs them from worrying about ignore states and generated nodes.
 * - standard exit processing is done
 */
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

function coverAssignmentPattern(this: VisitState, path: NodePath) {
    this.insertBranchCounter(path.get('right') as NodePath, undefined);
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

    if (ignoreIf) {
        this.setAttr(n.consequent, 'skip-all', true);
    } else {
        this.insertBranchCounter(path.get('consequent'), n.loc);
    }

    if (ignoreElse) {
        this.setAttr(n.alternate!, 'skip-all', true);
    } else {
        this.insertBranchCounter(path.get('alternate') as NodePath, undefined);
    }
}

function createSwitchBranch(this: VisitState, path: NodePath) {
    // Intentionally left blank
}

function coverSwitchCase(this: VisitState, path: NodePath<SwitchCase>) {
    const T = this.types;
    const loc = path.node.loc;
    if (!loc) {
        return;
    }

    const [originFileId, originPos] = this.origins.ensureKnownOrigin(loc);
    if (this.shouldInstrument(path, originPos)) {
        const increment = newLineCoverageExpression(originFileId, originPos);
        path.node.consequent.unshift(T.expressionStatement(increment));
    }
}

function coverTernary(this: VisitState, path: NodePath<ConditionalExpression>) {
    const n = path.node;
    const cHint = this.hintFor(n.consequent);
    const aHint = this.hintFor(n.alternate);

    if (cHint !== 'next') {
        this.insertBranchCounter(path.get('consequent'), undefined);
    }

    if (aHint !== 'next') {
        this.insertBranchCounter(path.get('alternate'), undefined);
    }
}

function coverLogicalExpression(this: VisitState, path: NodePath<LogicalExpression>) {
    const T = this.types;
    if (path.parentPath.node.type === 'LogicalExpression') {
        return; // already processed
    }

    const leaves: LeafNode[] = [];
    this.findLeaves(path.node, leaves, undefined, undefined);

    for (const leaf of leaves) {
        const hint = this.hintFor(leaf.node);
        if (hint === 'next') {
            continue;
        }


        const loc = path.node.loc;
        if (!loc) {
            continue;
        }

        const [originFileId, originPos] = this.origins.ensureKnownOrigin(loc);
        if (!this.shouldInstrument(path, originPos)) {
            continue;
        }

        const increment = newLineCoverageExpression(originFileId, originPos);
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

/**
 * The rewire plugin (and potentially other babel middleware)
 * may cause files to be instrumented twice, see:
 * https://github.com/istanbuljs/babel-plugin-istanbul/issues/94
 * we should only instrument code for coverage the first time
 * it's run through lib-instrument.
 */
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

/**
 * `programVisitor` is a `babel` adaptor for instrumentation.
 *
 * It returns an object with two methods `enter` and `exit`.
 * These should be assigned to or called from `Program` entry and exit functions
 * in a babel visitor.
 *
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
export function programVisitor(types: BabelTypes,
                               inputSourceMapConsumer: SourceMapConsumer | undefined,
                               opts: InstrumentationOptions) {
    opts = {...opts};

    const visitState = new VisitState(
        types,
        inputSourceMapConsumer,
        opts.ignoreClassMethods,
        opts.reportLogic,
        opts.shouldInstrumentCallback
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
                return;
            }

            const originData = visitState.origins;
            if (shouldIgnoreFile(path.find(p => p.isProgram()))) {
                return;
            }

            const body = path.node.body;

            if (opts.codeToPrepend) {
                const codeToPrependAst = parse(opts.codeToPrepend, {sourceType: 'script'});
                if (codeToPrependAst !== null) {
                    body.unshift(...codeToPrependAst.program.body);
                }
            }

            // Add a variable definition for each origin file on top of the file.
            for (const [originPath, originId] of originData.originToIdMap.entries()) {
                const declaration = newStringConstDeclarationNode(originId, originPath);
                body.unshift(declaration);
            }

            // Add a token for signaling that the file has been instrumented.
            if (opts.isInstrumentedToken) {
                types.addComment(path.node, 'leading', opts.isInstrumentedToken, false);
            }
        }
    };
}
