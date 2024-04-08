/**
 * A socket wrapper that caches messages in case
 * the connection was lost or not yet established.
 * 
 * Callers must call #connect() to establish the initial connection.
 */
export class SocketWithRecovery {

	/** The target URL to send messages to. */
	private url: string;

	/** The wrapped WebSocket */
	private socket: WebSocket | null;

	/** The messages that have been cached */
	private cachedMessages: string[] = [];

	connect(url: string) {
		this.url = url;
		this.socket = this.createSocket();
	}

	/**
	 * Re-Create the WebSocket.
	 */
	private createSocket(): WebSocket {
		const socket = new WebSocket(this.url);
		socket.onopen = () => this.onopen();
		socket.onclose = () => this.onclose();
		return socket;
	}

	/**
	 * Handle a lost connection.
	 */
	private onclose() {
		this.socket = this.createSocket();
	}

	/**
	 * Handle a (re-)established connection.
	 */
	private onopen() {
		// eslint-disable-next-line no-console
		console.log('Connection to Coverage Collector established.');
		this.cachedMessages.forEach(message => this.socket!!.send(message));
		this.cachedMessages = [];
	}

	/**
	 * Send the message, or cache it if the connection
	 * has not yet been established.
	 */
	public send(message: string): void {
		if (this.socket !== null && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(message);
		} else {
			// socket has not been opened yet for the first time
			this.cachedMessages.push(message);
			if (this.cachedMessages.length % 500 === 0) {
				// eslint-disable-next-line no-console
				console.log(`More than ${this.cachedMessages.length} messages are queued to be sent.`);
			}
		}
	}
}
