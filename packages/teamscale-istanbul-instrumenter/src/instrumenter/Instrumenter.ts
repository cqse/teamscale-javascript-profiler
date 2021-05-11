import {InstrumentationTask, TaskElement, TaskResult} from "./Task";
import {ImplementMeException} from "@cqse/common-qualities";
import istanbul = require("istanbul-lib-instrument");
import * as fs from "fs";

export enum EInstrumentationArtifact {
    ISTANBUL_COVERAGE,
    COVERAGE_SOURCEMAP,
    TRANSPILE_SOURCEMAP,
    COVERAGE_REPORTER
}

export interface IInstrumenter {

    instrument(task: InstrumentationTask): Promise<TaskResult>;

}

export class IstanbulInstrumenter implements IInstrumenter {

    instrument(task: InstrumentationTask): Promise<TaskResult> {
        // TODO: Do this concurrently with a set of workers.
        task.elements.forEach((e) => this.instrumentOne(e));
        return Promise.resolve(new TaskResult(task.elements.length, 0));
    }

    instrumentOne(taskElement: TaskElement): TaskResult {
        const inputFileSource = fs.readFileSync(taskElement.fromFile, 'utf8')

        const instrumenter = istanbul.createInstrumenter({
            coverageVariable: '___COVERAGE___',
            esModules: true
        });

        if (taskElement.externalSourceMapFile.isPresent()) {
            throw new ImplementMeException();
        }

        const inputSourceMap = undefined;
        const instrumentedSource = instrumenter
            .instrumentSync(inputFileSource, taskElement.fromFile, inputSourceMap)
            .replace("return actualCoverage", "return makeProxy(actualCoverage, actualCoverage, [])");

        fs.writeFileSync(taskElement.toFile, instrumentedSource);

        return new TaskResult(1, 0);
    }

}