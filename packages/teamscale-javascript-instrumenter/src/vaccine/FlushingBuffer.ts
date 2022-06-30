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

		// Flush after 2s
		this.flushTimer = setInterval(() => {
			this.flush();
		}, 2000);
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
		if (this.alreadyPushed.size > 1000) {
			this.alreadyPushed.clear();
		}
		if (!this.alreadyPushed.has(message)) {
			// Put the coverage message into the buffer
			this.buffer.push(message);
			this.alreadyPushed.add(message);
		}

		// Flush if we already have 500 elements in the buffer
		if (this.buffer.length > 500) {
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
