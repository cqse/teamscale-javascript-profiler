#!/usr/bin/env node

import { version } from '../package.json';
import { ArgumentParser } from 'argparse';
import winston, { Logger } from 'winston';
import { DataStorage } from './storage/DataStorage';
import { WebSocketCollectingServer } from './receiver/CollectingServer';

/**
 * The command line parameters the profiler can be configured with.
 *
 * ATTENTION: We use snake_case here because ArgParse creates
 * the parameters that way---as in Python from which ArgParse stems.
 */
type Parameters = {
	// eslint-disable-next-line camelcase
	dump_to_file: string;
	// eslint-disable-next-line camelcase
	log_to_file: string;
	// eslint-disable-next-line camelcase
	dump_after_secs: number;
	debug: boolean;
	port: number;
};

/**
 * The main class of the Teamscale JavaScript Collector.
 * Used to start-up the collector for with a given configuration.
 */
export class Main {
	/**
	 * Construct the object for parsing the command line arguments.
	 */
	private static buildParser(): ArgumentParser {
		const parser = new ArgumentParser({
			description:
				'Collector of the Teamscale JavaScript Profiler. Collects coverage information from a' +
				'(headless) Web browser that executes code instrumented with our instrumenter.'
		});

		parser.add_argument('-v', '--version', { action: 'version', version });
		parser.add_argument('-p', '--port', { help: 'The port to receive coverage information on.', default: 54678 });
		parser.add_argument('-f', '--dump-to-file', { help: 'Target file', default: './coverage.simple' });
		parser.add_argument('-l', '--log-to-file', { help: 'Log file', default: 'logs/collector-combined.log' });
		parser.add_argument('-s', '--dump-after-secs', {
			help: 'Dump the coverage information to the target file every N seconds.',
			default: 120
		});
		parser.add_argument('-d', '--debug', {
			help: 'Print received coverage information to the terminal?',
			default: false
		});

		return parser;
	}

	/**
	 * Parse the given command line arguments into a corresponding options object.
	 */
	private static parseArguments(): Parameters {
		const parser: ArgumentParser = this.buildParser();
		return parser.parse_args();
	}

	/**
	 * Construct the logger.
	 */
	private static buildLogger(config: Parameters): winston.Logger {
		return winston.createLogger({
			level: 'info',
			format: winston.format.json(),
			defaultMeta: {},
			transports: [
				new winston.transports.File({ filename: 'logs/collector-error.log', level: 'error' }),
				new winston.transports.File({ filename: config.log_to_file.trim() }),
				new winston.transports.Console({ format: winston.format.simple(), level: 'info' })
			]
		});
	}

	/**
	 * Entry point of the Teamscale JavaScript Profiler.
	 */
	public static run(): void {
		// Parse the command line arguments
		const config = this.parseArguments();

		// Build the logger
		const logger = this.buildLogger(config);
		logger.info(`Starting collector in working directory "${process.cwd()}".`);
		logger.info(`Logging to "${config.log_to_file}".`);

		// Prepare the storage and the server
		const storage = new DataStorage(logger);
		const server = new WebSocketCollectingServer(config.port, storage, logger);

		// Start the server socket.
		// ATTENTION: The server is executed asynchronously
		server.start();

		// Optionally, start a timer that dumps the coverage after a N seconds
		this.maybeStartDumpTimer(config, storage, logger);

		// Say bye bye on CTRL+C and exit the process
		process.on('SIGINT', () => {
			logger.info('Bye bye.');
			process.exit();
		});
	}

	/**
	 * Start a timer for dumping the data, depending on the configuration.
	 *
	 * @param config - The config that determines whether or not to do the timed dump.
	 * @param storage - The storage with the information to dump.
	 * @param logger - The logger to use.
	 */
	private static maybeStartDumpTimer(config: Parameters, storage: DataStorage, logger: Logger): void {
		if (config.dump_after_secs > 0) {
			const timer = setInterval(() => {
				try {
					const lines = storage.dumpToSimpleCoverageFile(config.dump_to_file);
					logger.info(`Conducted periodic coverage dump with ${lines} lines to ${config.dump_to_file}.`);
				} catch (e) {
					logger.error('Timed coverage dump failed.', e);
				}
			}, config.dump_after_secs * 1000);

			process.on('SIGINT', () => {
				// Stop the timed file dump
				if (timer) {
					clearInterval(timer);
				}

				// ... and do a final dump
				const written = storage.dumpToSimpleCoverageFile(config.dump_to_file);
				logger.info(`\nCaught interrupt signal. Written ${written} lines of the latest coverage.`);
			});
		}
	}
}

Main.run();
