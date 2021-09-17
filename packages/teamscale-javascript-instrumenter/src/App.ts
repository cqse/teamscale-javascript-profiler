import { ArgumentParser } from 'argparse';
import { InstrumentationTask, TaskResult } from './instrumenter/Task';
import { IInstrumenter, IstanbulInstrumenter } from './instrumenter/Instrumenter';
import { Contract } from '@cqse/commons';
import { ConfigurationParameters, TaskBuilder } from './instrumenter/TaskBuilder';
import * as path from 'path';
import { version } from '../package.json';
import winston, { Logger } from 'winston';

/**
 * Entry points of the instrumenter, including command line argument parsing.
 */
export class App {
	/**
	 * Main function of the instrumenter.
	 * Parses the command line options and the instrumentation accordingly.
	 */
	public static async run(): Promise<TaskResult> {
		// Parsing of command line arguments:
		// Build the configuration object from the command line arguments.
		const parser: ArgumentParser = this.buildParser();
		const config = parser.parse_args();

		// Build the logger
		const logger = this.buildLogger(config);

		// Run the instrumenter with the given configuration.
		return this.runForConfigArguments(config, logger);
	}

	/**
	 * Build the command line argument parser.
	 */
	private static buildParser(): ArgumentParser {
		const parser = new ArgumentParser({
			description: 'Instrumenter of the Teamscale JavaScript Profiler'
		});

		parser.add_argument('-v', '--version', { action: 'version', version });
		parser.add_argument('-i', '--in-place', { action: 'store_true' });
		parser.add_argument('-d', '--debug', { action: 'store_true' });
		parser.add_argument('-o', '--to', {
			help: 'Name of the file to write the instrumented version to.'
		});
		parser.add_argument('-s', '--source-map', {
			help: 'External location of source-map files to consider.'
		});
		parser.add_argument('-c', '--collector', {
			help: 'The collector (host:port) to send coverage information to.',
			default: 'localhost:54678'
		});
		parser.add_argument('-x', '--exclude-origin', {
			help: 'Glob pattern of files in the source origin to not produce coverage for.'
		});
		parser.add_argument('-k', '--include-origin', {
			help: 'Glob pattern of files in the source origin to produce coverage for.'
		});
		parser.add_argument('inputs', { nargs: '+', help: 'The input file(s) to instrument.' });

		return parser;
	}

	/**
	 * Construct the logger.
	 */
	private static buildLogger(config: ConfigurationParameters): winston.Logger {
		return winston.createLogger({
			level: config.debug ? 'debug' : 'info',
			format: winston.format.json(),
			defaultMeta: {},
			transports: [
				new winston.transports.File({ filename: 'logs/instrumenter-error.log', level: 'error' }),
				new winston.transports.File({ filename: 'logs/instrumenter-combined.log' }),
				new winston.transports.Console({ format: winston.format.simple(), level: 'info' })
			]
		});
	}

	/**
	 * A logger for testing.
	 */
	private static buildDummyLogger(): Logger {
		return winston.createLogger({
			level: 'info',
			format: winston.format.json(),
			defaultMeta: {},
			transports: [new winston.transports.Console({ format: winston.format.simple(), level: 'info' })]
		});
	}

	/**
	 * The instrumenter can also be started by providing the configuration dictionary explicitly.
	 *
	 * @param config - The dictionary with all configuration arguments.
	 * @param logger - The logger to use.
	 */
	public static runForConfigArguments(config: ConfigurationParameters, logger?: Logger): Promise<TaskResult> {
		const task: InstrumentationTask = this.createInstrumentationTask(config);
		Contract.require(task.elements.length > 0, 'The instrumentation task must not be empty.');

		return this.createInstrumenter(logger ?? this.buildDummyLogger()).instrument(task);
	}

	private static createInstrumentationTask(config: ConfigurationParameters): InstrumentationTask {
		return new TaskBuilder().addFromConfig(config).build();
	}

	private static createInstrumenter(logger: Logger): IInstrumenter {
		return new IstanbulInstrumenter(path.join(__dirname, '../dist/vaccine.js'), logger);
	}
}
