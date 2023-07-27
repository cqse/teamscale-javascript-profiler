import { Optional } from 'typescript-optional';
import { Contract } from '@cqse/commons';
import micromatch from 'micromatch';
import path from 'path';

/**
 * An abstract source map type.
 */
export abstract class SourceMapReference {}

/**
 * One element of an instrumentation task.
 * It corresponds to instrumenting a single file.
 */
export class TaskElement {
	/** The source file */
	public readonly fromFile: string;

	/** The destination file */
	public readonly toFile: string;

	/** An external source map file relevant for the file at hand */
	public readonly externalSourceMapFile: Optional<SourceMapReference>;

	constructor(fromFile: string, toFile: string, externalSourceMap?: SourceMapReference) {
		this.fromFile = Contract.requireDefined(fromFile);
		this.toFile = Contract.requireDefined(toFile);
		this.externalSourceMapFile = Optional.ofNullable(externalSourceMap);
	}

	/**
	 * Is it an in-place instrumentation task?
	 */
	public isInPlace(): boolean {
		// We assume that different file names link to different files on the storage
		// and abstract from the fact that it might be a symlink.
		return this.fromFile === this.toFile;
	}
}

/**
 * Specifies the collector that is supposed to
 * receive the coverage information.
 */
export class CollectorSpecifier {
	/** The URL specifying the address the collector is reachable at. */
	public readonly url: string;

	constructor(specifier: string) {
		if (specifier.indexOf('://') > 0) {
			// A trailing slash will be removed
			this.url = specifier.replace(/\/$/, '');
		} else {
			Contract.requireStringPattern(specifier, '.+:[0-9]+', 'Invalid collector pattern used!');
			const host = specifier.split(':')[0];
			const port = Number.parseInt(specifier.split(':')[1]);
			this.url = `ws://${host}:${port}`;
		}
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
	/** Glob pattern describing the set of files in the origin for that coverage should be produced. */
	private readonly include: string[] | undefined;

	/**
	 * Glob pattern describing the set of files in the origin for that coverage should EXPLICITLY NOT be produced.
	 * An exclude is stronger than an include.
	 */
	private readonly exclude: string[] | undefined;

	constructor(include: string[] | undefined, exclude: string[] | undefined) {
		this.include = normalizePatterns(include);
		this.exclude = normalizePatterns(exclude);
	}

	/**
	 * Does the given pattern require to include the given set of files?
	 *
	 * For example, a JavaScript bundle is compiled from several (origin) source files.
	 * If one of the files in the bundle is needed, then the full bundle is needed, that is,
	 * this function is required to return `true`.
	 *
	 * @param originFiles - The file set to decide for include or exclude.
	 *
	 * @returns `false` if (1) all given files are supposed to be excluded,
	 *   or (2) `true` if at least one of the files is supposed to be included.
	 */
	public isAnyIncluded(originFiles: string[]): boolean {
		if (originFiles.length === 0) {
			return true;
		}

		const normalizedOriginFiles = originFiles.map(normalizePath);
		if (this.exclude) {
			const matchedToExclude = micromatch(normalizedOriginFiles, this.exclude);
			if (originFiles.length === matchedToExclude.length) {
				return false;
			}
		}

		if (this.include) {
			return micromatch.some(normalizedOriginFiles, this.include || ['**']);
		}

		return true;
	}
}

/**
 * Pattern describing files (bundles) to not instrument.
 */
export class FileExcludePattern {
	/**
	 * Glob pattern describing a set of files to be excluded in the instrumentation process.
	 */
	private readonly exclude: string[];

	constructor(exclude: string[] | undefined) {
		this.exclude = normalizePatterns(exclude) ?? [];
	}

	/**
	 * Return `true` if the given `filePath` is matched by any of the patterns in `exclude`.
	 */
	public isExcluded(filePath: string): boolean {
		return micromatch.isMatch(normalizePath(filePath), this.exclude);
	}
}

/**
 * Normalizes all patterns (normally either include or exclude patterns), and returns all
 * valid normalized patterns. Returns undefined if the patterns list is undefined, or all
 * items inside the list are undefined.
 */
function normalizePatterns(patterns: string[] | undefined): string[] | undefined {
	if (patterns === undefined || patterns.length === 0) {
		return undefined;
	}
	const normalizedPatterns = patterns
		.map(pattern => normalizeGlobPattern(pattern))
		.filter(pattern => pattern !== undefined) as string[];
	if (patterns.length === 0) {
		return undefined;
	}
	return normalizedPatterns;
}

function normalizeGlobPattern(pattern: string | undefined): string | undefined {
	if (!pattern) {
		return pattern;
	}

	return removeTrailingCurrentWorkingDir(pattern);
}

function normalizePath(toNormalize: string): string {
	return removeTrailingCurrentWorkingDir(toNormalize.replace(/\\/g, '/'));
}

function removeTrailingCurrentWorkingDir(removeFrom: string): string {
	return removePrefix('webpack:///', removePrefix('./', removeFrom));
}

function removePrefix(prefix: string, removeFrom: string): string {
	if (removeFrom.startsWith(prefix)) {
		return removeFrom.substring(prefix.length);
	}
	return removeFrom;
}

/**
 * The actual instrumentation task.
 */
export class InstrumentationTask {
	/**
	 * The collector to send coverage information to.
	 */
	public readonly collector: CollectorSpecifier;

