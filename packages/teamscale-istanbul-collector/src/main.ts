#!/usr/bin/env node

import {ArgumentParser} from "argparse";
import {WebSocketCollectingServer} from "./receiver/CollectingServer";
import {DataStorage} from "./storage/DataStorage";
import {CoveragePersisterBase} from "./storage/CoveragePersiterBase";
import {SimpleCoveragePersister} from "./storage/SimpleCoveragePersister";

const { version } = require('../package.json');

export class Main {

  private static buildParser(): ArgumentParser {
    const parser = new ArgumentParser({
      description: 'Collector of the Teamscale Istanbul Agent'
    });

    parser.add_argument('-v', '--version', {action: 'version', version});
    parser.add_argument('-p', '--port', {help: 'The port to receive coverage information on.', default: 54678});
    parser.add_argument('-f', '--dump-to-file', {help: 'Target file', default: "./coverage.simple"});
    parser.add_argument('-t', '--print-on-terminal', {help: 'Print received coverage information to the terminal?', default: false});

    return parser;
  }

  public static run(): void {
    console.log(`Starting collector in working directory "${process.cwd()}".`)
    const parser: ArgumentParser= this.buildParser();
    const config = parser.parse_args();

    const storage = new DataStorage(config.print_on_terminal);
    const server = new WebSocketCollectingServer(config.port, storage);
    server.start();
    // ATTENTION: The server is executed asynchronously

    process.on('SIGINT', function() {
      console.log("\nCaught interrupt signal. Writing latest coverage.");
      storage.writeToSimpleCoverageFile(config.dump_to_file);

      console.log("Bye bye.")
      process.exit();
    });
  }

}

Main.run();