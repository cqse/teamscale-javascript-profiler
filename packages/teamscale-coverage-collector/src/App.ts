import { ArgumentParser } from 'argparse';
import Logger, { LogLevel } from 'bunyan';
import { DataStorage } from './storage/DataStorage';
import { WebSocketCollectingServer } from './receiver/CollectingServer';
import 'dotenv/config';
import * as fs from 'fs';
import { buildParameterParser, ConfigParameters } from './utils/ConfigParameters';
import { mkdirp } from 'mkdirp';
import path from 'path';
import { StdConsoleLogger } from './utils/StdConsoleLogger';
import { PrettyFileLogger } from './utils/PrettyFileLogger';
import express from 'express';
import { uploadToTeamscale } from './upload/TeamscaleUpload';
import { UploadError } from './upload/CommonUpload';
import { uploadToArtifactory } from './upload/ArtifactoryUpload';

/**
 * The main class of the Teamscale JavaScript Collector.
 * Used to start the collector with a given configuration.
 */
export class App {
	/**
	 * Parse the given command line arguments into a corresponding options object.
	 */
	private static parseArguments(): ConfigParameters {
		const parser: ArgumentParser = buildParameterParser();
		return parser.parse_args() as ConfigParameters;
	}

	/**
	 * Construct the logger.
	 */
	private static buildLogger(config: ConfigParameters): Logger {
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
	public static runWithConfig(config: ConfigParameters): { stop: () => Promise<void> } {
		// Build the logger
		const logger = this.buildLogger(config);
		logger.info(`Starting collector in working directory "${process.cwd()}".`);
		logger.info(`Logging "${config.log_level}" to "${config.log_to_file}".`);

		// Prepare the storage and the server
		const storage = new DataStorage(logger);
		const server = new WebSocketCollectingServer(config.port, storage, logger);

		// Enable the remote control API if configured
		const controlServerState = this.startControlServer(config, storage, logger);

		// Start the server socket.
		// ATTENTION: The server is executed asynchronously
		const serverState = server.start();

		// Optionally, start a timer that dumps the coverage after N seconds
		const dumpTimerState = this.maybeStartDumpTimer(config, storage, logger);

		// Start a timer that informs if no coverage was received within the last minute
		const statsTimerState = this.startNoMessageTimer(logger, server);

		// Say bye bye on CTRL+C and exit the process
		process.on('SIGINT', async () => {
			// ... and do a final dump before.
			await this.dumpCoverage(config, storage, logger);

			logger.info('Bye bye.');
			process.exit();
		});

		return {
			async stop() {
				logger.info('Stopping the collector.');
				dumpTimerState.stop();
				statsTimerState.stop();
				await controlServerState.stop();
				serverState.stop();
			}
		};
	}

	/**
	 * Starts a timer that shows a message every min that no coverage
	 * was received until the opposite is the case.
	 */
	private static startNoMessageTimer(
		logger: Logger,
		server: WebSocketCollectingServer
	): { stop: () => void } {
		const startTime = Date.now();
		const timer = setInterval(
			async () => {
				const stats = server.getStatistics();
				if (stats.totalCoverageMessages === 0) {
					logger.info(`No coverage received for ${((Date.now() - startTime) / 1000.0).toFixed(0)}s.`);
				} else {
					// We can stop running the timer after we have received the first coverage.
					clearInterval(timer);
				}
			},
			1000 * 60
		);

		return {
			stop: () => clearInterval(timer)
		};
	}

	/**
	 * Start a timer for dumping the data, depending on the configuration.
	 *
	 * @param config - The config that determines whether to do the timed dump or not.
	 * @param storage - The storage with the information to dump.
	 * @param logger - The logger to use.
	 */
	private static maybeStartDumpTimer(
		config: ConfigParameters,
		storage: DataStorage,
		logger: Logger
	): { stop: () => void } {
		if (config.dump_after_mins > 0) {
			logger.info(`Will dump coverage information every ${config.dump_after_mins} minute(s).`);
			const timer = setInterval(
				async () => {
					await this.dumpCoverage(config, storage, logger);
				},
				config.dump_after_mins * 1000 * 60
			);

			process.on('SIGINT', () => {
				// Stop the timed file dump
				if (timer) {
					clearInterval(timer);
				}
			});

			return {
				stop: () => clearInterval(timer)
			};
		}

		return {
			stop() {
				// no timer to stop yet
			}
		};
	}

	private static async dumpCoverage(config: ConfigParameters, storage: DataStorage, logger: Logger): Promise<void> {
		try {
			// 1. Write coverage to a file
			const [coverageFile, lines] = storage.dumpToSimpleCoverageFile(config.dump_to_folder, new Date());
			logger.debug(`Dumped ${lines} lines of coverage to ${coverageFile}.`);

			// 2. Upload to Teamscale or Artifactory if configured
			if (config.teamscale_server_url || config.artifactory_server_url) {
				await this.uploadCoverage(config, coverageFile, lines, logger);
			}
		} catch (e) {
			if (e instanceof UploadError) {
				logger.error(
					`Coverage upload failed. The coverage files on disk (inside the folder "${config.dump_to_folder}") were not deleted. 
					You can still upload them manually.`,
					e
				);
			} else {
				logger.error('Coverage dump failed.', e);
			}
		}
	}

	private static async uploadCoverage(
		config: ConfigParameters,
		coverageFile: string,
		lines: number,
		logger: Logger
	): Promise<void> {
		if (config.teamscale_server_url) {
			await uploadToTeamscale(config, logger, coverageFile, lines);
		}
		if (config.artifactory_server_url) {
			await uploadToArtifactory(config, logger, coverageFile, lines);
		}
		// Delete coverage if upload was successful and keeping coverage files on disk was not configure by the user
		if (!config.keep_coverage_files) {
			fs.unlinkSync(coverageFile);
		}
	}

	private static startControlServer(
		config: ConfigParameters,
		storage: DataStorage,
		logger: Logger
	): { stop: () => Promise<void> } {
		if (!config.enable_control_port) {
			return {
				async stop() {
					// nothing to stop in this case
				}
			};
		}

		const controlServer = express();
		controlServer.use(express.text({}));
		const serverSocket = controlServer.listen(config.enable_control_port);

		controlServer.put('/partition', (request: express.Request<string>, response) => {
			const targetPartition = (request.body as string).trim();
			config.teamscale_partition = targetPartition;
			logger.info(`Switched the target partition to '${targetPartition}' via the control API.`);
			response.sendStatus(200);
		});

		controlServer.post('/dump', async (request, response) => {
			logger.info('Dumping coverage requested via the control API.');
			await this.dumpCoverage(config, storage, logger);
			response.sendStatus(200);
		});

		controlServer.put('/project', async (request: express.Request<string>, response) => {
			const targetProject = (request.body as string).trim();
			config.teamscale_project = targetProject;
			logger.info(`Switching the target project to '${targetProject}' via the control API.`);
			response.sendStatus(200);
		});

		controlServer.put('/revision', async (request: express.Request<string>, response) => {
			const targetRevision = (request.body as string).trim();
			config.teamscale_revision = targetRevision;
			logger.info(`Switching the target revision to '${targetRevision}' via the control API.`);
			response.sendStatus(200);
		});

		controlServer.put('/commit', async (request: express.Request<string>, response) => {
			const targetCommit = (request.body as string).trim();
			config.teamscale_commit = targetCommit;
			logger.info(`Switching the target commit to '${targetCommit}' via the control API.`);
			response.sendStatus(200);
		});

		controlServer.put('/message', async (request: express.Request<string>, response) => {
			const uploadMessage = (request.body as string).trim();
			config.teamscale_message = uploadMessage;
			logger.info(`Switching the upload message to '${uploadMessage}' via the control API.`);
			response.sendStatus(200);
		});

		controlServer.post('/reset', async (request, response) => {
			storage.discardCollectedCoverage();
			logger.info(`Discarding collected coverage information as requested via the control API.`);
			response.sendStatus(200);
		});

		logger.info(`Control server enabled at port ${config.enable_control_port}`);

		return {
			async stop() {
				return new Promise<void>(resolve => {
					serverSocket.close(() => resolve());
				});
			}
		};
	}
}
