// eslint-disable-next-line @typescript-eslint/no-var-requires
import {InstrumenterOptions} from "../../lib/instrumenter";

import {assert} from "chai";
import { Instrumenter } from "../../src/instrumenter";

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

const MOCK_COVERAGE_VARIABLE = "_$COV";

type CoverageType = 'lines';
type CoveragePerLineAndType = Record<CoverageType, Record<string, number>>;

/** A dummy vaccine used for mocking */
export const MOCK_VACCINE = `
var UNIVERSE = globalThis;
UNIVERSE.${MOCK_COVERAGE_VARIABLE} = {
    lines: {}
};
function incrementExecutions(coverageObj, startLine) {
    coverageObj[startLine] = (coverageObj[startLine] || 0) + 1;
}
function _$l(fileId, startLine, startCol, endLine, endCol) {
   const typeCov = ${MOCK_COVERAGE_VARIABLE}['lines'];
   incrementExecutions(typeCov, startLine);
   
   if (fileId) {
       const fileCov = typeCov[fileId] || {};
       typeCov[fileId] = fileCov;   
       incrementExecutions(fileCov, startLine);
   }
}
`;

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

    async verify(args: unknown[], expectedOutput: string, expectedCoverage: CoveragePerLineAndType, testName?: string) {
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
        const expectedLineCoverage = expectedCoverage.lines;
        const actualLineCoverage = actualCoverage.lines;

        if (!expectedLineCoverage) {
            return;
        }

        for (const [expectedLine, expectedIncrements] of Object.entries(expectedLineCoverage)) {
            const actualIncrements = Number.parseInt(actualLineCoverage[expectedLine] as any ?? 0);
            assert.isAtLeast(actualIncrements, expectedIncrements, `${testName ?? "Test"}: At least ${actualIncrements} visits on line level expected in line ${expectedLine}`);
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

export async function create(code: string, opts: any, instrumenterOpts: InstrumenterOptions, inputSourceMap: any) {
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
        instrumenterOutput = await instrumenter.instrument(
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
        generatedCode: instrumenterOutput
    });
}
