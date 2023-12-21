import {RawSourceMap} from "source-map";
import {NodePath} from "@babel/core";
import {SourceLocation} from "@babel/types";

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

    /** Level of granularity coverage statements should be added to the code. */
    coveragePrecision: 'function' | 'line' | 'statement' | 'branch';

    /** Callback for determining if a given code fragment should be instrument */
    shouldInstrumentCallback?: (path: NodePath, loc: SourceLocation) => boolean;
}>;
