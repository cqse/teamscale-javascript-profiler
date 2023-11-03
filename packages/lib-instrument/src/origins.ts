import {SourceLocation, VariableDeclaration} from "@babel/types";
import {createHash} from "crypto";
import {SHA} from "./constants";

/**
 * Creates a new string constant AST node.
 */
export function newStringConstDeclarationNode(name: string, value: string): VariableDeclaration {
    return {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
            {
                type: 'VariableDeclarator',
                id: {
                    type: 'Identifier',
                    name
                },
                init: {
                    type: 'StringLiteral',
                    value
                }
            }
        ]
    };
}

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

export class SourceOrigins {

    public hash?: string;

    public readonly bundleName: string;

    public readonly originToIdMap: Map<string, string>;

    constructor(bundleName: string) {
        this.originToIdMap = new Map();
        this.bundleName = bundleName;
    }

    ensureKnownOrigin(loc: SourceLocation): string {
        let id = this.originToIdMap.get(loc.filename)
        if (!id) {
            id = `_$o${fileIdSeqGenerator.next()}`;
            this.originToIdMap.set(loc.filename, id);
        }
        return id;
    }

    public computeHash(): string {
        return createHash(SHA)
            .update(JSON.stringify(this))
            .digest('hex');
    }

    public toJSON() : string {
        return JSON.stringify({
            bundle: this.bundleName,
            hash: this.hash,
            origins: this.originToIdMap
        });
    }

}