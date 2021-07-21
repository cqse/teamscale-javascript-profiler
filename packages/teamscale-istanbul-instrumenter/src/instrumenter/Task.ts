import {Optional} from "typescript-optional";
import {Contract, ImplementMeException} from "@cqse/common-qualities";
import * as matching from "micromatch";

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
        this._host = collector.split(":")[0];
        this._port = Number.parseInt(collector.split(":")[1]);
    }

    get host(): string {
        return this._host;
    }

    get port(): number {
        return this._port;
    }
}

export class OriginSourcePattern {

    private readonly _include: string | undefined;

    private readonly _exclude: string | undefined;

    constructor(include: string | undefined, exclude: string | undefined) {
        this._include = include;
        this._exclude = exclude;
    }

    public isAnyIncluded(originFiles: string[]): boolean {
        if (this._exclude) {
            const matchedToExclude = matching.match(originFiles, this._exclude);
            if (originFiles.length == matchedToExclude.length) {
                return false;
            }
        }

        if (this._include) {
            const matchedToInclude = matching.match(originFiles, this._include ?? "**");
            return matchedToInclude.length > 0;
        }

        return true;
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

    private readonly _originSourcePattern: OriginSourcePattern;

    constructor(collector: CollectorSpecifier, elements: TaskElement[], originSourcePattern: OriginSourcePattern) {
        this._collector = Contract.requireDefined(collector);
        this._elements = Contract.requireDefined(elements).slice();
        this._originSourcePattern = Contract.requireDefined(originSourcePattern);
    }

    get elements(): TaskElement[] {
        // Ensure immutability of this object by returning a copy
        // of the list of immutable objects.
        return this._elements.slice();
    }

    get collector(): CollectorSpecifier {
        return this._collector;
    }

    get originSourcePattern(): OriginSourcePattern {
        return this._originSourcePattern;
    }
}

type TaskResultData = {
    readonly translated: TaskElement[];
    readonly translatedFromCache: TaskElement[];
    readonly alreadyInstrumented: TaskElement[];
    readonly unsupported: TaskElement[];
    readonly errors: Map<TaskElement, Error>;
}

export class TaskResult {

    private readonly _translated: number;

    private readonly _translatedFromCache: number;

    private readonly _alreadyInstrumented: number;

    private readonly _unsupported: number;

    private readonly _failed: number;

    private readonly _warnings: number;

    constructor(translated: number, translatedFromCache: number, alreadyInstrumented: number, unsupported: number,
                failed: number, warnings: number) {
        Contract.require(translated > -1);
        Contract.require(translatedFromCache > -1);
        Contract.require(alreadyInstrumented > -1);
        Contract.require(unsupported > -1);
        Contract.require(failed > -1);
        Contract.require(warnings > -1);
        this._translated = translated;
        this._translatedFromCache = translatedFromCache;
        this._alreadyInstrumented = alreadyInstrumented;
        this._unsupported = unsupported;
        this._failed = failed;
        this._warnings = warnings;
    }

    get translated(): number {
        return this._translated;
    }

    get translatedFromCache(): number {
        return this._translatedFromCache;
    }

    get alreadyInstrumented(): number {
        return this._alreadyInstrumented;
    }

    get unsupported(): number {
        return this._unsupported;
    }

    get failed(): number {
        return this._failed;
    }

    get warnings(): number {
        return this._warnings;
    }

    public withIncrement(incBy: TaskResult) {
        return new TaskResult(this.translated + incBy.translated,
            this.translatedFromCache + incBy.translatedFromCache,
            this.alreadyInstrumented + incBy.alreadyInstrumented,
            this.unsupported + incBy.unsupported,
            this.failed + incBy.failed,
            this.warnings + incBy.warnings);
    }

    public static neutral(): TaskResult {
        return new TaskResult(0, 0, 0, 0, 0, 0);
    }

    public static error(e: Error): TaskResult {
        return new TaskResult(0, 0, 0, 0, 1, 0);
    }

    public static warning(msg: string): TaskResult {
        console.error(msg);
        return new TaskResult(0, 0, 0, 0, 0, 1);
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