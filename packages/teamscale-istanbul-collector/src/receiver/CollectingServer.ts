import * as WebSocket from "ws";
import {IDataStorage} from "../storage/DataStorage";
import {Contract} from "@cqse/common-qualities";
import {IncomingMessage} from "http";
import {Session} from "./Session";

const MESSAGE_TYPE_SOURCEMAP = "s";
const MESSAGE_TYPE_COVERAGE = "c";

export class WebSocketCollectingServer {

    private readonly _server: WebSocket.Server;

    private readonly _storage: IDataStorage;

    constructor(port: number, storage: IDataStorage) {
        Contract.require(port > 0 && port < 65536, "Port must be valid (range).");
        this._storage = Contract.requireDefined(storage);
        this._server = new WebSocket.Server({port: port});
    }

    public start(): void {
        console.log(`Starting server on port ${this._server.options.port}.`);
        this._server.on('connection', (webSocket: WebSocket, req: IncomingMessage) => {
            const session = new Session(req.socket, this._storage);
            console.log(`Connection from: ${req.socket.remoteAddress}`);
            webSocket.on('close', (code, reason) => {
                console.log(`Closing with code ${code}`);
            })
            webSocket.on('message', (message: any) => {
                if (message.startsWith(MESSAGE_TYPE_SOURCEMAP)) {
                    this.handleSourcemapMessage(session, message.substring(1));
                } else if (message.startsWith(MESSAGE_TYPE_COVERAGE)) {
                    this.handleCoverageMessage(session, message.substring(1));
                }
            })
        })
    }

    public stop(): void {
    }

    private handleSourcemapMessage(session: Session, body: string) {
        const fileIdSeparatorPosition = body.indexOf(":");
        if (fileIdSeparatorPosition > -1) {
            const fileId = body.substring(0, fileIdSeparatorPosition).trim();
            const sourcemap = body.substring(fileIdSeparatorPosition+1);
            session.putSourcemap(fileId, sourcemap);
        }
    }

    private handleCoverageMessage(session: Session, body: string) {
        const bodyPattern = /(?<fileId>\S+) (?<positions>((\d+:\d+)\s+)*(\d+:\d+))/;
        const matches = bodyPattern.exec(body);
        if (matches && matches.groups) {
            const fileId = matches.groups['fileId'];
            const positions = (matches.groups['positions'] ?? "").split(/\s+/);
            for (const position of positions) {
                const [line, column] = position.split(":");
                session.putCoverage(fileId, Number.parseInt(line), Number.parseInt(column));
            }
        }
    }
}



