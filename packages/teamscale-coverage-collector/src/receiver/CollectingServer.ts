import * as WebSocket from 'ws';
import { IDataStorage } from '../storage/DataStorage';
import { Contract } from '@cqse/commons';
import { IncomingMessage } from 'http';
import { Session } from './Session';
import Logger from 'bunyan';

/**
 * Various constants that are used to exchange data between
 * the instrumented application and the coverage collector.
 */
export enum ProtocolMessageTypes {
	/** A message that provides a source map */
	TYPE_SOURCEMAP = 's',

	/** A message that provides coverage information */
	TYPE_COVERAGE = 'c'
}

/**
 * A WebSocket based implementation of a coverage receiver.
 * Receives coverage from instrumented JavaScript code.
 */
export class WebSocketCollectingServer {
	/**
	 * The WebSocket server component.
	 */
	private server: WebSocket.Server | null;

	/**
	 * The storage to put the received coverage information to for aggregation and further processing.
	 */
	private readonly storage: IDataStorage;

	/**
	 * The logger to use.
	 */
	private readonly logger: Logger;

	/**
	 * Constructor.
	 *
	 * @param port - The port the WebSocket server should listen on.
	 * @param storage - The storage to put the received coverage information to.
	 * @param logger - The logger to use.
	 */
	constructor(port: number, storage: IDataStorage, logger: Logger) {
		Contract.require(port > 0 && port < 65536, 'Port must be valid (range).');
		this.storage = Contract.requireDefined(storage);
		this.logger = Contract.requireDefined(logger);
		this.server = new WebSocket.Server({ port });
	}

	/**
	 * Start the server socket, handle sessions and dispatch messages.
	 */
	public start(): { stop: () => void } {
		this.logger.info(`Starting server on port ${this.server?.options.port}.`);

		// Handle new connections from clients
		this.server?.on('connection', (webSocket: WebSocket, req: IncomingMessage) => {
			let session: Session | null = new Session(req.socket, this.storage, this.logger);
			this.logger.debug(`Connection from: ${req.socket.remoteAddress}`);

			// Handle disconnecting clients
			webSocket.on('close', code => {
				if (session) {
					session = null;
					this.logger.debug(`Closing with code ${code}`);
				}
			});

			// Handle incoming messages
			webSocket.on('message', (message: WebSocket.Data) => {
				if (session && Buffer.isBuffer(message)) {
					void this.handleMessage(session, message);
				}
			});

			// Handle errors
			webSocket.on('error', (e: Error) => {
				this.logger.error('Error on server socket triggered.', e);
			});
		});

		return {
			stop: () => {
				this.server?.close();
				this.server = null;
			}
		};
	}

	/**
	 * Handle a message from a client.
	 *
	 * @param session - The session that has been started for the client.
	 * @param message - The message to handle.
	 */
	private async handleMessage(session: Session, message: Buffer) {
		try {
			const messageType = message.toString('utf8', 0, 1);
			if (messageType.startsWith(ProtocolMessageTypes.TYPE_COVERAGE)) {
				await this.handleCoverageMessage(session, message.subarray(1));
			}
		} catch (e) {
			this.logger.error(
				`Error while processing message starting with ${message.toString(
					'utf8',
					0,
					Math.min(50, message.length)
				)}`
			);
			this.logger.error((e as Error).message);
		}
	}

	/**
	 * Handle a message with coverage information.
	 *
	 * @param session - The session to handle the message for.
	 * @param body - The body of the message (to be parsed).
	 */
	private async handleCoverageMessage(session: Session, body: Buffer) {
		// Replace semicolon separators with newline to make the splitting consistent.
		const input = body.toString().replace(/;/g, '\n');

		// Split the input into lines.
		const lines = input.split('\n').map(line => line.trim());

		// Placeholder for group/filename.
		let filename = '';

		lines.forEach(line => {
			// Check if the line starts with '@' - indicating a new group/filename.
			if (line.startsWith('@')) {
				filename = line.substring(1).trim(); // Remove '@' character and extra spaces.
			} else if (filename) {
				const range = line.substring(1, line.length-1).split(/,|-/).map(value => Number.parseInt(value));
				if (line.startsWith("l") && range.length === 2) {
					session.putLineCoverage(filename, range[0], range[1]);
				} else if (range.length === 4) {
					session.putLineCoverage(filename, range[0], range[2]);
				}
			}
		});
	}
}
