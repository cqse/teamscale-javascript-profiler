/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import {NodePath, transformSync} from '@babel/core';
import {SourceLocation} from "@babel/types";
import {ParserPlugin as PluginConfig} from '@babel/parser';
import {RawSourceMap, SourceMapConsumer} from "source-map";

import {programVisitor} from './visitor';
import {InstrumentationOptions} from "./utils";

/**
 * Options for configuring the coverage instrumenter.
 */
export type InstrumenterOptions = InstrumentationOptions & Partial<{
    /** Preserve comments in output */
    preserveComments: boolean;

    /** Generate compact code */
    compact: boolean;

    /** Set to true to instrument ES6 modules */
    esModules: boolean;

    /** Set to true to allow `return` statements outside of functions */
    autoWrap: boolean;

    /** Approach to produce a source map for the instrumented code */
    produceSourceMap: 'none' | 'inline' | 'external';

    /** Turn debugging on */
    debug: boolean;

    /** Set babel parser plugins */
    parserPlugins: PluginConfig[];
}>;

function mapSourceMapsOption(produceSourceMap: "none" | "inline" | "external" | undefined): boolean | "inline" | "both" | null | undefined {
    if (produceSourceMap == "none") {
        return false;
    }
    if (produceSourceMap === "external") {
        return "both";
    }
    return produceSourceMap;
}

/**
 * The main class of the instrumenter.
 */
export class Instrumenter {

    private readonly opts: InstrumenterOptions;

    constructor(opts?: Partial<InstrumenterOptions>) {
        this.opts = {...opts};
    }

    /**
     * Instrument the supplied code with coverage statements.
     * To instrument EcmaScript modules, make sure to set the
     * `esModules` option to `true` when creating the instrumenter.
     *
     * @param code - the code to instrument
     * @param filename - the name of the file the code stems from.
     * @param inputSourceMap - the source map that maps the not instrumented code back to its original
     * @param shouldInstrumentCallback - a callback to decide if a given code fragment should be instrumented
     *
     * @returns the instrumented code.
     */
    async instrument(code: string, filename: string | undefined, inputSourceMap: RawSourceMap | undefined,
                     shouldInstrumentCallback?: (path: NodePath, location: SourceLocation) => boolean): Promise<string> {
        filename = filename ?? String(new Date().getTime()) + '.js';

        const {opts} = this;

        const sourceMapToUse = inputSourceMap ?? opts.inputSourceMap;
        let inputSourceMapConsumer: SourceMapConsumer | undefined = undefined;
        if (sourceMapToUse) {
            inputSourceMapConsumer = await new SourceMapConsumer(sourceMapToUse);
        }

        const babelOpts = {
            configFile: false,
            babelrc: false,
            ast: true,
            filename,
            inputSourceMap,
            sourceMaps: mapSourceMapsOption(opts.produceSourceMap),
            compact: opts.compact,
            comments: opts.preserveComments,
            parserOpts: {
                allowReturnOutsideFunction: opts.autoWrap,
                sourceType: (opts.esModules ? 'module' : 'script') as "module" | "script" | "unambiguous" | undefined,
                plugins: opts.parserPlugins
            },
            plugins: [
                [
                    ({types}) => {
                        const ee = programVisitor(types, inputSourceMapConsumer, {
                            reportLogic: opts.reportLogic,
                            coverageGlobalScopeFunc:
                            opts.coverageGlobalScopeFunc,
                            ignoreClassMethods: opts.ignoreClassMethods,
                            inputSourceMap,
                            isInstrumentedToken: opts.isInstrumentedToken,
                            codeToPrepend: opts.codeToPrepend,
                            coveragePrecision: opts.coveragePrecision,
                            shouldInstrumentCallback: shouldInstrumentCallback ?? opts.shouldInstrumentCallback
                        });

                        return {
                            visitor: {
                                Program: {
                                    enter: ee.enter,
                                    exit(path) {
                                        ee.exit(path);
                                    }
                                }
                            }
                        };
                    }
                ]
            ]
        };

        return transformSync(code, babelOpts)!.code!;
    }

}
