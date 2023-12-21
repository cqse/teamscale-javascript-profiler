/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import {NodePath, transformSync} from '@babel/core';
import {ParserPlugin as PluginConfig} from '@babel/parser';
import {defaults} from '@istanbuljs/schema';
import {RawSourceMap} from "source-map";

import { programVisitor } from './visitor';
import {InstrumentationOptions} from "./types";
import {SourceLocation} from "@babel/types";

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
 * Instrumenter is the public API for the instrument library.
 * It is typically used for ES5 code. For ES6 code that you are already
 * running under `babel` use the coverage plugin instead.
 */
export class Instrumenter {

    private fileCoverage: unknown;
    private sourceMap?: RawSourceMap;
    private readonly opts: InstrumenterOptions;

    constructor(opts?: Partial<InstrumenterOptions>) {
        this.opts = {
            ...defaults.instrumenter,
            ...opts
        };
        this.fileCoverage = null;
        this.sourceMap = undefined;
    }

    /**
     * Instrument the supplied code and track coverage against the supplied
     * filename. It throws if invalid code is passed to it. ES5 and ES6 syntax
     * is supported. To instrument ES6 modules, make sure that you set the
     * `esModules` property to `true` when creating the instrumenter.
     *
     * @param code - the code to instrument
     * @param filename - the filename against which to track coverage.
     * @param [inputSourceMap] - the source map that maps the not instrumented code back to it's original form.
     * Is assigned to the coverage object and therefore, is available in the json output and can be used to remap the
     * coverage to the untranspiled source.
     * @returns the instrumented code.
     */
    instrumentSync(code: string, filename: string | undefined, inputSourceMap: RawSourceMap | undefined, shouldInstrumentCallback?: (path: NodePath, location: SourceLocation) => boolean): string {
        filename = filename || String(new Date().getTime()) + '.js';
        const {opts} = this;

        const babelOpts = {
            configFile: false,
            babelrc: false,
            ast: true,
            filename: filename || String(new Date().getTime()) + '.js',
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
                        const ee = programVisitor(types, filename, {
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

    /**
     * callback-style instrument method that calls back with an error
     * as opposed to throwing one. Note that in the current implementation,
     * the callback will be called in the same process tick and is not asynchronous.
     *
     * @param code - the code to instrument
     * @param filename - the filename against which to track coverage.
     * @param callback - the callback
     * @param inputSourceMap - the source map that maps the not instrumented code back to it's original form.
     * Is assigned to the coverage object and therefore, is available in the json output and can be used to remap the
     * coverage to the untranspiled source.
     */
    instrument(code: string, filename: string | undefined, callback: (error: unknown, result?: string) => void, inputSourceMap: RawSourceMap) {
        if (!callback && typeof filename === 'function') {
            callback = filename;
            filename = undefined;
        }

        try {
            const out = this.instrumentSync(code, filename, inputSourceMap);
            callback(null, out);
        } catch (ex) {
            callback(ex);
        }
    }

    /**
     * returns the file coverage object for the last file instrumented.
     * @returns {Object} the file coverage object.
     */
    lastFileCoverage(): unknown {
        return this.fileCoverage;
    }

    /**
     * returns the source map produced for the last file instrumented.
     * @returns {null|Object} the source map object.
     */
    lastSourceMap(): RawSourceMap | undefined {
        return this.sourceMap;
    }
}
