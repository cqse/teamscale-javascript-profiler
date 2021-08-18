/**
 * A socket wrapper that caches messages in case
 * the connection was lost or not yet established.
 */
export class CachingSocket {
	/** The target URL to send messages to. */
	private readonly url: string;

	/** The wrapped WebSocket */
	private socket: WebSocket;

	/** The messages that have been cached */
	private cache: string[] = [];

	/**
	 * Constructor.
	 *
	 * @param url - The URL to send messages to.
	 */
	constructor(url: string) {
		this.url = url;
		this.socket = this.createSocket();
	}

	/**
	 * Re-Create the WebSocket.
	 */
	private createSocket(): any {
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
		this.cache.forEach(message => this.socket.send(message));
		this.cache = [];
	}

	/**
	 * Send the message, or cache it if the connection
	 * has not yet been established.
	 */
	public send(message: string) {
		if (this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(message);
		} else {
			// socket has not been opened yet for the first time
			this.cache.push(message);
		}
	}
}
