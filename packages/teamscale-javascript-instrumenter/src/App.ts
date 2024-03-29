import { ArgumentParser } from 'argparse';
import { InstrumentationTask, TaskResult } from './instrumenter/Task';
import { IInstrumenter, IstanbulInstrumenter } from './instrumenter/Instrumenter';
import { Contract } from '@cqse/commons';
import { ConfigurationParameters, TaskBuilder } from './instrumenter/TaskBuilder';
import * as path from 'path';
import { version } from '../package.json';
import { existsSync } from 'fs';
import { mkdirp } from 'mkdirp';
import Logger from 'bunyan';
import { CollectorSpecifier } from './vaccine/types';

/**
 * Entry points of the instrumenter, including command line argument parsing.
 */
export class App {
	/**
	 * Main function of the instrumenter.
	 * Parses the command line options and the instrumentation accordingly.
	 */
	public static async run(): Promise<TaskResult> {
		const config = this.parseCommandLine();

		// Build the logger
		const logger = this.buildLogger(config);
		logger.trace('Retrieved arguments', process.argv);
		logger.trace('Translated arguments to config', config);

		// Run the instrumenter with the given configuration.
		return this.runForConfigArguments(config, logger);
	}

	/**
	 * Parses the command-line arguments.
	 * 
	 * @param args Optional. For testing. If given, uses this as the arguments to parse and does not exit the process on errors.
	 *   If not given, uses the NodeJS process's arguments and exits on errors.
	 */
	public static parseCommandLine(args?: string[]): ConfigurationParameters {
		const parser: ArgumentParser = this.buildParser();
		return parser.parse_args(args);
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
			description: 'Instrumenter of the Teamscale JavaScript Profiler',
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
		parser.add_argument('--relative-collector', {
			help: 'Pattern used to determine the collector URL from the application hostname.'
				+ ' Useful for Kubernetes deployments where the collector URL is not known at instrumentation time.'
				+ ' Example: `replace-in-host:app collector,scheme:wss`.'
				+ ' This causes the first occurrence of `app` in the application hostname to be replaced with `collector`'
				+ ' and the URL scheme changed to wss.'
				+ ' Available operations:'
				+ ' `replace-in-host:SEARCH REPLACE` replaces the literal term SEARCH once in the hostname with REPLACE.'
				+ ' `port:NUMBER` changes the port to NUMBER.'
				+ ' `port:keep` keeps the port of the application (instead of using the chosen scheme\'s default port).'
				+ ' `scheme:SCHEME` changes the URL scheme to one of ws, wss, http or https.'
				+ ' `path:PATH` uses the URL path PATH (instead of no path).'

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
