import { ArgumentParser } from 'argparse';
import { InstrumentationTask, TaskResult } from './instrumenter/Task';
import { IInstrumenter, IstanbulInstrumenter } from './instrumenter/Instrumenter';
import { Contract } from '@cqse/commons';
import { ConfigurationParameters, TaskBuilder } from './instrumenter/TaskBuilder';
import * as path from 'path';
import { version } from '../package.json';
import { existsSync } from 'fs';
import mkdirp from 'mkdirp';
import Logger from 'bunyan';
import {Config} from "prettier";

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

		// Postprocess config parameter
		this.postprocessConfig(config);

		// Build the logger
		const logger = this.buildLogger(config);

		// Run the instrumenter with the given configuration.
		return this.runForConfigArguments(config, logger);
	}

	/**
	 * Sometimes we get inputs from shell environments where the strings are
	 * still quoted. We remove those here.
	 */
	private static postprocessConfig(config: ConfigurationParameters): void {
		function unquoteString(originalString: string|undefined): string|undefined {
			if (originalString === undefined) {
				return originalString;
			}
			return originalString.replace(/^["'](.+(?=["']$))["']$/, '$1');
		}

		function unquoteStringElements(originalArray: string[]|undefined): string[]|undefined {
			if (originalArray === undefined) {
				return undefined;
			}
			return originalArray.map(s => unquoteString(s) ?? "");

		}

		config.source_map = unquoteString(config.source_map);
		config.inputs = unquoteStringElements(config.inputs);
		config.exclude_origin = unquoteStringElements(config.exclude_origin);
		config.include_origin = unquoteStringElements(config.include_origin);
		config.collector = unquoteString(config.collector) ?? "";
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
			help: 'External location of source-map files to consider.',
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
		parser.add_argument('-p', '--dump-origins-to', {
			help: 'Optional location specifying where to dump possible origins from the source map as a json file'
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
						write: (rec: Record<any, any>) => {
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
		const task: InstrumentationTask = this.createInstrumentationTask(config);
		Contract.require(task.elements.length > 0, 'The instrumentation task must not be empty.');

		return this.createInstrumenter(logger ?? this.buildDummyLogger()).instrument(task);
	}

	private static createInstrumentationTask(config: ConfigurationParameters): InstrumentationTask {
		return new TaskBuilder().addFromConfig(config).build();
	}

	private static createInstrumenter(logger: Logger): IInstrumenter {
		// We have to deal with two different `__dirname` versions,
		// which depends on whether we run from within the IDE or from
		// the command line:
		//     dist/src/    OR    src/
		const pathVariant1 = path.join(__dirname, '../vaccine.js');
		const pathVariant2 = path.join(__dirname, '../dist/vaccine.js');
		if (existsSync(pathVariant1)) {
			return new IstanbulInstrumenter(pathVariant1, logger);
		} else {
			return new IstanbulInstrumenter(pathVariant2, logger);
		}
	}
}
