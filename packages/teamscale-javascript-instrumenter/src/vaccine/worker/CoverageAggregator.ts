import { SocketWithRecovery } from './SocketWithRecovery';
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
 * A message that provides coverage information.
 */
const MESSAGE_TYPE_COVERAGE = 'c';

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
	private cachedCoveredRanges: Map<string, Set<number>>;

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
	 * Add coverage information from an array of covered lines.
	 */
	public addLines(fileId: string, lines: number[]): void {
		let coveredPositions: Set<number> | undefined = this.cachedCoveredRanges.get(fileId);
		if (!coveredPositions) {
			coveredPositions = new Set<number>();
			this.cachedCoveredRanges.set(fileId, coveredPositions);
		}

		lines.forEach(line => coveredPositions!.add(line));

		this.numberOfCachedPositions += 1;
		this.flushCountdown.restartCountdown();
		if (this.numberOfCachedPositions >= FLUSH_AFTER_ELEMENTS) {
			this.flush();
		}
	}

	private arrayToLineCov(lines: Set<number>) : string {
		const result: string[] = [];
		for (const line of lines) {
			result.push(`${line}`);
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
		this.cachedCoveredRanges.forEach((lines, fileName) => {
			fileCoverage.push(`@${fileName}`);
			fileCoverage.push(this.arrayToLineCov(lines));
		});

		this.socket.send(`${MESSAGE_TYPE_COVERAGE} ${fileCoverage.join(';')}`);

		this.cachedCoveredRanges.clear();
		this.numberOfCachedPositions = 0;
	}
}
