import {ArgumentParser} from "argparse";
import {WebSocketCollectingServer} from "./receiver/CollectingServer";
import {DataStorage} from "./storage/DataStorage";

const { version } = require('../package.json');

export class Main {

  private static buildParser(): ArgumentParser {
    const parser = new ArgumentParser({
      description: 'Collector of the Teamscale Istanbul Agent'
    });

    parser.add_argument('-v', '--version', {action: 'version', version});
    parser.add_argument('-p', '--port', {help: 'The port to receive coverage information on.', default: 54678});
    parser.add_argument('-f', '--dump-to-file', {help: 'Target file', default: "./coverage.simple"});

    return parser;
  }

  public static run(): void {
    const parser: ArgumentParser= this.buildParser();
    const config = parser.parse_args();

    const storage = new DataStorage();
    const server = new WebSocketCollectingServer(config.port, storage);
    server.start();
    // ATTENTION: The server is executed asynchronously
  }

}

Main.run();