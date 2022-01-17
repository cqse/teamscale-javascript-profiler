#!/usr/bin/env node

import { version } from '../package.json';
import { ArgumentParser } from 'argparse';
import winston, { Logger } from 'winston';
import { DataStorage } from './storage/DataStorage';
import { WebSocketCollectingServer } from './receiver/CollectingServer';
import 'dotenv/config';
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import QueryParameters from './utils/QueryParameters';

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
	log_level: string;
	// eslint-disable-next-line camelcase
	dump_after_mins: number;
	debug: boolean;
	port: number;
	// eslint-disable-next-line camelcase
	upload_to_teamscale?: string;
	// eslint-disable-next-line camelcase
	teamscale_api_key?: string;
	// eslint-disable-next-line camelcase
	teamscale_project?: string;
	// eslint-disable-next-line camelcase
	teamscale_user?: string;
	// eslint-disable-next-line camelcase
	teamscale_partition?: string;
	// eslint-disable-next-line camelcase
	teamscale_commit?: string;
	// eslint-disable-next-line camelcase
	teamscale_branch?: string;
	// eslint-disable-next-line camelcase
	teamscale_repository?: string;
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
		parser.add_argument('-e', '--log-level', { help: 'Log level', default: 'info' });
		parser.add_argument('-t', '--dump-after-mins', {
			help: 'Dump the coverage information to the target file every N minutes.',
			default: 2
		});
		parser.add_argument('-d', '--debug', {
			help: 'Print received coverage information to the terminal?',
			default: false
		});

		// Parameters for the upload to Teamscale
		parser.add_argument('-u', '--upload-to-teamscale', {
			help: 'Upload the coverage to the given Teamscale server URL, for example, https://teamscale.dev.example.com:8080/production/.',
			default: process.env.UPLOAD_TO_TEAMSCALE_URL
		});
		parser.add_argument('--teamscale-api-key', {
			help: 'The API key to use for uploading to Teamscale.',
			default: process.env.TEAMSCALE_API_KEY
		});
		parser.add_argument('--teamscale-project', {
			help: 'The project to upload coverage to.',
			default: process.env.TEAMSCALE_PROJECT
		});
		parser.add_argument('--teamscale-user', {
			help: 'The user for uploading coverage to Teamscale.',
			default: process.env.TEAMSCALE_USER
		});
		parser.add_argument('--teamscale-partition', {
			help: 'The partition to upload coverage to.',
			default: process.env.TEAMSCALE_PARTITION
		});
		parser.add_argument('--teamscale-commit', {
			help: 'The commit to upload coverage for.',
			default: process.env.TEAMSCALE_COMMIT
		});
		parser.add_argument('--teamscale-branch', {
			help: 'The branch to upload coverage for.',
			default: process.env.TEAMSCALE_BRANCH
		});
		parser.add_argument('--teamscale-repository', {
			help: 'The repository to upload coverage for.',
			default: process.env.TEAMSCALE_REPOSITORY
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
			level: config.log_level,
			format: winston.format.json(),
			defaultMeta: {},
			transports: [
				new winston.transports.File({ filename: 'logs/collector-error.log', level: 'error' }),
				new winston.transports.File({ filename: config.log_to_file.trim() }),
				new winston.transports.Console({ format: winston.format.simple(), level: config.log_level })
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
		logger.info(`Logging "${config.log_level}" to "${config.log_to_file}".`);

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
	 * @param config - The config that determines whether to do the timed dump or not.
	 * @param storage - The storage with the information to dump.
	 * @param logger - The logger to use.
	 */
	private static maybeStartDumpTimer(config: Parameters, storage: DataStorage, logger: Logger): void {
		if (config.dump_after_mins > 0) {
			const timer = setInterval(() => {
				this.dumpCoverage(config, storage, logger).then();
			}, config.dump_after_mins * 1000 * 60);

			process.on('SIGINT', async () => {
				// Stop the timed file dump
				if (timer) {
					clearInterval(timer);
				}

				// ... and do a final dump
				this.dumpCoverage(config, storage, logger).then();
				logger.info(`\nCaught interrupt signal. Terminating.`);
			});
		}
	}

	private static async dumpCoverage(config: Parameters, storage: DataStorage, logger: Logger): Promise<void> {
		try {
			// 1. Write to coverage file
			const lines = storage.dumpToSimpleCoverageFile(config.dump_to_file);
			logger.info(`Dumped ${lines} lines of coverage to ${config.dump_to_file}.`);

			// 2. Upload to Teamscale if configured
			if (config.upload_to_teamscale) {
				if (config.teamscale_api_key && config.teamscale_user) {
					const coverageData = fs.readFileSync(config.dump_to_file);

					const form = new FormData();
					form.append('report', coverageData, 'coverage.simple');

					const parameters = new QueryParameters();
					parameters.addIfDefined('format', 'SIMPLE');
					parameters.addIfDefined('message', 'JavaScript coverage upload');
					parameters.addIfDefined('repository', config.teamscale_repository);
					parameters.addIfDefined('branch', config.teamscale_branch);
					parameters.addIfDefined('revision', config.teamscale_commit);
					parameters.addIfDefined('partition', config.teamscale_partition);

					const response = await axios.post(
						`${config.upload_to_teamscale}/api/projects/${
							config.teamscale_project
						}/external-analysis/session/auto-create/report?${parameters.toQueryParamString()}`,
						form,
						{
							auth: {
								username: config.teamscale_user,
								password: config.teamscale_api_key
							},
							headers: {
								accept: '*/*',
								'Content-Type': 'multipart/form-data'
							}
						}
					);

					logger.info(`Upload with response ${response.status} finished.`);
				} else {
					logger.error('Cannot upload to Teamscale: API key and user name must be configured!');
				}
			}
		} catch (e) {
			logger.error('Coverage dump failed.', e);
		}
	}
}

Main.run();
