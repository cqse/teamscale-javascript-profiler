// eslint-disable-next-line @typescript-eslint/no-var-requires
import {InstrumenterOptions} from "../../lib/instrumenter";

import {assert} from "chai";
import { Instrumenter } from "../../src/instrumenter";

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

export const MOCK_COVERAGE_VARIABLE = "_$COV";

type CoverageType = 'functions' | 'lines' | 'statements' | 'branches';
type CoveragePerLineAndType = Record<CoverageType, Record<string, number>>;

export const MOCK_VACCINE = `
var UNIVERSE;
try {
  UNIVERSE = (function(){return this;})();
} catch(e) {
  UNIVERSE = window || global;
}
UNIVERSE.${MOCK_COVERAGE_VARIABLE} = {
    functions: {},
    lines: {},
    statements: {},
    branches: {},
};
function incrementExecutions(coverageObj, startLine) {
    coverageObj[startLine] = (coverageObj[startLine] || 0) + 1;
}
function _$pushCov(typeId, fileId, startLine, startCol, endLine, endCol) {
   const typeCov = ${MOCK_COVERAGE_VARIABLE}[typeId];
   incrementExecutions(typeCov, startLine);
   
   if (fileId) {
       const fileCov = ${MOCK_COVERAGE_VARIABLE}[typeId][fileId] || {};
       ${MOCK_COVERAGE_VARIABLE}[typeId][fileId] = fileCov;   
       incrementExecutions(fileCov, startLine);
   }
}
function _$b(fileId, startLine, startCol, endLine, endCol) {
   _$pushCov('branches', fileId, startLine, startCol, endLine, endCol);
}
function _$f(fileId, startLine, startCol, endLine, endCol) {
   _$pushCov('functions', fileId, startLine, startCol, endLine, endCol);
}
function _$s(fileId, startLine, startCol, endLine, endCol) {
   _$pushCov('lines', fileId, startLine, startCol, endLine, endCol);
   _$pushCov('statements', fileId, startLine, startCol, endLine, endCol);
}
function _$l(fileId, startLine, startCol, endLine, endCol) {
   _$pushCov('lines', fileId, startLine, startCol, endLine, endCol);
}
`;

type ExpectedCoverage = {
    lines: Record<string, number>;
    statements: Record<string, number>;
    functions: Record<string, number>;
    branches: Record<string, number>;
    branchesTrue: Record<string, number>;
    inputSourceMap: object;
}

function pad(str: string, len: number) {
    const blanks = '                                             ';
    if (str.length >= len) {
        return str;
    }
    return blanks.substring(0, len - str.length) + str;
}

function annotatedCode(code: string) {
    const codeArray = code.split('\n');
    let line = 0;
    const annotated = codeArray.map(str => {
        line += 1;
        return pad(`${line}`, 6) + ': ' + str;
    });
    return annotated.join('\n');
}

function getGlobalObject() {
    return new Function('return this')();
}

class Verifier {
    result: any;

    constructor(result: object) {
        this.result = result;
    }

    async verify(args: unknown[], expectedOutput: string, expectedCoverage: CoveragePerLineAndType) {
        assert.ok(!this.result.err, (this.result.err || {}).message);

        // Call the instrumented code and retrieve its output
        let actualOutput;
        try {
            actualOutput = await this.result.fn(args);
        } catch (e) {
            console.log(e);
        }

        // Collect the coverage
        const actualCoverage = this.getFileCoverage() as CoveragePerLineAndType;

        // Verify the output
        assert.ok(
            actualCoverage && typeof actualCoverage === 'object',
            'No coverage found for [' + this.result.file + ']'
        );
        assert.deepEqual(actualOutput, expectedOutput, 'Output mismatch');

        // Verify the coverage
        for (const coverageType of ['functions', 'lines', 'statements']) {
            const expectedIncrementsPerLine = expectedCoverage[coverageType as CoverageType];
            const actualIncrementsPerLine = expectedCoverage[coverageType as CoverageType];
            if (!expectedIncrementsPerLine) {
                continue;
            }
            for (const [expectedLine, expectedIncrements] of Object.entries(expectedIncrementsPerLine)) {
                const actualIncrements = Number.parseInt(actualIncrementsPerLine[expectedLine] as any);
                assert.isTrue(actualIncrements >= expectedIncrements, `At least ${actualIncrements} visits on ${coverageType} level expected in line ${expectedLine}`);
            }
        }
    }

    getCoverage() {
        return getGlobalObject()[MOCK_COVERAGE_VARIABLE];
    }

    getFileCoverage() {
        return this.getCoverage();
    }

    getGeneratedCode() {
        return this.result.generatedCode;
    }

    compileError() {
        return this.result.err;
    }
}

function extractTestOption(opts: any, name: string, defaultValue: any) {
    let v = defaultValue;
    if (Object.prototype.hasOwnProperty.call(opts, name)) {
        v = opts[name];
    }
    return v;
}

export function create(code: string, opts: any, instrumenterOpts: InstrumenterOptions, inputSourceMap: any) {
    opts = opts || {};
    instrumenterOpts = instrumenterOpts || {};

    const debug = extractTestOption(opts, 'debug', process.env.DEBUG === '1');
    const file = extractTestOption(opts, 'file', __filename);
    const generateOnly = extractTestOption(opts, 'generateOnly', false);
    const noCoverage = extractTestOption(opts, 'noCoverage', false);
    const quiet = extractTestOption(opts, 'quiet', false);
    const g = getGlobalObject();
    let instrumenterOutput;
    let wrapped;
    let fn;
    let verror;

    if (debug) {
        instrumenterOpts.compact = false;
    }
    const instrumenter = new Instrumenter(instrumenterOpts);
    try {
        instrumenterOutput = instrumenter.instrumentSync(
            code,
            file,
            inputSourceMap
        );
        if (debug) {
            console.log(
                '================== Original ============================================'
            );
            console.log(annotatedCode(code));
            console.log(
                '================== Generated ==========================================='
            );
            console.log(instrumenterOutput);
            console.log(
                '========================================================================'
            );
        }
    } catch (ex: any) {
        if (!quiet) {
            console.error(ex.stack);
        }
        verror = new Error(
            'Error instrumenting:\n' +
                annotatedCode(String(code)) +
                '\n' +
                ex.message
        );
    }

    // Run (evaluate) the instrumented code.
    // Attention: It will be evaluated in context of this "window".
    if (!(verror || generateOnly)) {
        wrapped =
            `{${MOCK_VACCINE} var output;\n ${instrumenterOutput} \nreturn output;\n}`;
        try {
            if (opts.isAsync) {
                fn = new AsyncFunction('args', wrapped);
            } else {
                fn = new Function('args', wrapped);
            }
        } catch (ex: any) {
            console.error(ex.stack);
            verror = new Error(
                'Error compiling\n' + annotatedCode(code) + '\n' + ex.message
            );
        }
    }

    if (generateOnly || noCoverage) {
        assert.ok(!verror);
    }

    return new Verifier({
        err: verror,
        debug,
        file,
        fn,
        code,
        generatedCode: instrumenterOutput,
        emptyCoverage: instrumenter.lastFileCoverage()
    });
}
