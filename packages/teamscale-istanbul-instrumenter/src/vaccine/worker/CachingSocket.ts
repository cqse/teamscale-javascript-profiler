const Socket = require('isomorphic-ws');

export class CachingSocket {

    private readonly url: string
    private readonly fallbackUrl: string

    private socket: any;
    private cache: string[] = [];
    private shouldSendViaFetch = false;

    constructor(url: string, fallbackUrl: string) {
        this.fallbackUrl = fallbackUrl;
        this.url = url;
        this.socket = this.createSocket();
    }

    private createSocket(): any {
        const socket = new Socket(this.url);
        socket.onopen = () => this.onopen();
        socket.onclose = () => this.onclose();
        return socket;
    }

    private onclose() {
        this.shouldSendViaFetch = true;
        this.socket = this.createSocket()
    }

    private onopen() {
        this.shouldSendViaFetch = false;
        for (const message of this.cache) {
            this.socket.send(message);
        }
        this.cache = [];
    }

    send(message: string) {
        console.log(`Sending: ${message}`)
        if (this.shouldSendViaFetch) {
            // socket has been closed by server and we're trying to reconnect
            this.sendViaFetch(message);
        } else if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            // socket has not been opened yet for the first time
            this.cache.push(message);
        }
    }

    private async sendViaFetch(message: string) {
        try {
            await fetch(this.fallbackUrl, {
               method: "POST",
                keepalive: true,
                body: message
            });
        } catch (e) {
            this.cache.push(message);
        }
    }

}

