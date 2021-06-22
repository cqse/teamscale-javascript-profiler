import * as WebSocket from "ws";
import {DataStorage, IDataStorage} from "../storage/DataStorage";
import {Contract} from "@cqse/common-qualities";
import {IncomingMessage} from "http";
import {OpenEvent} from "ws";

const MESSAGE_TYPE_SOURCEMAP = "s";
const MESSAGE_TYPE_COVERAGE = "c";

export class WebSocketCollectingServer {

    private readonly _server: WebSocket.Server;

    private readonly _storage: IDataStorage;

    constructor(port: number, storage: IDataStorage) {
        Contract.require(port > 0 && port < 65536, "Port must be valid (range).");
        this._server = new WebSocket.Server({port: port});
        this._storage = Contract.requireDefined(storage);
    }

    public start(): void {
        console.log(`Starting server on port ${this._server.options.port}`);
        this._server.on('connection', (ws: any, req: IncomingMessage) => {
            console.log(`Connection from: ${req.socket.remoteAddress}`);
            ws.on('message', (message: any) => {
                this.handleMessage(req, message);
            })
        })
    }

    public stop(): void {
    }

    private handleMessage(reqest: IncomingMessage, message: string): void {
        if (message.startsWith(MESSAGE_TYPE_SOURCEMAP)) {
            this.handleSourcemap(message.substring(1));
        } else if (message.startsWith(MESSAGE_TYPE_COVERAGE)) {
            this.handleCoverage(message.substring(1));
        }
    }

    private handleSourcemap(sourcemap: string) {
        console.log("Sourcemap received");
    }

    private handleCoverage(coverage: string) {
        console.log("Coverage received");
    }
}



