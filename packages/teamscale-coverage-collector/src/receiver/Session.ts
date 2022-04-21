import { Socket } from 'net';
import * as sourceMap from 'source-map';
import { Position, BasicSourceMapConsumer, NullableMappedPosition } from 'source-map';
import { IDataStorage } from '../storage/DataStorage';
import { Contract } from '@cqse/commons';
import Logger from "bunyan";

/** The type of sourcemap consumer we use. */
type SourceMapConsumer = BasicSourceMapConsumer;

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
	 * One browser window can load multiple source files, with different
	 * source maps. However, there might be only one socket to this
	 * server per browser window.
	 */
	private readonly sourceMaps: Map<string, SourceMapConsumer>;

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
		this.sourceMaps = new Map<string, SourceMapConsumer>();
		this.projectId = ''; // We currently only support coverage for one project.
	}

	/**
	 * Put coverage information to the storage for aggregation.
	 * This method also conducts the mapping based on the source map.
	 *
	 * @param fileId - The identifier of the instrumented bundle (file).
	 * @param line - The line number within the bundle.
	 * @param column - The column within the bundle.
	 */
	public putCoverage(fileId: string, startLine: number, startColumn: number, endLine: number, endColumn: number): void {
		let line = startLine;
		while (line <= endLine) {
			// Determine the column range to consider for this line
			let scanFromColumn;
			if (line === startLine) {
				scanFromColumn = startColumn;
			} else {
				scanFromColumn = 0;
			}
			// Since we do not know the length of the different lines, we assume
			// all to end in `endColumn`.
			const scanToColumn = endColumn;

			let column = scanFromColumn;
			let lastCoveredLine = -1;
			while (column <= scanToColumn) {
				const originalPosition: NullableMappedPosition = this.mapToOriginal(fileId, startLine, column);
				if (originalPosition.line && originalPosition.source) {
					if (lastCoveredLine !== originalPosition.line) {
						this.storage.putCoverage(this.projectId, originalPosition.source, [originalPosition.line]);
						lastCoveredLine = originalPosition.line;
					}
				} else {
					this.storage.signalUnmappedCoverage(this.projectId);
				}

				// Step to the next column to map back to the original
				column = column + (originalPosition.name?.length ?? 1);
			}

			// And the next line
			line++;
		}
	}

	/**
	 * Map to the original file position.
	 *
	 * @param fileId - The identifier of the instrumented bundle.
	 * @param line - The line within the bundle.
	 * @param column - The column within the bundle.
	 */
	private mapToOriginal(fileId: string, line: number, column: number): NullableMappedPosition {
		const sourceMap: SourceMapConsumer | undefined = this.sourceMaps.get(fileId);
		if (sourceMap) {
			const position: Position = { line, column };
			return sourceMap.originalPositionFor(position);
		} else {
			return { line, column, source: null, name: null };
		}
	}

	/**
	 * Receives the source map and stores it to the session.
	 *
	 * @param fileId - The identifier of the file bundle.
	 * @param sourceMapText - The actual source map.
	 */
	public putSourcemap(fileId: string, sourceMapText: string): void {
		const rawSourceMap = JSON.parse(sourceMapText);
		new sourceMap.SourceMapConsumer(rawSourceMap)
			.then(consumer => {
				this.sourceMaps.set(fileId, consumer);
			})
			.catch(e => {
				this.logger.error(`Consuming source map failed! ${e}`);
			});
	}

	/**
	 * Destroy the session and free the memory it allocates.
	 * In particular the sourcemaps are freed (important to not run out of memory!).
	 */
	public destroy(): void {
		for (const key of Array.from(this.sourceMaps.keys())) {
			const value = this.sourceMaps.get(key);
			if (value) {
				value.destroy();
				this.sourceMaps.delete(key);
			}
		}
	}
}
