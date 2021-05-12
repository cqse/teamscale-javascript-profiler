import {Optional} from "typescript-optional";
import {Contract} from "@cqse/common-qualities";

export class TaskElement {

    private readonly _fromFile: string;

    private readonly _toFile: string;

    private readonly _externalSourceMapFile: Optional<SourceMapReference>;

    constructor(fromFile: string, toFile: string, externalSourceMap?: SourceMapReference) {
        this._fromFile = Contract.requireDefined(fromFile);
        this._toFile = Contract.requireDefined(toFile);
        this._externalSourceMapFile = Optional.ofNullable(externalSourceMap);
    }

    public isInPlace(): boolean {
        // We assume that different file names link to different files on the storage
        // and abstract from the fact that it might be a symlink.
        return this._fromFile == this._toFile;
    }

    get fromFile(): string {
        return this._fromFile;
    }

    get toFile(): string {
        return this._toFile;
    }

    get externalSourceMapFile(): Optional<SourceMapReference> {
        return this._externalSourceMapFile;
    }
}

export class CollectorSpecifier {

    private readonly _host: string;

    private readonly _port: number;

    constructor(collector: string) {
        Contract.requireStringPattern(collector, ".+:[0-9]+", "Invalid collector pattern used!");
        this._host = collector.split(":")[1];
        this._port = Number.parseInt(collector.split(":")[1]);
    }

    get host(): string {
        return this._host;
    }

    get port(): number {
        return this._port;
    }
}

export class TaskParameters {

    private readonly _useCache: Optional<string>;

    private readonly _collector: CollectorSpecifier;

    constructor(useCache: Optional<string>, collector: CollectorSpecifier) {
        this._useCache = useCache;
        this._collector = collector;
    }

    get useCache(): Optional<string> {
        return this._useCache;
    }

    get collector(): CollectorSpecifier {
        return this._collector;
    }
}

export class InstrumentationTask {

    private readonly _collector: CollectorSpecifier;

    private readonly _elements: TaskElement[];

    constructor(collector: CollectorSpecifier, elements: TaskElement[]) {
        this._collector = Contract.requireDefined(collector);
        this._elements = Contract.requireDefined(elements).slice();
    }

    get elements(): TaskElement[] {
        // Ensure immutability of this object by returning a copy
        // of the list of immutable objects.
        return this._elements.slice();
    }

    get collector(): CollectorSpecifier {
        return this._collector;
    }
}

export class TaskResult {

    private readonly _translated: number;

    private readonly _translatedFromCache: number;

    constructor(translated: number, translatedFromCache: number) {
        Contract.require(translated > -1);
        Contract.require(translatedFromCache > -1);
        this._translated = translated;
        this._translatedFromCache = translatedFromCache;
    }

    get translated(): number {
        return this._translated;
    }

    get translatedFromCache(): number {
        return this._translatedFromCache;
    }
}

export class SourceMapReference {

}

export class SourceMapFileReference extends SourceMapReference {

    private readonly _sourceMapFilePath: string;

    constructor(sourceMapFilePath: string) {
        super();
        this._sourceMapFilePath = sourceMapFilePath;
    }

    get sourceMapFilePath(): string {
        return this._sourceMapFilePath;
    }
}