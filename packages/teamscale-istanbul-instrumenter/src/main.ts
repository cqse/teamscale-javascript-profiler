#!/usr/bin/env node

import {ArgumentParser} from "argparse";
import {InstrumentationTask, TaskResult} from "./instrumenter/Task";
import {IInstrumenter, IstanbulInstrumenter} from "./instrumenter/Instrumenter";
import {Contract} from "@cqse/common-qualities";
import {TaskBuilder} from "./instrumenter/TaskBuilder";
import * as path from "path";

const { version } = require('../package.json');

/**
 * Entry points of the Instrumenter, including command line argument parsing.
 */
export class Main {

    private static buildParser(): ArgumentParser {
        const parser = new ArgumentParser({
            description: 'Instrumenter of the Teamscale Istanbul Agent'
        });

        parser.add_argument('-v', '--version', {action: 'version', version});
        parser.add_argument('-i', '--in-place', {action: 'store_true'});
        parser.add_argument('-o', '--to', {help: 'Name of the file to write the instrumented version to.'});
        parser.add_argument('-s', '--source-map', {help: 'External location of source-map files to consider.'});
        parser.add_argument('-c', '--collector', {help: 'The collector (host:port) to send coverage information to.', default: "localhost:54678"});
        parser.add_argument('-x', '--exclude-origin', {help: 'Glob pattern of files in the source origin to not produce coverage for.'})
        parser.add_argument('-k', '--include-origin', {help: 'Glob pattern of files in the source origin to produce coverage for.'})
        parser.add_argument('inputs', {nargs: '+', help: 'The input file(s) to instrument.'});

        return parser;
    }

    /**
     * Main function of the instrumenter.
     * Parses the command line options and the instrumentation accordingly.
     */
    public static async run(): Promise<TaskResult> {
        // Parsing of command line arguments:
        // Build the configuration object from the command line arguments.
        const parser: ArgumentParser= this.buildParser();
        const config = parser.parse_args();

        // Run the instrumenter with the given configuration.
        return this.runForConfigArguments(config);
    }

    /**
     * The instrumenter can also be started by providing the configuration dictionary explicitly.
     *
     * @param config - The dictionary with all configuration arguments.
     */
    public static runForConfigArguments(config: {}): Promise<TaskResult> {
        const task: InstrumentationTask = this.createInstrumentationTask(config);
        Contract.require(task.elements.length > 0, "The instrumentation task must not be empty.");

        return this.createInstrumenter(config).instrument(task);
    }

    private static createInstrumentationTask(config: any): InstrumentationTask {
        return new TaskBuilder().addFromConfig(config).build();
    }

    private static createInstrumenter(config: any): IInstrumenter {
        return new IstanbulInstrumenter(path.join(__dirname, "../dist/vaccine.js"));
    }
}

// Run the instrumenter and print the results to the console.
Main.run().then((result) => {
    console.log("Instrumentation finished.");
    console.log(`\tInstrumented: ${result.translated}`);
    console.log(`\tInstrumented from cache: ${result.translatedFromCache}`);
    console.log(`\tAlready instrumented: ${result.alreadyInstrumented}`);
    console.log(`\tUnsupported: ${result.unsupported}`);
    console.log(`\tWith warning: ${result.warnings}`);
    console.log(`\tFailed: ${result.failed}`);
}).catch((reason) => {
    console.log("Failed: ", reason);
}).finally(() => {
    console.log("Bye bye.");
});