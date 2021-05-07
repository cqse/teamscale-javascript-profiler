import WebSocket from "ws";

export class WebSocketCollectingServer {

    private readonly _server: WebSocket.Server;

    constructor(port: number) {
        this._server = new WebSocket.Server({port: port});
    }

    private setupHandlers(): void {
        this._server.on('connection', (ws: any) => {
            ws.on('message', (message: any) => {
                console.log(`Received message => ${message}`)
            })
            ws.send('ho!')
        })
    }
}



