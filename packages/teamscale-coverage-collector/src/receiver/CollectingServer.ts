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
 * Separates the instrumentation subject from the coverage information.
 */
const INSTRUMENTATION_SUBJECT_SEPARATOR = ':';

/**
 * A WebSocket based implementation of a coverage receiver.
 * Receives coverage from instrumented JavaScript code.
 */
export class WebSocketCollectingServer {
	/**
	 * The WebSocket server component.
	 */
	private readonly server: WebSocket.Server;

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
		this.server = new WebSocket.Server({ port: port });
	}

	/**
	 * Start the server socket, handle sessions and dispatch messages.
	 */
	public start(): void {
		this.logger.info(`Starting server on port ${this.server.options.port}.`);

		// Handle new connections from clients
		this.server.on('connection', (webSocket: WebSocket, req: IncomingMessage) => {
			let session: Session | null = new Session(req.socket, this.storage, this.logger);
			this.logger.debug(`Connection from: ${req.socket.remoteAddress}`);

			// Handle disconnecting clients
			webSocket.on('close', code => {
				if (session) {
					// Free the memory that is associated with the session (important!)
					session.destroy();
					session = null;
					this.logger.debug(`Closing with code ${code}`);
				}
			});

			// Handle incoming messages
			webSocket.on('message', (message: WebSocket.Data) => {
				if (session && typeof message === 'string') {
					this.handleMessage(session, message);
				}
			});

			// Handle errors
			webSocket.on('error', (e: Error) => {
				this.logger.error('Error on server socket triggered.', e);
			});
		});
	}

	/**
	 * Handle a message from a client.
	 *
	 * @param session - The session that has been started for the client.
	 * @param message - The message to handle.
	 */
	private handleMessage(session: Session, message: string) {
		try {
			if (message.startsWith(ProtocolMessageTypes.TYPE_SOURCEMAP)) {
				this.handleSourcemapMessage(session, message.substring(1));
			} else if (message.startsWith(ProtocolMessageTypes.TYPE_COVERAGE)) {
				this.handleCoverageMessage(session, message.substring(1));
			}
		} catch (e) {
			this.logger.error(
				`Error while processing message starting with ${message.substring(0, Math.min(50, message.length))}`
			);
			this.logger.error((e as Error).message);
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
			this.logger.debug(`Received source map information for ${fileId}`);
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
		const bodyPattern = /(?<fileId>\S+) (?<positions>((\d+:\d+(:\d+:\d+)?\s+)*(\d+:\d+(:\d+:\d+)?)))/;
		const matches = bodyPattern.exec(body);
		if (matches?.groups) {
			const fileId = matches.groups.fileId;
			const positions = (matches.groups.positions ?? '').split(/\s+/);
			for (const position of positions) {
				const positionParts = position.split(':');
				if (positionParts.length === 2) {
					session.putCoverage(
						fileId,
						Number.parseInt(positionParts[0]),
						Number.parseInt(positionParts[1]),
						Number.parseInt(positionParts[1]),
						Number.parseInt(positionParts[2])
					);
				} else if (positionParts.length === 4) {
					session.putCoverage(
						fileId,
						Number.parseInt(positionParts[0]),
						Number.parseInt(positionParts[1]),
						Number.parseInt(positionParts[2]),
						Number.parseInt(positionParts[3])
					);
				}
			}
		}
	}
}
