#!/usr/bin/env node

import { version } from '../package.json';
import { ArgumentParser } from 'argparse';
import Logger, { LogLevel } from 'bunyan';
import { DataStorage } from './storage/DataStorage';
import { WebSocketCollectingServer } from './receiver/CollectingServer';
import 'dotenv/config';
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import QueryParameters from './utils/QueryParameters';
import { inspect } from 'util';
import mkdirp from 'mkdirp';
import path from 'path';
import { StdConsoleLogger } from './utils/StdConsoleLogger';
import { PrettyFileLogger } from './utils/PrettyFileLogger';

/**
 * The command line parameters the profiler can be configured with.
 *
 * ATTENTION: We use snake_case here because ArgParse creates
 * the parameters that way---as in Python from which ArgParse stems.
 */
type Parameters = {
	// eslint-disable-next-line camelcase
	dump_to_folder: string;
	// eslint-disable-next-line camelcase
	log_to_file: string;
	// eslint-disable-next-line camelcase
	keep_coverage_files: boolean;
	// eslint-disable-next-line camelcase
	log_level: string;
	// eslint-disable-next-line camelcase
	dump_after_mins: number;
	port: number;
	// eslint-disable-next-line camelcase
	json_log: boolean;
	// eslint-disable-next-line camelcase
	teamscale_server_url?: string;
	// eslint-disable-next-line camelcase
	teamscale_access_token?: string;
	// eslint-disable-next-line camelcase
	teamscale_project?: string;
	// eslint-disable-next-line camelcase
	teamscale_user?: string;
	// eslint-disable-next-line camelcase
	teamscale_partition?: string;
	// eslint-disable-next-line camelcase
	teamscale_revision?: string;
	// eslint-disable-next-line camelcase
	teamscale_commit?: string;
	// eslint-disable-next-line camelcase
	teamscale_repository?: string;
	// eslint-disable-next-line camelcase
	teamscale_message?: string;
};

/**
 * Error that is thrown when the upload to Teamscale failed
 */
class TeamscaleUploadError extends Error {
	// No special fields needed compared to Error.
	// Sole use is to be able to distinguish Teamscale upload errors from other errors.
}

/**
 * The main class of the Teamscale JavaScript Collector.
 * Used to start the collector for with a given configuration.
 */
export class Main {
	private static readonly DEFAULT_COVERAGE_LOCATION = 'coverage';

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
		parser.add_argument('-f', '--dump-to-folder', {
			help: 'Target folder for coverage files.',
			default: this.DEFAULT_COVERAGE_LOCATION
		});
		parser.add_argument('-k', '--keep-coverage-files', {
			help: 'Whether to keep the coverage files on disk after a successful upload to Teamsacle',
			action: 'store_true',
			default: false
		});
		parser.add_argument('-l', '--log-to-file', { help: 'Log file', default: 'logs/collector-combined.log' });
		parser.add_argument('-e', '--log-level', { help: 'Log level', default: 'info' });
		parser.add_argument('-t', '--dump-after-mins', {
			help: 'Dump the coverage information to the target file every N minutes.',
			default: 360
		});
		parser.add_argument('-d', '--debug', {
			help: 'Print received coverage information to the terminal?',
			default: false
		});
		parser.add_argument('-j', '--json-log', {
			help: 'Additional JSON-like log file format.',
			action: 'store_true'
		});

