import {Socket} from "net";
import * as sourceMap from "source-map";
import {Position, BasicSourceMapConsumer, IndexedSourceMapConsumer, NullableMappedPosition} from "source-map";
import {IDataStorage} from "../storage/DataStorage";
import {Contract} from "@cqse/common-qualities";
type SourceMapConsumer = BasicSourceMapConsumer;

export class Session {

    private readonly _socket: Socket;
    private readonly _storage: IDataStorage;

    /**
     * One browser window can load multiple source files, with different
     * source maps. However, there might be only one socket to this
     * server per browser window.
     *
     * @private
     */
    private readonly _sourceMaps: Map<string, SourceMapConsumer>;

    constructor(socket: Socket, storage: IDataStorage) {
        this._socket = Contract.requireDefined(socket);
        this._storage = Contract.requireDefined(storage);
        this._sourceMaps = new Map<string, SourceMapConsumer>();
    }

    public putCoverage(fileId: string, line: number, column: number): void {
        const originalPosition: NullableMappedPosition = this.mapToOriginal(fileId, line, column);
        if (originalPosition.line && originalPosition.source) {
            this._storage.putCoverage("", originalPosition.source, [originalPosition.line]);
        } else {
            this._storage.signalUnmappedCoverage();
        }
    }

    private mapToOriginal(fileId: string, line: number, column: number): NullableMappedPosition {
        const sourceMap: SourceMapConsumer | undefined = this._sourceMaps.get(fileId);
        if (sourceMap) {
            const position: Position = {line, column};
            return sourceMap.originalPositionFor(position);
        } else {
            return {line, column, source: null, name: null};
        }
    }

    public putSourcemap(fileId: string, infos: string): void {
        const rawSourceMap = JSON.parse(infos);
        console.log(`Sourcemap received for ${rawSourceMap['file']}, mappings to:`, rawSourceMap.sources);
        new sourceMap.SourceMapConsumer(rawSourceMap)
            .then((consumer) => {
                this._sourceMaps.set(fileId, consumer);
            }).catch((e) => {
                console.error("Consuming source map failed!");
            });
    }

}