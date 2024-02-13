import {
	FileExcludePattern,
	InstrumentationTask,
	OriginSourcePattern,
	SourceMapFileReference,
	SourceMapReference,
	TaskElement,
	createCollectorSpecifier
} from './Task';
import { Contract, InvalidConfigurationException } from '@cqse/commons';
import * as fs from 'fs';
import * as path from 'path';
import { ensureExistingDirectory, expandToFileSet, isExistingDirectory, isExistingFile } from './FileSystem';
import { CollectorSpecifier } from '@src/vaccine/types';

/** The parameters the instrumenter can be configured by */
export type ConfigurationParameters = {
	inputs?: string[];
	// eslint-disable-next-line camelcase
	in_place?: boolean;
	debug?: boolean;
	to?: string;
	// eslint-disable-next-line camelcase
	source_map?: string;
	collector: string;
	collector_pattern?: string;
	// eslint-disable-next-line camelcase
	include_origin?: string[];
	// eslint-disable-next-line camelcase
	exclude_origin?: string[];
	// eslint-disable-next-line camelcase
	exclude_bundle?: string[];
	// eslint-disable-next-line camelcase
	dump_origins_to?: string;
	// eslint-disable-next-line camelcase
	dump_origin_matches_to?: string;
};

/**
 * Load a source map object from the given file (path).
 * Exception if the specified file does not exist.
 *
 * @param sourceMapPath - The path to the source map file.
 */
function loadSourceMap(sourceMapPath: string | undefined) {
	if (sourceMapPath) {
		if (!fs.existsSync(sourceMapPath)) {
			throw new InvalidConfigurationException(`The specified source map file '${sourceMapPath}' was not found.`);
		}
		return new SourceMapFileReference(sourceMapPath);
	}
	return undefined;
}

/**
 * A builder for an instrumentation task.
 */
export class TaskBuilder {
	/** The elements of the instrumentation task. */
	private readonly elements: TaskElement[];

	/** The collector to send the coverage to. */
	private collector: CollectorSpecifier | null;

	/** Origin include patterns. */
	private originSourceIncludePatterns: string[] | undefined;

	/** Origin exclude patters. */
	private originSourceExcludePatterns: string[] | undefined;

	/** Bundle exclude patters. */
	private bundleFileExcludePatterns: string[] | undefined;

	/**
	 * File path where all origins from the source map should be dumped in JSON format,
	 * or undefined if no origins should be dumped */
	private dumpOriginsFile: string | undefined;

	/**
	 * File path where the matched origin file names are stored as JSON,
	 * `undefined` if this information should not be dumped.
	 */
	private dumpMatchedOriginsFile: string | undefined;

	constructor() {
		this.elements = [];
		this.collector = null;
	}

	/** Set the collector specification based on the command-line arguments. */
	setCollectorFromCommandLine(commandLineUrl: string, substitutionPattern?: string): this {
		Contract.requireNonEmpty(commandLineUrl, "The collector URL must not be empty");
		this.collector = createCollectorSpecifier(commandLineUrl, substitutionPattern);
		return this;
	}

	/** Set the origin include pattern. If multiple patterns are present, concatenates them via the OR operator.  */
	setOriginSourceIncludePatterns(patterns: string[] | undefined): this {
		this.originSourceIncludePatterns = patterns;
		return this;
	}

	/** Set the origin exclude pattern(s). If multiple patterns are present, concatenates them via the OR operator. */
	setOriginSourceExcludePatterns(patterns: string[] | undefined): this {
		this.originSourceExcludePatterns = patterns;
		return this;
	}

	/** Sets the file bundle exclude pattern. If multiple patterns are present, concatenates them via the OR operator. */
	setBundleExcludePatterns(patterns: string[] | undefined): this {
		this.bundleFileExcludePatterns = patterns;
		return this;
	}

	/** Add a task element */
	addElement(fromFilePath: string, toFilePath: string, fromFileSourceMap?: SourceMapReference): this {
		this.elements.push(new TaskElement(fromFilePath, toFilePath, fromFileSourceMap));
		return this;
	}

