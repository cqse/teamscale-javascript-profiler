import {ArgumentParser} from "argparse";
import {InstrumentationTask, TaskResult} from "./instrumenter/Task";
import {IInstrumenter} from "./instrumenter/Instrumenter";
import {ImplementMeException} from "cqse-typescript-common/dist/Exceptions";

const { version } = require('../package.json');

export class Main {

    private static buildParser(): ArgumentParser {
        const parser = new ArgumentParser({
            description: 'Instrumenter of the Teamscale Istanbul Agent'
        });

        parser.add_argument('-v', '--version', {action: 'version', version});
        parser.add_argument('-i', '--in-place', {});
        parser.add_argument('-o', '--to', {help: 'Name of the file to write the instrumented version to.'});
        parser.add_argument('-s', '--source-map', {help: 'External location of source-map files to consider.'});
        parser.add_argument('-c', '--collector', {help: 'The collector (host:port) to send coverage information to.', default: "localhost:54678"});
        parser.add_argument('inputs', {nargs: '+', help: 'The input file(s) to instrument.'});

        return parser;
    }

    public static async run(): Promise<TaskResult> {
        const parser: ArgumentParser= this.buildParser();
        const config = parser.parse_args();

        return this.runForConfigArguments(config);
    }

    public static runForConfigArguments(config: {}): Promise<TaskResult> {
        const task: InstrumentationTask = this.createInstrumentationTask(config);
        const instrumenter: IInstrumenter = this.createInstrumenter(config);

        return instrumenter.instrument(task);
    }

    private static createInstrumentationTask(config: {}): InstrumentationTask {
        throw new ImplementMeException();
    }

    private static createInstrumenter(config: any): IInstrumenter {
        throw new ImplementMeException();
    }
}

Main.run().finally(() => {
    console.log("Bye bye.")
});