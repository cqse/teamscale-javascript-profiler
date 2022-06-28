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
import {buildParameterParser, Parameters} from './Parameters';
import { inspect } from 'util';
import mkdirp from 'mkdirp';
import path from 'path';
import { StdConsoleLogger } from './utils/StdConsoleLogger';
import { PrettyFileLogger } from './utils/PrettyFileLogger';
import express from 'express';

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
export class App {

	/**
	 * Parse the given command line arguments into a corresponding options object.
	 */
	private static parseArguments(): Parameters {
		const parser: ArgumentParser = buildParameterParser();
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

		App.runWithConfig(config);
	}

	/**
	 * Run the collector with the given configuration options.
	 *
	 * @param config - The configuration options to run the collector with.
	 */
	public static runWithConfig(config: Parameters): void {
		// Build the logger
		const logger = this.buildLogger(config);
		logger.info(`Starting collector in working directory "${process.cwd()}".`);
		logger.info(`Logging "${config.log_level}" to "${config.log_to_file}".`);

		// Prepare the storage and the server
		const storage = new DataStorage(logger);
		const server = new WebSocketCollectingServer(config.port, storage, logger);

		// Enable the remote control API if configured
		this.startControlServer(config, storage, logger);

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

	private static startControlServer(config: Parameters, storage: DataStorage, logger: Logger) {
		if (!config.enable_control_port) {
			return;
		}

		const controlServer = express();
		controlServer.use(express.text({}));
		controlServer.listen(config.enable_control_port);

		controlServer.put('/partition', (request: express.Request<string>) => {
			const targetPartition = (request.body as string).trim();
			config.teamscale_partition = targetPartition;
			logger.info(`Switched the target partition to '${targetPartition}' via the control API.`);
		});

		controlServer.post('/dump', async () => {
			logger.info('Dumping coverage requested via the control API.');
			await this.dumpCoverage(config, storage, logger);
		});

		controlServer.post('/revision', async (request: express.Request<string>) => {
			const targetRevision = (request.body as string).trim();
			config.teamscale_commit = targetRevision;
			logger.info(`Switching the target revision to '${targetRevision}' via the control API.`);
		});

		controlServer.post('/commit', async (request: express.Request<string>) => {
			const targetCommit = (request.body as string).trim();
			config.teamscale_revision = targetCommit;
			logger.info(`Switching the target commit to '${targetCommit}' via the control API.`);
		});

		controlServer.post('/message', async (request: express.Request<string>) => {
			const uploadMessage = (request.body as string).trim();
			config.teamscale_message = uploadMessage;
			logger.info(`Switching the upload message to '${uploadMessage}' via the control API.`);
		});

		controlServer.post('/discard', async () => {
			storage.discardCollectedCoverage();
			logger.info(`Discarding collected coverage information as requested via the control API.`);
		});

		logger.info(`Control server enabled at port ${config.enable_control_port}`);
	}
}

