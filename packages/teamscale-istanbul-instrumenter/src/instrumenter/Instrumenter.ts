import {CollectorSpecifier, InstrumentationTask, TaskElement, TaskResult} from "./Task";
import {Contract, ImplementMeException} from "@cqse/common-qualities";
import istanbul = require("istanbul-lib-instrument");
import * as fs from "fs";
import path = require ("path");

export const IS_INSTRUMENTED_TOKEN = "/** $IS_TS_AGENT_INSTRUMENTED=true **/"

export interface IInstrumenter {

    instrument(task: InstrumentationTask): Promise<TaskResult>;

}

export class IstanbulInstrumenter implements IInstrumenter {

    private readonly _vaccineFilePath: string;

    constructor(vaccineFilePath: string) {
        this._vaccineFilePath = Contract.requireNonEmpty(vaccineFilePath);
        Contract.require(fs.existsSync(vaccineFilePath), `The vaccine file to inject must exist!\nCWD:${process.cwd()}`);
    }

    instrument(task: InstrumentationTask): Promise<TaskResult> {
        fs.existsSync(this._vaccineFilePath);

        // TODO: Do this concurrently with a set of workers.
        const result = task.elements
            .map((e) => this.instrumentOne(task.collector, e))
            .reduce((prev, current) => current.withIncrement(prev), TaskResult.neutral());
        return Promise.resolve(result);
    }

    instrumentOne(collector: CollectorSpecifier, taskElement: TaskElement): TaskResult {
        const inputFileSource = fs.readFileSync(taskElement.fromFile, 'utf8');

        if (inputFileSource.startsWith(IS_INSTRUMENTED_TOKEN)) {
            if (taskElement.isInPlace()) {
                return new TaskResult(0, 0, 1, 0, 0);
            } else {
                fs.writeFileSync(taskElement.toFile, inputFileSource);
            }
        }

        if (!this.isFileTypeSupported(taskElement.fromFile)) {
            return new TaskResult(0, 0, 0, 1, 0);
        }

        console.log(path.basename(taskElement.fromFile));

        if (taskElement.externalSourceMapFile.isPresent()) {
            throw new ImplementMeException();
        }

        const inputSourceMap = undefined;
        let instrumentedSource;

        const configurationAlternatives = this.configurationAlternativesFor(taskElement);
        for (let i=0; i<configurationAlternatives.length; i++) {
            try {
                const instrumenter = istanbul.createInstrumenter(configurationAlternatives[i]);

                instrumentedSource = instrumenter
                    .instrumentSync(inputFileSource, taskElement.fromFile, inputSourceMap)
                    .replace(/return actualCoverage/g, "return makeCoverageInterceptor(actualCoverage, actualCoverage, [])")
                    .replace(/new Function\("return this"\)\(\)/g, "typeof window === 'object' ? window : this");

                break;
            } catch (e) {
                if (i == configurationAlternatives.length-1) {
                    fs.writeFileSync(taskElement.toFile, inputFileSource);
                    return TaskResult.error(e);
                }
            }
        }

        const vaccineSource = fs.readFileSync(this._vaccineFilePath, 'utf8')
            .replace(/\$REPORT_TO_HOST/g, collector.host)
            .replace(/\$REPORT_TO_PORT/g, `${collector.port}`);

        fs.writeFileSync(taskElement.toFile, `${IS_INSTRUMENTED_TOKEN} ${vaccineSource} ${instrumentedSource}`);

        return new TaskResult(1, 0, 0, 0, 0);
    }

    private isFileTypeSupported(fileName: string) {
        const ext = path.extname(fileName).toLowerCase();
        return ext == ".js";
    }

    private configurationAlternativesFor(taskElement: TaskElement): {}[] {
        const baseConfig = {
            coverageVariable: '__coverage__',
        };

        return [ { ...baseConfig, ...{   esModules: true }},
            { ...baseConfig, ...{   esModules: false }} ];
    }
}