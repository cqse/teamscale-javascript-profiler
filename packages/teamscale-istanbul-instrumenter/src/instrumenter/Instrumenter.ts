import {InstrumentationTask, TaskResult} from "./Task";
import {ImplementMeException} from "cqse-typescript-common/dist/Exceptions";

export enum InstrumentationArtifact {
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
        throw new ImplementMeException();
    }

}