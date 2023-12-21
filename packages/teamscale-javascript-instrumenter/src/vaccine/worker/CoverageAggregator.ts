import { SocketWithRecovery } from './SocketWithRecovery';
import { ProtocolMessageTypes } from '../protocol';
import {CoveredRanges} from '../types';
import {Countdown} from "./Countdown";

/**
 * The number of cache elements after that the cache should be flushed.
 */
const FLUSH_AFTER_ELEMENTS = 20;

/**
 * Number of milliseconds after that the cash should be flushed.
 */
const FLUSH_AFTER_MILLIS = 1000;

/**
 * Is supposed to exist once per app and might deal with
 * different JavaScript files that were instrumented upfront.
 */
export class CoverageAggregator {
	/**
	 * The socket to send the coverage with after flushing.
	 */
	private socket: SocketWithRecovery;

	/**
	 * We flush after 1s, ensuring debouncing.
	 */
	private flushCountdown: Countdown;

	/**
	 * The actual cache with the coverage information by source file.
	 */
	private cachedCoveredRanges: Map<string, CoveredRanges>;

	/**
	 * Counter with the number of entries added to the cache since the last flush.
	 */
	private numberOfCachedPositions: number;

	/**
	 * The constructor.
	 *
	 * @param socket - The socket to send collected coverage information to.
	 */
	constructor(socket: SocketWithRecovery) {
		this.socket = socket;
		this.cachedCoveredRanges = new Map();
		this.numberOfCachedPositions = 0;
		this.flushCountdown = new Countdown(FLUSH_AFTER_MILLIS, () => this.flush());
	}

	/**
	 * Add coverage information.
	 */
	public addRanges(fileId: string, range: CoveredRanges): void {
		let coveredPositions: CoveredRanges | undefined = this.cachedCoveredRanges.get(fileId);
		if (!coveredPositions) {
			coveredPositions = { branches: [], functions: [], statements: [], lines: [] };
			this.cachedCoveredRanges.set(fileId, coveredPositions);
		}

		range.lines.forEach(value => coveredPositions!.lines.push(value));
		range.branches.forEach(value => coveredPositions!.branches.push(value));
		range.functions.forEach(value => coveredPositions!.functions.push(value));
		range.statements.forEach(value => coveredPositions!.statements.push(value));

		this.numberOfCachedPositions += 1;
		this.flushCountdown.restartCountdown();
		if (this.numberOfCachedPositions >= FLUSH_AFTER_ELEMENTS) {
			this.flush();
		}
	}

	private arrayToLineColCov(coverageTypeAbbr: string, input: number[]) : string {
		if (input.length % 4 !== 0) {
			throw new Error("Unexpected length of input data.");
		}

		const result: string[] = [];
		for (let i= 0; i<input.length; i=i+4) {
			const startLine = input[i];
			const startColumn = input[i+1];
			const endLine = input[i+2];
			const endColumn = input[i+3];
			result.push(`${coverageTypeAbbr}${startLine},${startColumn}-${endLine},${endColumn}`);
		}

		return result.join(";");
	}

	private arrayToLineCov(input: number[]) : string {
		if (input.length % 2 !== 0) {
			throw new Error("Unexpected length of input data.");
		}

		const result: string[] = [];
		for (let i= 0; i<input.length; i=i+2) {
			const startLine = input[i];
			const endLine = input[i+1];
			result.push(`l${startLine}-${endLine}`);
		}

		return result.join(";");
	}


	/**
	 * Flush the caches (send them to the collector).
	 */
	flush(): void {
		if (this.numberOfCachedPositions === 0) {
			return;
		}

		this.flushCountdown.stopCountdown();

		const fileCoverage: string[] = [];
		this.cachedCoveredRanges.forEach((ranges, fileName) => {
			fileCoverage.push(`@${fileName}`);
			fileCoverage.push(this.arrayToLineColCov('s', ranges.statements));
			fileCoverage.push(this.arrayToLineColCov('b', ranges.branches));
			fileCoverage.push(this.arrayToLineColCov('f', ranges.functions));
			fileCoverage.push(this.arrayToLineCov(ranges.lines));
		});

		this.socket.send(`${ProtocolMessageTypes.MESSAGE_TYPE_COVERAGE} ${fileCoverage.join(';')}`);

		this.cachedCoveredRanges.clear();
		this.numberOfCachedPositions = 0;
	}
}
