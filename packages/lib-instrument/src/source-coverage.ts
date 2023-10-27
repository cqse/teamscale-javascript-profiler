// eslint-disable-next-line @typescript-eslint/no-var-requires
import {SourceLocation} from "@babel/types";

const {classes} = require('istanbul-lib-coverage');
import {CoverageData} from "./read-coverage";

export type CodeRange = {
    start: { line?: number; column?: number };
    end: { line?: number; column?: number };
};

/**
 * SourceCoverage provides mutation methods to manipulate the structure of
 * a file coverage object. Used by the instrumenter to create a full coverage
 * object for a file incrementally.
 *
 * @private
 * @param pathOrObj {String|Object} - see the argument for {@link FileCoverage}
 * @extends FileCoverage
 * @constructor
 */
export class SourceCoverage extends classes.FileCoverage {

    private meta: { last: { s: number; f: number; b: number; }; };
    public data!: CoverageData & { bT?: Record<string, number[]> };

    constructor(pathOrObj) {
        super(pathOrObj);
        this.meta = {
            last: {
                s: 0,
                f: 0,
                b: 0
            }
        };
    }

    newStatement(loc: CodeRange): number {
        const s = this.meta.last.s;
        this.data.statementMap[s] = cloneLocation(loc);
        this.data.s[s] = 0;
        this.meta.last.s += 1;
        return s;
    }

    newFunction(name: string, declarationLocation: CodeRange | undefined, loc: CodeRange | undefined): number {
        const f = this.meta.last.f;
        name = name || '(anonymous_' + f + ')';
        this.data.fnMap[f] = {
            name,
            decl: cloneLocation(declarationLocation),
            loc: cloneLocation(loc),
            // DEPRECATED: some legacy reports require this info.
            line: loc?.start.line
        };
        this.data.f[f] = 0;
        this.meta.last.f += 1;
        return f;
    }

    newBranch(type: string, loc: SourceLocation | null | undefined, isReportLogic = false): number {
        const b = this.meta.last.b;
        this.data.b[b] = [];
        this.data.branchMap[b] = {
            loc: cloneLocation(loc),
            type,
            locations: [],
            // DEPRECATED: some legacy reports require this info.
            line: loc?.start.line
        };
        this.meta.last.b += 1;
        this.maybeNewBranchTrue(type, `${b}`, isReportLogic);
        return b;
    }

    maybeNewBranchTrue(type: string, name: string, isReportLogic: boolean) {
        if (!isReportLogic) {
            return;
        }
        if (type !== 'binary-expr') {
            return;
        }
        this.data.bT = this.data.bT || {};
        this.data.bT[name] = [];
    }

    addBranchPath(branchId: string | number, location: CodeRange | undefined) {
        const bMeta = this.data.branchMap[branchId];
        const counts = this.data.b[branchId];

        /* istanbul ignore if: paranoid check */
        if (!bMeta) {
            throw new Error('Invalid branch ' + branchId);
        }
        bMeta.locations.push(cloneLocation(location));
        counts.push(0);
        this.maybeAddBranchTrue(branchId as string);
        return counts.length - 1;
    }

    maybeAddBranchTrue(branchId: string) {
        if (!this.data.bT) {
            return;
        }
        const countsTrue = this.data.bT[branchId];
        if (!countsTrue) {
            return;
        }
        countsTrue.push(0);
    }

    /**
     * Assigns an input source map to the coverage that can be used
     * to remap the coverage output to the original source
     * @param sourceMap {object} the source map
     */
    inputSourceMap(sourceMap) {
        this.data.inputSourceMap = sourceMap;
    }

    freeze() {
        // prune empty branches
        const map = this.data.branchMap;
        const branches = this.data.b;
        const branchesT = this.data.bT || {};
        Object.keys(map).forEach(b => {
            if (map[b].locations.length === 0) {
                delete map[b];
                delete branches[b];
                delete branchesT[b];
            }
        });
    }
}

function cloneLocation(loc: CodeRange | null | undefined): CodeRange {
    return {
        start: {
            line: loc?.start.line,
            column: loc?.start.column
        },
        end: {
            line: loc?.end.line,
            column: loc?.end.column
        }
    };
}