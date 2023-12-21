import { Socket } from 'net';
import { IDataStorage } from '../storage/DataStorage';
import { Contract } from '@cqse/commons';
import Logger from 'bunyan';

/**
 * Coverage information that has not been mapped back to the
 * original code using a source map.
 */
export type UnmappedCoverage = {
	fileId: string;
	startLine: number;
	startColumn: number;
	endLine: number;
	endColumn: number;
};

/**
 * The session maintains the relevant information for a client.
 * One session is created for each client.
 * The mapping based on sourcemaps is conducted here.
 */
export class Session {
	/**
	 * The client socket.
	 */
	private readonly socket: Socket;

	/**
	 * The storage to forward coverage information to for aggregation.
	 */
	private readonly storage: IDataStorage;

	/**
	 * The logger to use.
	 */
	private readonly logger: Logger;

	/**
	 * The project the coverage information is for.
	 */
	private readonly projectId: string;

	/**
	 * Constructor
	 *
	 * @param socket - The client socket.
	 * @param storage - The storage to store and aggregate coverage information in.
	 * @param logger - The logger to use.
	 */
	constructor(socket: Socket, storage: IDataStorage, logger: Logger) {
		this.socket = Contract.requireDefined(socket);
		this.storage = Contract.requireDefined(storage);
		this.logger = Contract.requireDefined(logger);
		this.projectId = ''; // We currently only support coverage for one project.
	}

	/**
	 * Put coverage information to the storage for aggregation.
	 * This method also conducts the mapping based on the source map.
	 *
	 * @param fileId - The identifier of the instrumented bundle (file).
	 * @param startLine - The line number within the bundle the range starts.
	 * @param startColumn - The column in the given `startLine` on that the range starts (inclusive).
	 * @param endLine - The line number within the bundle the range ends.
	 * @param endColumn - The column in the given `startLine` on that the range ends (inclusive).
	 */
	public putLineCoverage(
		fileId: string,
		startLine: number,
		endLine: number,
	): void {
		const lines: number[] = [];
		for (let i=startLine; i<=endLine; i++) {
			lines.push(i);
		}

		this.storage.putCoverage(this.projectId, fileId, lines);
	}

}
