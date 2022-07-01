/**
 * Do not resent coverage info that was already sent recently.
 * After `KNOWN_MESSAGE_RESET_AFTER_COUNT` the set of known message is reset.
 */
const KNOWN_MESSAGE_RESET_AFTER_COUNT = 1000;

/**
 * Flush the coverage info buffer after it grew to N messages.
 */
const BUFFER_FLUSH_AFTER_COUNT = 30;

/**
 * Flush the buffer after N milliseconds.
 */
const FLUSH_BUFFER_AFTER_MILLIS = 2000;

/**
 * Buffer of messages to be sent.
 *
 * Aims at not overwhelming the receiver with too many messages.
 */
export class FlushingBuffer {
	private readonly alreadyPushed: Set<string>;
	private buffer: string[];
	private readonly flushTimer: NodeJS.Timeout;

	constructor(private onFlush: (buffer: string[]) => void) {
		this.alreadyPushed = new Set<string>();
		this.buffer = [];

		// Flush after `FLUSH_BUFFER_AFTER_MILLIS` ms
		this.flushTimer = setInterval(() => {
			this.flush();
		}, FLUSH_BUFFER_AFTER_MILLIS);
	}

	/**
	 * Flush the buffer.
	 */
	public flush(): void {
		if (this.buffer.length > 0) {
			this.onFlush(this.buffer);
			this.buffer = [];
		}
	}

	/**
	 * Add a message to the queue of messages to be sent.
	 */
	public pushMessage(message: string): void {
		// `alreadyPushed` should approximate the behaviour of a ring buffer
		// of coverage messages already sent.
		if (this.alreadyPushed.size > KNOWN_MESSAGE_RESET_AFTER_COUNT) {
			this.alreadyPushed.clear();
		}
		if (!this.alreadyPushed.has(message)) {
			// Put the coverage message into the buffer
			this.buffer.push(message);
			this.alreadyPushed.add(message);
		}

		// Flush if we already have `BUFFER_FLUSH_AFTER_COUNT` elements in the buffer
		if (this.buffer.length > BUFFER_FLUSH_AFTER_COUNT) {
			this.flush();
		}
	}

	/**
	 * Flush all messages immediately and stop the flush timer.
	 */
	public flushAndStop(): void {
		this.flush();
		clearInterval(this.flushTimer);
	}
}
