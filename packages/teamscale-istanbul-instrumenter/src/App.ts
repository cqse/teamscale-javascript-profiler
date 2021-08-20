import { ArgumentParser } from 'argparse';
import { InstrumentationTask, TaskResult } from './instrumenter/Task';
import { IInstrumenter, IstanbulInstrumenter } from './instrumenter/Instrumenter';
import { Contract } from '@cqse/common-qualities';
import { TaskBuilder } from './instrumenter/TaskBuilder';
import * as path from 'path';

const { version } = require('../package.json');

export type ConfigurationParameters = {
	inputs?: string[];
	in_place?: boolean;
	to?: string;
	source_map?: string;
	collector?: string;
	include_origin?: string;
	exclude_origin?: string;
};

/**
 * Entry points of the instrumenter, including command line argument parsing.
 */
export class App {
	private static buildParser(): ArgumentParser {
		const parser = new ArgumentParser({
			description: 'Instrumenter of the Teamscale JavaScript Profiler'
		});

		parser.add_argument('-v', '--version', { action: 'version', version });
		parser.add_argument('-i', '--in-place', { action: 'store_true' });
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
	 * Main function of the instrumenter.
	 * Parses the command line options and the instrumentation accordingly.
	 */
	public static async run(): Promise<TaskResult> {
		// Parsing of command line arguments:
		// Build the configuration object from the command line arguments.
		const parser: ArgumentParser = this.buildParser();
		const config = parser.parse_args();

		// Run the instrumenter with the given configuration.
		return this.runForConfigArguments(config);
	}

	/**
	 * The instrumenter can also be started by providing the configuration dictionary explicitly.
	 *
	 * @param config - The dictionary with all configuration arguments.
	 */
	public static runForConfigArguments(config: ConfigurationParameters): Promise<TaskResult> {
		const task: InstrumentationTask = this.createInstrumentationTask(config);
		Contract.require(task.elements.length > 0, 'The instrumentation task must not be empty.');

		return this.createInstrumenter(config).instrument(task);
	}

	private static createInstrumentationTask(config: any): InstrumentationTask {
		return new TaskBuilder().addFromConfig(config).build();
	}

	private static createInstrumenter(config: any): IInstrumenter {
		return new IstanbulInstrumenter(path.join(__dirname, '../dist/vaccine.js'), true);
	}
}
