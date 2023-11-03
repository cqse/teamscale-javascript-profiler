/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import {transformSync} from '@babel/core';
import {ParserPlugin as PluginConfig} from '@babel/parser';
import {defaults} from '@istanbuljs/schema';
import {RawSourceMap} from "source-map";

import {programVisitor, VisitorOutput} from './visitor';
import {IstanbulCoverageObject, readInitialCoverage} from './read-coverage';

/**
 * Options for configuring the coverage instrumenter.
 */
export interface InstrumenterOptions {
    /** Name of global coverage variable */
    coverageVariable: string;

    /** Report boolean value of logical expressions */
    reportLogic: boolean;

    /** Preserve comments in output */
    preserveComments: boolean;

    /** Generate compact code */
    compact: boolean;

    /** Set to true to instrument ES6 modules */
    esModules: boolean;

    /** Set to true to allow `return` statements outside of functions */
    autoWrap: boolean;

    /** Set to true to produce a source map for the instrumented code */
    produceSourceMap: boolean;

    /** Set to array of class method names to ignore for coverage */
    ignoreClassMethods: string[];

    /** A callback function that is called when a source map URL is found in the original code. Called with source file name and source map URL */
    sourceMapUrlCallback(filename: string, url: string | null): void;

    /** Turn debugging on */
    debug: boolean;

    /** Set babel parser plugins */
    parserPlugins: PluginConfig[];

    /** The global coverage variable scope */
    coverageGlobalScope: string;

    /** Use an evaluated function to find coverageGlobalScope */
    coverageGlobalScopeFunc: boolean;
}

/**
 * The default configuration options.
 */
export function createDefaultInstrumenterOptions(): InstrumenterOptions {
    return {
        coverageVariable: '__coverage__',
        reportLogic: false,
        preserveComments: false,
        compact: true,
        esModules: false,
        autoWrap: false,
        produceSourceMap: false,
        ignoreClassMethods: [],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sourceMapUrlCallback: (filename: string, url: string) => { /* implementation of this function might vary */
        },
        debug: false,
        parserPlugins: [],
        coverageGlobalScope: 'this',
        coverageGlobalScopeFunc: true,
    };
}

/**
 * Instrumenter is the public API for the instrument library.
 * It is typically used for ES5 code. For ES6 code that you
 * are already running under `babel` use the coverage plugin
 * instead.
 * @param {Object} opts optional.
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
    instrumentSync(code: string, filename: string | undefined, inputSourceMap: RawSourceMap | undefined): string {
        if (typeof code !== 'string') {
            throw new Error('Code must be a string');
        }

        filename = filename || String(new Date().getTime()) + '.js';
        const {opts} = this;
        let output: VisitorOutput;

        const babelOpts = {
            configFile: false,
            babelrc: false,
            ast: true,
            filename: filename || String(new Date().getTime()) + '.js',
            inputSourceMap,
            sourceMaps: opts.produceSourceMap,
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
                            coverageVariable: opts.coverageVariable,
                            reportLogic: opts.reportLogic,
                            coverageGlobalScope: opts.coverageGlobalScope,
                            coverageGlobalScopeFunc:
                            opts.coverageGlobalScopeFunc,
                            ignoreClassMethods: opts.ignoreClassMethods,
                            inputSourceMap
                        });

                        return {
                            visitor: {
                                Program: {
                                    enter: ee.enter,
                                    exit(path) {
                                        output = ee.exit(path)!;
                                    }
                                }
                            }
                        };
                    }
                ]
            ]
        };

        const codeMap = transformSync(code, babelOpts);

        if (!output?.fileCoverage) {
            const initialCoverage: IstanbulCoverageObject | null =
                readInitialCoverage(codeMap!.ast!);
            this.fileCoverage = initialCoverage?.coverageData;
            this.sourceMap = inputSourceMap;
            return code;
        }

        this.fileCoverage = output.fileCoverage;
        this.sourceMap = codeMap!.map as RawSourceMap;
        const cb = this.opts.sourceMapUrlCallback;
        if (cb && output.sourceMappingURL) {
            cb(filename, output.sourceMappingURL as string);
        }

        return codeMap!.code!;
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
