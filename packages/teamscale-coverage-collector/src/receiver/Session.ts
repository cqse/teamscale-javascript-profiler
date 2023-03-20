import { Socket } from 'net';
import * as sourceMap from 'source-map';
import { Position, BasicSourceMapConsumer, NullableMappedPosition } from 'source-map';
import { IDataStorage } from '../storage/DataStorage';
import { Contract } from '@cqse/commons';
import Logger from 'bunyan';

/** The type of sourcemap consumer we use. */
type SourceMapConsumer = BasicSourceMapConsumer;

/**
 * Coverage information that has not been mapped back to the
 * original code using a source map.
 */
export type UnmappedCoverage = {
	fileId: string,
	startLine: number,
	startColumn: number,
	endLine: number,
	endColumn: number
}

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
	 * Unmapped coverage information.
	 */
	private readonly unmappedCoverage: Map<string, Array<UnmappedCoverage>>;

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
		this.unmappedCoverage = new Map<string, Array<UnmappedCoverage>>();
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
	public putCoverage(
		fileId: string,
		startLine: number,
		startColumn: number,
		endLine: number,
		endColumn: number
	): boolean {
		// Delay the mapping if the sourcemap has not yet arrived
		if (!this.sourceMaps.has(fileId)) {
			let unmappedForFile = this.unmappedCoverage.get(fileId);
			if (!unmappedForFile) {
				unmappedForFile = [];
				this.unmappedCoverage.set(fileId, unmappedForFile);
			}
			unmappedForFile.push({endColumn, endLine, fileId, startColumn, startLine});
			return false;
		}

		let mapped = false;

		// Iterate over the lines to scan
		let line = startLine;
		while (line <= endLine) {
			// Determine the column range to consider for this line
			let scanFromColumn;
			if (line === startLine) {
				scanFromColumn = startColumn;
			} else {
				scanFromColumn = 0;
			}

			let scanToColumn;
			if (line === endLine) {
				scanToColumn = endColumn;
			} else {
				// Since we do not know the length of the different lines, we assume
				// all to end in the lager of `endColumn` and `startColumn`.
				// A better estimate (or the correct value) is supposed to be implemented
				// in context of TS-30077.
				scanToColumn = Math.max(endColumn, startColumn);
			}

			let column = scanFromColumn;
			let lastCoveredLine = -1;
			while (column <= scanToColumn) {
				const originalPosition: NullableMappedPosition = this.mapToOriginal(fileId, line, column);
				if (originalPosition.line && originalPosition.source) {
					if (lastCoveredLine !== originalPosition.line) {
						this.storage.putCoverage(this.projectId, originalPosition.source, [originalPosition.line]);
						mapped = true;
						lastCoveredLine = originalPosition.line;
					}
				}

				// Step to the next column to map back to the original.
				// `originalPosition.name` is the token on the position, that is, if it is present
				// we increment the column by its length.
				column = column + Math.max(1, originalPosition.name?.length ?? 1);
			}

			// And the next line
			line++;
		}

		return mapped;
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
	public async putSourcemap(fileId: string, sourceMapText: string): Promise<void> {
		const rawSourceMap = JSON.parse(sourceMapText);
		try {
			const sourceMapConsumer = await new sourceMap.SourceMapConsumer(rawSourceMap);
			this.sourceMaps.set(fileId, sourceMapConsumer);
			this.processUnmappedCoverageOf(fileId);
		} catch (e) {
			this.logger.error(`Consuming source map failed! ${e}`);
		}
	}

	private processUnmappedCoverageOf(fileId: string): void {
		const unmapped = this.unmappedCoverage.get(fileId) ?? [];
		unmapped.forEach((entry) => {
			if (!this.putCoverage(entry.fileId, entry.startLine, entry.startColumn, entry.endLine, entry.endColumn)) {
				this.storage.signalUnmappedCoverage(this.projectId);
			}
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