	/**
	 * Add the task details based on a configuration (command line arguments).
	 *
	 * @param config - The configuration based on that the task is built.
	 */
	addFromConfig(config: ConfigurationParameters): this {
		const inputs: string[] = (config.inputs ?? []) as [];
		const inPlace: boolean = config.in_place ?? true;
		const target: string | undefined = config.to;
		const sourceMap: string | undefined = config.source_map;
		this.dumpOriginsFile = config.dump_origins_to;
		this.dumpMatchedOriginsFile = config.dump_origin_matches_to;
		this.setCollectorFromCommandLine(config.collector, config.collector_pattern);
		this.setOriginSourceIncludePatterns(config.include_origin);
		this.setOriginSourceExcludePatterns(config.exclude_origin);
		this.setBundleExcludePatterns(config.exclude_bundle);

		// Handle an explicitly specified source map
		const sourceMapInfo = loadSourceMap(sourceMap);

		// If an in place instrumentation is needed
		// the task has to be built differently and different invariants
		// have to be satisfied by the passed configuration.
		if (inPlace) {
			if (target) {
				throw new InvalidConfigurationException(
					'No target path must be specified in case an in-place instrumentation is enabled.'
				);
			}
			this.addInPlaceTasksFromPattern(inputs, sourceMapInfo);
		} else if (!inPlace) {
			// A target directory must be specified
			if (!target) {
				throw new InvalidConfigurationException('A target path must be specified using `--to`.');
			}

			this.addInstrumentationTasksFromPatternWithTarget(inputs, target, sourceMapInfo);
		}

		return this;
	}

	/**
	 * Adds instrumentation tasks based on a given pattern `inputs` describing the set of
	 * input files and produces the output files in the specified output folder `target.
	 *
	 * @param inputs - Glob pattern describing set of input files
	 * @param target - Target folder
	 * @param sourceMapInfo - Source map file for all the input files.
	 */
	private addInstrumentationTasksFromPatternWithTarget(
		inputs: string[],
		target: string,
		sourceMapInfo: SourceMapFileReference | undefined
	) {
		ensureExistingDirectory(target);

		for (const input of inputs) {
			if (isExistingFile(input)) {
				if (isExistingDirectory(target) || target.endsWith(path.sep)) {
					this.addElement(input, path.join(target, path.basename(input)), sourceMapInfo);
				} else {
					this.addElement(input, target, sourceMapInfo);
				}
			} else if (isExistingDirectory(input) || isPattern(input)) {
				const inputFiles = inputs.flatMap(input => expandToFileSet(input));

				if (isPattern(input)) {
					inputFiles.forEach(f => this.addElement(f, path.join(target, path.basename(f)), sourceMapInfo));
				} else {
					inputFiles.forEach(f => {
						const pathRelativeToInputDir = path.relative(input, f);
						const targetFileName = path.join(target, pathRelativeToInputDir);
						this.addElement(f, targetFileName, sourceMapInfo);
					});
				}
			} else {
				throw new InvalidConfigurationException(`The specified input '${input}' was not found.`);
			}
		}
	}

	/**
	 * Adds in-place instrumentation tasks for the set of files described
	 * by the `inputs` pattern.
	 *
	 * @param inputs - Glob pattern.
	 * @param sourceMapInfo - Source map for the files described by the pattern.
	 */
	private addInPlaceTasksFromPattern(inputs: string[], sourceMapInfo: SourceMapFileReference | undefined) {
		inputs
			.map(input => expandAndCheck(input))
			.reduce((prev, curr) => {
				return curr.concat(prev);
			}, [])
			.forEach(filePath => this.addElement(filePath, filePath, sourceMapInfo));
	}

	/**
	 * Build the instrumentation task.
	 */
	public build(): InstrumentationTask {
		return new InstrumentationTask(
			Contract.requireDefined(this.collector),
			this.elements,
			new FileExcludePattern(this.bundleFileExcludePatterns),
			new OriginSourcePattern(this.originSourceIncludePatterns, this.originSourceExcludePatterns),
			this.dumpOriginsFile,
			this.dumpMatchedOriginsFile
		);
	}
}

/**
 * Does the given string look like a RegExp or Glob pattern?
 */
function isPattern(text: string): boolean {
	return text.includes('*') || text.includes('+') || text.includes('?') || text.includes('|');
}

/**
 * Expand the given Glob pattern and check if files matched.
 * Raises an exception is the result is empty.
 *
 * @param pattern - The Glob pattern used for matching.
 */
function expandAndCheck(pattern: string): string[] {
	const result: string[] = expandToFileSet(pattern);
	if (result.length === 0) {
		throw new InvalidConfigurationException(
			`No files to instrument found. \n\tWorking directory: '${process.cwd()}'\n\tPattern: '${pattern}'`
		);
	}
	return result;
}
