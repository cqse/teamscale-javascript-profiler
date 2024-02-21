import { ArgumentParser } from 'argparse';
import {CollectorSpecifier, InstrumentationTask, TaskResult} from './instrumenter/Task';
import { IInstrumenter, IstanbulInstrumenter } from './instrumenter/Instrumenter';
import { Contract } from '@cqse/commons';
import { ConfigurationParameters, TaskBuilder } from './instrumenter/TaskBuilder';
import * as path from 'path';
import { version } from '../package.json';
import { existsSync } from 'fs';
import { mkdirp } from 'mkdirp';
import Logger from 'bunyan';

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
		const config: ConfigurationParameters = parser.parse_args();

		// Build the logger
		const logger = this.buildLogger(config);
		logger.trace('Retrieved arguments', process.argv);
		logger.trace('Translated arguments to config', config);

		// Run the instrumenter with the given configuration.
		return this.runForConfigArguments(config, logger);
	}

	/**
	 * Sometimes we get inputs from shell environments where the strings are
	 * still quoted. We remove those here.
	 */
	public static postprocessConfig(config: ConfigurationParameters): void {
		function unquoteString(originalString: string | undefined): string | undefined {
			if (originalString === undefined) {
				return originalString;
			}
			const result = originalString.replace(/^["'](.+(?=["']$))["']$/, '$1');
			if (result === originalString) {
				return result;
			} else {
				return unquoteString(result);
			}
		}

		function unquoteStringElements(originalArray: unknown[] | undefined): unknown[] | undefined {
			if (originalArray === undefined) {
				return undefined;
			}

			return originalArray.map(s => {
				if (typeof s === 'string') {
					return unquoteString(s);
				} else {
					return s;
				}
			});
		}

		for (const [property, value] of Object.entries(config)) {
			if (value === undefined) {
				// In case the value is 'undefined' we can ignore this.
			} else if (typeof value === 'string') {
				// eslint-disable-next-line  @typescript-eslint/no-explicit-any
				(config as any)[property] = unquoteString(value);
			} else if (Array.isArray(value)) {
				// eslint-disable-next-line  @typescript-eslint/no-explicit-any
				(config as any)[property] = unquoteStringElements(value);
			}
		}
	}

	/**
	 * Build the command line argument parser.
	 */
	private static buildParser(): ArgumentParser {
		const parser = new ArgumentParser({
			description: 'Instrumenter of the Teamscale JavaScript Profiler'
		});

		parser.add_argument('-v', '--version', { action: 'version', version });
		parser.add_argument('-i', '--in-place', {
			action: 'store_true',
			help: 'If set, the original files to instrument are replaced by their instrumented counterparts.'
		});
		parser.add_argument('-d', '--debug', { action: 'store_true' });
		parser.add_argument('-o', '--to', {
			help: 'Path (directory or file name) to write the instrumented version to.'
		});
		parser.add_argument('-s', '--source-map', {
			help: 'External location of source-map files to consider.'
		});
		parser.add_argument('-c', '--collector', {
			help: 'The collector (`host:port` or `wss://host:port/` or `ws://host:port/`) to send coverage information to.',
			default: 'ws://localhost:54678'
		});
		parser.add_argument('-x', '--exclude-origin', {
			nargs: '*',
			help: 'Glob pattern(s) of files in the source origin to not produce coverage for. Multiple patterns can be separated by space.'
		});
		parser.add_argument('-k', '--include-origin', {
			nargs: '*',
			help: 'Glob pattern(s) of files in the source origin to produce coverage for. Multiple patterns can be separated by space.'
		});
		parser.add_argument('-e', '--exclude-bundle', {
			nargs: '*',
			help: 'Glob pattern(s) of input (bundle) files to keep unchanged (to not instrument).'
		});
		parser.add_argument('-p', '--dump-origins-to', {
			help: 'Path specifying where to dump source origins file names, based on the source maps, as a JSON file.'
		});
		parser.add_argument('-m', '--dump-origin-matches-to', {
			help: 'Path specifying where to dump a JSON with the names of the files that have matched the origin include/exclude patterns.'
		});
		parser.add_argument('inputs', { nargs: '+', help: 'The input file(s) to instrument.' });

		return parser;
	}

	/**
	 * Construct the logger.
	 */
	private static buildLogger(config: ConfigurationParameters): Logger {
		const logfilePath = 'logs/instrumenter.log';
		mkdirp.sync(path.dirname(logfilePath));

		const logLevel = config.debug ? 'debug' : 'error';
		return Logger.createLogger({
			name: 'Instrumenter',
			streams: [
				{
					level: logLevel,
					stream: {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						write: (rec: any) => {
							console.log(
								'[%s] %s: %s',
								rec.time.toISOString(),
								Logger.nameFromLevel[rec.level],
								rec.msg
							);
						}
					},
					type: 'raw'
				},
				{
					level: logLevel,
					path: logfilePath
				}
			]
		});
	}

	/**
	 * A logger for testing.
	 */
	private static buildDummyLogger(): Logger {
		return Logger.createLogger({ name: 'Instrumenter' });
	}

	/**
	 * The instrumenter can also be started by providing the configuration dictionary explicitly.
	 *
	 * @param config - The dictionary with all configuration arguments.
	 * @param logger - The logger to use.
	 */
	public static runForConfigArguments(config: ConfigurationParameters, logger?: Logger): Promise<TaskResult> {
		this.postprocessConfig(config);

		const task: InstrumentationTask = this.createInstrumentationTask(config);
		Contract.require(task.elements.length > 0, 'The instrumentation task must not be empty.');

		return this.createInstrumenter(logger ?? this.buildDummyLogger(), task.collector).instrument(task);
	}

	private static createInstrumentationTask(config: ConfigurationParameters): InstrumentationTask {
		return new TaskBuilder().addFromConfig(config).build();
	}

	private static createInstrumenter(logger: Logger, collector: CollectorSpecifier): IInstrumenter {
		// We have to deal with two different `__dirname` versions,
		// which depends on whether we run from within the IDE or from
		// the command line:
		//     dist/src/    OR    src/
		const pathVariant1 = path.join(__dirname, '../vaccine.js');
		const pathVariant2 = path.join(__dirname, '../dist/vaccine.js');
		if (existsSync(pathVariant1)) {
			return new IstanbulInstrumenter(pathVariant1, logger, collector);
		} else {
			return new IstanbulInstrumenter(pathVariant2, logger, collector);
		}
	}
}
