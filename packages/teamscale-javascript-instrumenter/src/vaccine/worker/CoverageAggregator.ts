import { CachingSocket } from './CachingSocket';
import { ProtocolMessageTypes } from '../protocol';

/**
 * The number of cache elements after that the cache should be flushed.
 */
const FLUSH_AFTER_ELEMENTS = 20;

/**
 * Number of milliseconds after that the cash should be flushed.
 */
const FLUSH_AFTER_MILLIS = 1000;

/**
 * Countdown that can be reset to start counting from 0.
 */
export class Countdown {
	/**
	 * The timer handle.
	 */
	private timerHandle: number | null = null;

	/**
	 * Constructor.
	 *
	 * @param milliseconds - The duration of the countdown in milliseconds.
	 * @param onCountedToZero - The action to execute when the countdown reaches 0.
	 */
	// eslint-disable-next-line no-useless-constructor
	constructor(private milliseconds: number, private onCountedToZero: () => void) {}

	/**
	 * Restart the countdown.
	 */
	restartCountdown(): void {
		this.stopCountdown();
		this.timerHandle = self.setTimeout(() => {
			this.stopCountdown();
			this.onCountedToZero();
		}, this.milliseconds);
	}

	/**
	 * Stop the countdown.
	 */
	stopCountdown(): void {
		if (this.timerHandle === null) {
			return;
		}
		self.clearTimeout(this.timerHandle);
		this.timerHandle = null;
	}
}

/**
 * Is supposed to exist once per app and might deal with
 * different JavaScript files that were instrumented upfront.
 */
export class CoverageAggregator {
	/**
	 * The socket to send the coverage with after flushing.
	 */
	private socket: CachingSocket;

	/**
	 * The actual cache with the coverage information by source file.
	 */
	private cachedCoveredPositions: Map<string, Set<string>>;

	/**
	 * Counter with the number of entries added to the cache since the last flush.
	 */
	private numberOfCachedPositions: number;

	/**
	 * We flush after 1s, ensuring debouncing.
	 */
	private flushCountdown: Countdown;

	/**
	 * The constructor.
	 *
	 * @param socket - The socket to send collected coverage information to.
	 */
	constructor(socket: CachingSocket) {
		this.socket = socket;
		this.cachedCoveredPositions = new Map();
		this.numberOfCachedPositions = 0;
		this.flushCountdown = new Countdown(FLUSH_AFTER_MILLIS, () => this.flush());
	}

	/**
	 * Add coverage information.
	 *
	 * @param positionCoverageInfo - A string that encodes the coverage information.
	 *      The string is supposed to be formatted as follows: `<fileId>:<startLine>:<startColumn>:<endLine>:<endColumn>`
	 */
	public add(positionCoverageInfo: string): void {
		const parts = positionCoverageInfo.split(':');
		if (parts.length !== 5) {
			return;
		}

		const fileId = parts[0];
		let coveredPositions: Set<string> | undefined = this.cachedCoveredPositions.get(fileId);
		if (!coveredPositions) {
			coveredPositions = new Set();
			this.cachedCoveredPositions.set(fileId, coveredPositions);
		}

		coveredPositions.add(`${parts[1]}:${parts[2]}:${parts[3]}:${parts[4]}`);

		this.numberOfCachedPositions += 1;
		this.flushCountdown.restartCountdown();
		if (this.numberOfCachedPositions >= FLUSH_AFTER_ELEMENTS) {
			this.flush();
		}
	}

	/**
	 * Flush the caches (send them to the collector).
	 */
	flush(): void {
		if (this.numberOfCachedPositions === 0) {
			return;
		}

		this.flushCountdown.stopCountdown();
		this.cachedCoveredPositions.forEach((positionSet, fileId) => {
			this.socket.send(
				`${ProtocolMessageTypes.MESSAGE_TYPE_COVERAGE} ${fileId} ${Array.from(positionSet).join(' ')}`
			);
		});

		this.cachedCoveredPositions = new Map();
		this.numberOfCachedPositions = 0;
	}
}
