import {ArgumentParser} from "argparse";

const { version } = require('../package.json');

export class Main {

    private static buildParser(): ArgumentParser {
        const parser = new ArgumentParser({
            description: 'Instrumenter of the Teamscale Istanbul Agent'
        });

        parser.add_argument('-v', '--version', {action: 'version', version});
        parser.add_argument('-i', '--in-place', {});
        parser.add_argument('-s', '--source-map', {});
        parser.add_argument('-p', '--target-port', {help: 'The port to send coverage information to.', default: 54678});
        parser.add_argument('-t', '--target-host', {help: 'The host to send coverage information to.', default: "localhost"});

        return parser;
    }

    public static run(): void {
        const parser: ArgumentParser= this.buildParser();
        const config = parser.parse_args();
    }

}

Main.run();
