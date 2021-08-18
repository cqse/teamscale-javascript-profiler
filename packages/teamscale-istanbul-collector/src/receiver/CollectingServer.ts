import * as WebSocket from 'ws';
import { IDataStorage } from '../storage/DataStorage';
import { Contract } from '@cqse/common-qualities';
import { IncomingMessage } from 'http';
import { Session } from './Session';
import { Logger } from 'winston';

const MESSAGE_TYPE_SOURCEMAP = 's';
const MESSAGE_TYPE_COVERAGE = 'c';
const INSTRUMENTATION_SUBJECT_SEPARATOR = ':';

/**
 * A WebSocket based implementation of a coverage receiver.
 * Receives coverage from instrumented JavaScript code.
 */
export class WebSocketCollectingServer {
	/**
	 * The WebSocket server component.
	 */
	private readonly _server: WebSocket.Server;

	/**
	 * The storage to put the received coverage information to for aggregation and further processing.
	 */
	private readonly _storage: IDataStorage;

	/**
	 * The logger to use.
	 */
	private readonly _logger: Logger;

	/**
	 * Constructor.
	 *
	 * @param port - The port the WebSocket server should listen on.
	 * @param storage - The storage to put the received coverage information to.
	 * @param logger - The logger to use.
	 */
	constructor(port: number, storage: IDataStorage, logger: Logger) {
		Contract.require(port > 0 && port < 65536, 'Port must be valid (range).');
		this._storage = Contract.requireDefined(storage);
		this._logger = Contract.requireDefined(logger);
		this._server = new WebSocket.Server({ port: port });
	}

	/**
	 * Start the server socket, handle sessions and dispatch messages.
	 */
	public start(): void {
		this._logger.info(`Starting server on port ${this._server.options.port}.`);

		// Handle new connections from clients
		this._server.on('connection', (webSocket: WebSocket, req: IncomingMessage) => {
			let session: Session | null = new Session(req.socket, this._storage, this._logger);
			this._logger.debug(`Connection from: ${req.socket.remoteAddress}`);

			// Handle disconnecting clients
			webSocket.on('close', code => {
				if (session) {
					// Free the memory that is associated with the session (important!)
					session.destroy();
					session = null;
					this._logger.debug(`Closing with code ${code}`);
				}
			});

			// Handle incoming messages
			webSocket.on('message', (message: any) => {
				if (session) {
					this.handleMessage(session, message);
				}
			});

			// Handle errors
			webSocket.on('error', (e: Error) => {
				this._logger.error('Error on server socket triggered.', e);
			});
		});
	}

	/**
	 * Handle a message from a client.
	 *
	 * @param session - The session that has been started for the client.
	 * @param message - The message to handle.
	 */
	private handleMessage(session: Session, message: any) {
		if (session) {
			try {
				if (message.startsWith(MESSAGE_TYPE_SOURCEMAP)) {
					this.handleSourcemapMessage(session, message.substring(1));
				} else if (message.startsWith(MESSAGE_TYPE_COVERAGE)) {
					this.handleCoverageMessage(session, message.substring(1));
				}
			} catch (e) {
				this._logger.error(
					`Error while processing message starting with ${message.substring(0, Math.min(50, message.length))}`
				);
				this._logger.error(e.message);
			}
		}
	}

	/**
	 * Handle a source map message.
	 *
	 * @param session - The session to handle the message for.
	 * @param body - The body of the message (to be parsed).
	 */
	private handleSourcemapMessage(session: Session, body: string) {
		const fileIdSeparatorPosition = body.indexOf(INSTRUMENTATION_SUBJECT_SEPARATOR);
		if (fileIdSeparatorPosition > -1) {
			const fileId = body.substring(0, fileIdSeparatorPosition).trim();
			const sourcemap = body.substring(fileIdSeparatorPosition + 1);
			session.putSourcemap(fileId, sourcemap);
		}
	}

	/**
	 * Handle a message with coverage information.
	 *
	 * @param session - The session to handle the message for.
	 * @param body - The body of the message (to be parsed).
	 */
	private handleCoverageMessage(session: Session, body: string) {
		const bodyPattern = /(?<fileId>\S+) (?<positions>((\d+:\d+)\s+)*(\d+:\d+))/;
		const matches = bodyPattern.exec(body);
		if (matches && matches.groups) {
			const fileId = matches.groups['fileId'];
			const positions = (matches.groups['positions'] ?? '').split(/\s+/);
			for (const position of positions) {
				const [line, column] = position.split(':');
				session.putCoverage(fileId, Number.parseInt(line), Number.parseInt(column));
			}
		}
	}
}