		// Parameters for the upload to Teamscale
		parser.add_argument('-u', '--teamscale-server-url', {
			help: 'Upload the coverage to the given Teamscale server URL, for example, https://teamscale.dev.example.com:8080/production.',
			default: process.env.TEAMSCALE_SERVER_URL
		});
		parser.add_argument('--teamscale-access-token', {
			help: 'The API key to use for uploading to Teamscale.',
			default: process.env.TEAMSCALE_ACCESS_TOKEN
		});
		parser.add_argument('--teamscale-project', {
			help: 'The project ID to upload coverage to.',
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
		parser.add_argument('--teamscale-revision', {
			help: 'The revision (commit hash, version id) to upload coverage for.',
			default: process.env.TEAMSCALE_REVISION
		});
		parser.add_argument('--teamscale-commit', {
			help: 'The branch and timestamp to upload coverage for, separated by colon.',
			default: process.env.TEAMSCALE_COMMIT
		});
		parser.add_argument('--teamscale-repository', {
			help: 'The repository to upload coverage for. Optional: Only needed when uploading via revision to a project that has more than one connector.',
			default: process.env.TEAMSCALE_REPOSITORY
		});
		parser.add_argument('--teamscale-message', {
			help: 'The commit message shown within Teamscale for the coverage upload. Default is "JavaScript coverage upload".',
			default: process.env.TEAMSCALE_MESSAGE ?? 'JavaScript coverage upload'
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
	private static buildLogger(config: Parameters): Logger {
		const logfilePath = config.log_to_file.trim();
		mkdirp.sync(path.dirname(logfilePath));

		const logLevel = config.log_level as LogLevel;
		const logger = Logger.createLogger({
			name: 'Collector',
			streams: [
				// console output
				{ level: logLevel, stream: new StdConsoleLogger(), type: 'raw' },
				// default log file
				{ level: logLevel, stream: new PrettyFileLogger(fs.createWriteStream(logfilePath)), type: 'raw' }
			]
		});

		// If the given flag is set, we also log with a JSON-like format
		if (config.json_log) {
			logger.addStream({ level: logLevel, path: `${logfilePath}.json` });
		}

		return logger;
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
		process.on('SIGINT', async () => {
			// ... and do a final dump before.
			await this.dumpCoverage(config, storage, logger).then();

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
			logger.info(`Will dump coverage information every ${config.dump_after_mins} minute(s).`);
			const timer = setInterval(() => {
				this.dumpCoverage(config, storage, logger).then();
			}, config.dump_after_mins * 1000 * 60);

			process.on('SIGINT', () => {
				// Stop the timed file dump
				if (timer) {
					clearInterval(timer);
				}
			});
		}
	}

	private static async dumpCoverage(config: Parameters, storage: DataStorage, logger: Logger): Promise<void> {
		try {
			// 1. Write coverage to a file
			const [coverageFile, lines] = storage.dumpToSimpleCoverageFile(config.dump_to_folder, new Date());
			logger.info(`Dumped ${lines} lines of coverage to ${coverageFile}.`);

			// 2. Upload to Teamscale if configured
			if (config.teamscale_server_url) {
				await this.uploadToTeamscale(config, logger, coverageFile, lines);
				// Delete coverage if upload was successful and keeping coverage files on disk was not configure by the user
				if (!config.keep_coverage_files) {
					fs.unlinkSync(coverageFile);
				}
			}
		} catch (e) {
			if (e instanceof TeamscaleUploadError) {
				logger.error(
					`Teamscale upload failed. The coverage files on disk (inside the folder "${config.dump_to_folder}") were not deleted. 
					You can still upload them manually.`,
					e
				);
			} else {
				logger.error('Coverage dump failed.', e);
			}
		}
	}

	private static async uploadToTeamscale(config: Parameters, logger: Logger, coverageFile: string, lines: number) {
		if (!(config.teamscale_access_token && config.teamscale_user && config.teamscale_server_url)) {
			throw new TeamscaleUploadError('API key and user name must be configured!');
		}

		if (lines === 0) {
			return;
		}

		logger.info('Preparing upload to Teamscale');

		const form = this.prepareFormData(coverageFile);
		const queryParameters = this.prepareQueryParameters(config);
		await this.performTeamscaleUpload(config, queryParameters, form, logger);
	}

	private static async performTeamscaleUpload(
		config: Parameters,
		parameters: QueryParameters,
		form: FormData,
		logger: Logger
	) {
		await axios
			.post(
				`${config.teamscale_server_url?.replace(/\/$/, '')}/api/projects/${
					config.teamscale_project
				}/external-analysis/session/auto-create/report?${parameters.toString()}`,
				form,
				{
					auth: {
						username: config.teamscale_user ?? 'no username provided',
						password: config.teamscale_access_token ?? 'no password provided'
					},
					headers: {
						Accept: '*/*',
						'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
					}
				}
			)
			.catch(function (error) {
				if (error.response) {
					const response = error.response;
					if (response.status >= 400) {
						throw new TeamscaleUploadError(
							`Upload failed with code ${response.status}: ${response.statusText}. Response Data: ${response.data}`
						);
					} else {
						logger.info(`Upload with status code ${response.status} finished.`);
					}
				} else if (error.request) {
					throw new TeamscaleUploadError(`Upload request did not receive a response.`);
				}

				if (error.message) {
					logger.debug(
						`Something went wrong when uploading data: ${error.message}. Details of the error: ${inspect(
							error
						)}`
					);
					throw new TeamscaleUploadError(`Something went wrong when uploading data: ${error.message}`);
				} else {
					throw new TeamscaleUploadError(`Something went wrong when uploading data: ${inspect(error)}`);
				}
			});
	}

	private static prepareQueryParameters(config: Parameters) {
		const parameters = new QueryParameters();
		parameters.addIfDefined('format', 'SIMPLE');
		parameters.addIfDefined('message', config.teamscale_message);
		parameters.addIfDefined('repository', config.teamscale_repository);
		parameters.addIfDefined('t', config.teamscale_commit);
		parameters.addIfDefined('revision', config.teamscale_revision);
		parameters.addIfDefined('partition', config.teamscale_partition);
		return parameters;
	}

	private static prepareFormData(coverageFile: string) {
		const form = new FormData();
		form.append('report', fs.createReadStream(coverageFile), 'coverage.simple');
		return form;
	}
}

Main.run();
