import {InstrumentationTask, TaskElement, TaskResult} from "./Task";
import {Contract, ImplementMeException} from "@cqse/common-qualities";
import istanbul = require("istanbul-lib-instrument");
import * as fs from "fs";

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
        task.elements.forEach((e) => this.instrumentOne(e));
        return Promise.resolve(new TaskResult(task.elements.length, 0));
    }

    instrumentOne(taskElement: TaskElement): TaskResult {
        const inputFileSource = fs.readFileSync(taskElement.fromFile, 'utf8');

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

        const vaccineSource = fs.readFileSync(this._vaccineFilePath, 'utf8');

        fs.writeFileSync(taskElement.toFile, `${vaccineSource} ${instrumentedSource}`);

        return new TaskResult(1, 0);
    }

}