import { Optional } from 'typescript-optional';
import { Contract } from '@cqse/common-qualities';
import * as matching from 'micromatch';

/**
 * One element of an instrumentation task.
 * It corresponds to instrumenting a single file.
 */
export class TaskElement {
	/** The source file */
	private readonly _fromFile: string;

	/** The destination file */
	private readonly _toFile: string;

	/** An external source map file relevant for the file at hand */
	private readonly _externalSourceMapFile: Optional<SourceMapReference>;

	constructor(fromFile: string, toFile: string, externalSourceMap?: SourceMapReference) {
		this._fromFile = Contract.requireDefined(fromFile);
		this._toFile = Contract.requireDefined(toFile);
		this._externalSourceMapFile = Optional.ofNullable(externalSourceMap);
	}

	/**
	 * Is it an in-place instrumentation task?
	 */
	public isInPlace(): boolean {
		// We assume that different file names link to different files on the storage
		// and abstract from the fact that it might be a symlink.
		return this._fromFile == this._toFile;
	}

	/**
	 * @returns the source (from) file.
	 */
	get fromFile(): string {
		return this._fromFile;
	}

	/**
	 * @returns the target file.
	 */
	get toFile(): string {
		return this._toFile;
	}

	/**
	 * @returns an optional source map file.
	 */
	get externalSourceMapFile(): Optional<SourceMapReference> {
		return this._externalSourceMapFile;
	}
}

/**
 * Specifies the collector that is supposed to
 * receive the coverage information.
 */
export class CollectorSpecifier {
	/** Hostname the collector is running on */
	private readonly _host: string;

	/** Port on the host the collector listens to */
	private readonly _port: number;

	constructor(collector: string) {
		Contract.requireStringPattern(collector, '.+:[0-9]+', 'Invalid collector pattern used!');
		this._host = collector.split(':')[0];
		this._port = Number.parseInt(collector.split(':')[1]);
	}

	/**
	 * @returns the hostname the collector is running on.
	 */
	get host(): string {
		return this._host;
	}

	/**
	 * @returns the port the collector is listening on.
	 */
	get port(): number {
		return this._port;
	}
}

/**
 * Patterns that define which parts of a given bundle to instrument or not.
 *
 * The patterns describe a set of filenames that can be found in the origin,
 * that is, before conducting all the transpilation steps. The source maps
 * are used to determine the original file names.
 */
export class OriginSourcePattern {
	/** Set of files in the origin for that coverage should be produced. */
	private readonly _include: string | undefined;

	/**
	 * Set of files in the origin for that coverage should EXPLICITLY NOT be produced.
	 * An exclude is stronger than an include.
	 */
	private readonly _exclude: string | undefined;

	constructor(include: string | undefined, exclude: string | undefined) {
		this._include = include;
		this._exclude = exclude;
	}

	/**
	 * Does the given pattern require to include the given set of files?
	 *
	 * @param originFiles - The file set to decide for include or exclude.
	 *
	 * @returns `true` if (1) all of the given files are supposed to be excluded,
	 *   or (2) if one of the files is supposed to be included.
	 */
	public isAnyIncluded(originFiles: string[]): boolean {
		if (this._exclude) {
			const matchedToExclude = matching.match(originFiles, this._exclude);
			if (originFiles.length == matchedToExclude.length) {
				return false;
			}
		}

		if (this._include) {
			const matchedToInclude = matching.match(originFiles, this._include ?? '**');
			return matchedToInclude.length > 0;
		}

		return true;
	}
}

/**
 * The actual instrumentation task.
 */
export class InstrumentationTask {
	/**
	 * The collector to send coverage information to.
	 */
	private readonly _collector: CollectorSpecifier;

	/**
	 * The files to instrument along with a specification of the target.
	 */
	private readonly _elements: TaskElement[];

	/**
	 * A pattern describing which files or fragments of a bundle to instrument
	 * based on the original file names the code was transpiled from.
	 */
	private readonly _originSourcePattern: OriginSourcePattern;