	/**
	 * The files to instrument along with a specification of the target.
	 */
	private readonly _elements: TaskElement[];

	/**
	 * A pattern describing which files or fragments of a bundle to instrument
	 * based on the original file names the code was transpiled from.
	 */
	public readonly originSourcePattern: OriginSourcePattern;

	/**
	 * A pattern describing the set of files to not instrument but to output
	 * without adding instrumentations.
	 */
	public readonly excludeFilesPattern: FileExcludePattern;

	/**
	 * File to write the file-origin-mapping to.
	 */
	public readonly dumpOriginsFile: string | undefined;

	constructor(
		collector: CollectorSpecifier,
		elements: TaskElement[],
		excludeFilesPattern: FileExcludePattern,
		originSourcePattern: OriginSourcePattern,
		dumpOriginsFile: string | undefined
	) {
		this.collector = Contract.requireDefined(collector);
		this.excludeFilesPattern = Contract.requireDefined(excludeFilesPattern);
		this.originSourcePattern = Contract.requireDefined(originSourcePattern);
		this._elements = Contract.requireDefined(elements).slice();
		this.dumpOriginsFile = dumpOriginsFile;
	}

	/**
	 * @returns the elements of the task.
	 */
	get elements(): TaskElement[] {
		// Ensure immutability of this object by returning a copy
		// of the list of immutable objects.
		return this._elements.slice();
	}
}

/**
 * A summary of executing the instrumentation task.
 */
export class TaskResult {
	/** Number of task elements that were performed (instrumented) */
	public readonly translated: number;

	/** Number of task elements that were excluded because of corresponding include/exclude patterns. */
	public readonly excluded: number;

	/** Number of instrumentations that were taken from a cache */
	public readonly translatedFromCache: number;

	/** Number of skips due to a present instrumentation */
	public readonly alreadyInstrumented: number;

	/** Number of files not support by the instrumenter */
	public readonly unsupported: number;

	/** Number of elements for that the instrumentation failed */
	public readonly failed: number;

	/** Number of warnings that were produced during the instrumentation process */
	public readonly warnings: number;

	constructor(
		translated: number,
		excluded: number,
		translatedFromCache: number,
		alreadyInstrumented: number,
		unsupported: number,
		failed: number,
		warnings: number
	) {
		Contract.require(translated > -1);
		Contract.require(excluded > -1);
		Contract.require(translatedFromCache > -1);
		Contract.require(alreadyInstrumented > -1);
		Contract.require(unsupported > -1);
		Contract.require(failed > -1);
		Contract.require(warnings > -1);
		this.translated = translated;
		this.excluded = excluded;
		this.translatedFromCache = translatedFromCache;
		this.alreadyInstrumented = alreadyInstrumented;
		this.unsupported = unsupported;
		this.failed = failed;
		this.warnings = warnings;
	}

	/**
	 * Returns the sum of the present task results and the given one.
	 *
	 * @param incBy - The task result to add (as delta).
	 */
	public withIncrement(incBy: TaskResult): TaskResult {
		return new TaskResult(
			this.translated + incBy.translated,
			this.excluded + incBy.excluded,
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
		return new TaskResult(0, 0, 0, 0, 0, 0, 0);
	}

	/**
	 * @returns a task result signaling one error.
	 *
	 * @param e - The error to add.
	 */
	public static error(e: Error): TaskResult {
		// console.error(e);
		return new TaskResult(0, 0, 0, 0, 0, 1, 0);
	}

	/**
	 * @returns a task result signaling one warning.
	 *
	 * @param msg - The warning message to add.
	 */
	public static warning(msg: string): TaskResult {
		console.warn(msg);
		return new TaskResult(0, 0, 0, 0, 0, 0, 1);
	}
}

/**
 * A source map in an external file.
 */
export class SourceMapFileReference extends SourceMapReference {
	/** The path the source map is stored in */
	public readonly sourceMapFilePath: string;

	constructor(sourceMapFilePath: string) {
		super();
		this.sourceMapFilePath = sourceMapFilePath;
	}
}
