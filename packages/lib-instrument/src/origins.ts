import {SourceLocation} from "@babel/types";
import {NullableMappedPosition, SourceMapConsumer} from "source-map";

/**
 * Generator for identifiers that are unique across files to instrument.
 * Relevant in case no Ecmascript modules are used.
 *
 * We assume that the files to be executed in a browser can
 * stem from different runs of the instrumenter. We have to decrease
 * the probability of colliding identifiers.
 */
export const fileIdSeqGenerator: { next: () => string } = (() => {
    const instrumenterRunId = process.pid;
    let fileIdSeq = 0;

    return {
        next: () => {
            fileIdSeq++;
            let num: number;
            if (fileIdSeq < 10000) {
                num = instrumenterRunId * 10000 + fileIdSeq;
            } else if (fileIdSeq < 100000) {
                num = instrumenterRunId * 100000 + fileIdSeq;
            } else {
                throw new Error(`Not more that 100k files supported to be instrumented in one run.`);
            }
            return num.toString(36);
        }
    };
})();

/**
 * Mapping source locations to their origins, before the last transpilation,
 * based on the source map.
 */
export class SourceOrigins {

    private readonly sourceMap?: SourceMapConsumer;

    /**
     * The mapping of file ids to the file names in the transpiler origin,
     * that is, the file names found in the source map.
     */
    public readonly originToIdMap: Map<string, string>;

    constructor(sourceMap: SourceMapConsumer | undefined) {
        this.originToIdMap = new Map();
        this.sourceMap = sourceMap;
    }

    /**
     * Register source origin file and retrieve a unique identifier for it; furthermore, map
     * the given location to the location in the origin.
     */
    ensureKnownOrigin(loc: SourceLocation): [string, SourceLocation] {
        let startPos: NullableMappedPosition | undefined = undefined;
        let endPos: NullableMappedPosition | undefined = undefined;
        let filename = loc.filename ?? '';

        if (this.sourceMap) {
            startPos = this.sourceMap.originalPositionFor({line: loc.start.line, column: loc.start.column});
            endPos = this.sourceMap.originalPositionFor({line: loc.end.line, column: loc.end.column});
            filename = startPos.source ?? loc.filename;
        }

        if (!startPos || !endPos) {
            startPos = { line: loc.start.line, column: loc.start.column, source: null, name: null };
            endPos = { line: loc.end.line, column: loc.end.column, source: null, name: null }
        }

        let id = this.originToIdMap.get(filename)
        if (!id) {
            id = `_$o${fileIdSeqGenerator.next()}`;
            this.originToIdMap.set(filename, id);
        }

        return [id, {
            start: { line: startPos.line!, column: startPos.column!, index: -1 },
            end: { line: endPos.line!, column: endPos.column!, index: -1 },
            filename,
            identifierName: startPos.name }];
    }

}