	constructor(collector: CollectorSpecifier, elements: TaskElement[], originSourcePattern: OriginSourcePattern) {
		this._collector = Contract.requireDefined(collector);
		this._elements = Contract.requireDefined(elements).slice();
		this._originSourcePattern = Contract.requireDefined(originSourcePattern);
	}

	/**
	 * @returns the elements of the task.
	 */
	get elements(): TaskElement[] {
		// Ensure immutability of this object by returning a copy
		// of the list of immutable objects.
		return this._elements.slice();
	}

	/**
	 * @returns CollectorSpecifier specifying the collector to use.
	 */
	get collector(): CollectorSpecifier {
		return this._collector;
	}

	/**
	 * @returns a patter defining which code to instrument.
	 */
	get originSourcePattern(): OriginSourcePattern {
		return this._originSourcePattern;
	}
}

/**
 * A summary of executing the instrumentation task.
 */
export class TaskResult {
	/** Number of task elements that were performed (instrumented) */
	private readonly _translated: number;

	/** Number of instrumentations that were taken from a cache */
	private readonly _translatedFromCache: number;

	/** Number of skips due to a present instrumentation */
	private readonly _alreadyInstrumented: number;

	/** Number of files not support by the instrumenter */
	private readonly _unsupported: number;

	/** Number of elements for that the instrumentation failed */
	private readonly _failed: number;

	/** Number of warnings that were produced during the instrumentation process */
	private readonly _warnings: number;

	constructor(
		translated: number,
		translatedFromCache: number,
		alreadyInstrumented: number,
		unsupported: number,
		failed: number,
		warnings: number
	) {
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

	/**
	 * @returns number of task elements that were performed (instrumented)
	 */
	get translated(): number {
		return this._translated;
	}

	/**
	 * @returns number of instrumentations that were taken from a cache
	 */
	get translatedFromCache(): number {
		return this._translatedFromCache;
	}

	/**
	 * @returns number of skips due to a present instrumentation
	 */
	get alreadyInstrumented(): number {
		return this._alreadyInstrumented;
	}

	/**
	 * @returns number of files not support by the instrumenter
	 */
	get unsupported(): number {
		return this._unsupported;
	}

	/**
	 * @returns number of elements for that the instrumentation failed
	 */
	get failed(): number {
		return this._failed;
	}

	/**
	 * @returns number of warnings that were produced during the instrumentation process
	 */
	get warnings(): number {
		return this._warnings;
	}

	/**
	 * Returns the sum of the present task results and the given one.
	 *
	 * @param incBy - The task result to add (as delta).
	 */
	public withIncrement(incBy: TaskResult) {
		return new TaskResult(
			this.translated + incBy.translated,
			this.translatedFromCache + incBy.translatedFromCache,
			this.alreadyInstrumented + incBy.alreadyInstrumented,
			this.unsupported + incBy.unsupported,
			this.failed + incBy.failed,
			this.warnings + incBy.warnings
		);
	}

	/**
	 * @returns the neutral task element (adding it with {@code withIncrement} does not change the result).
	 */
	public static neutral(): TaskResult {
		return new TaskResult(0, 0, 0, 0, 0, 0);
	}

	/**
	 * @returns a task result signaling one error.
	 *
	 * @param e - The error to add.
	 */
	public static error(e: Error): TaskResult {
		return new TaskResult(0, 0, 0, 0, 1, 0);
	}

	/**
	 * @returns a task result signaling one warning.
	 *
	 * @param msg - The warning message to add.
	 */
	public static warning(msg: string): TaskResult {
		console.error(msg);
		return new TaskResult(0, 0, 0, 0, 0, 1);
	}
}

/**
 * An abstract source map type.
 */
export abstract class SourceMapReference {}

/**
 * A source map in an external file.
 */
export class SourceMapFileReference extends SourceMapReference {
	/** The path the source map is stored in */
	private readonly _sourceMapFilePath: string;

	constructor(sourceMapFilePath: string) {
		super();
		this._sourceMapFilePath = sourceMapFilePath;
	}

	/** @returns the path of the source map */
	get sourceMapFilePath(): string {
		return this._sourceMapFilePath;
	}
}
