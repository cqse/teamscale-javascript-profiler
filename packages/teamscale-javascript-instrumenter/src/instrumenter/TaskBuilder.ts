import {
	CollectorSpecifier,
	InstrumentationTask,
	OriginSourcePattern,
	SourceMapFileReference,
	SourceMapReference,
	TaskElement
} from './Task';
import { Contract, InvalidConfigurationException } from '@cqse/commons';
import * as fs from 'fs';
import * as path from 'path';
import { ensureExistingDirectory, expandToFileSet, isExistingDirectory, isExistingFile } from './FileSystem';

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
	// eslint-disable-next-line camelcase
	include_origin?: string;
	// eslint-disable-next-line camelcase
	exclude_origin?: string;
};

/**
 * A builder for an instrumentation task.
 */
export class TaskBuilder {
	/** The elements of the instrumentation task. */
	private readonly elements: TaskElement[];

	/** The collector to send the coverage to. */
	private collector: CollectorSpecifier | null;

	/** An include pattern. */
	private originSourceIncludePattern: string | undefined;

	/** An exclude pattern. */
	private originSourceExcludePattern: string | undefined;

	constructor() {
		this.elements = [];
		this.collector = null;
	}

	/** Set the collector by extracting the information from a given string */
	setCollectorFromString(collectorSpecification: string): this {
		Contract.requireNonEmpty(collectorSpecification);
		this.collector = new CollectorSpecifier(collectorSpecification);
		return this;
	}

	/** Set the include pattern */
	setOriginSourceIncludePattern(pattern: string | undefined): this {
		this.originSourceIncludePattern = pattern;
		return this;
	}

	/** Set the exclude patter */
	setOriginSourceExcludePattern(pattern: string | undefined): this {
		this.originSourceExcludePattern = pattern;
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
		this.setCollectorFromString(config.collector);
		this.setOriginSourceIncludePattern(config.include_origin);
		this.setOriginSourceExcludePattern(config.exclude_origin);

		// Handle an explicitly specified source map
		let sourceMapInfo: SourceMapReference | undefined;
		if (sourceMap) {
			if (!fs.existsSync(sourceMap)) {
				throw new InvalidConfigurationException(`The specified source map file '${sourceMap}' was not found.`);
			}
			sourceMapInfo = new SourceMapFileReference(sourceMap);
		}

		// Depending on whether or not an in place instrumentation is needed
		// the task has to be built differently and different invariants
		// have to be satisfied by the passed configuration.
		if (inPlace) {
			if (target) {
				throw new InvalidConfigurationException(
					'No target path must be specified in case an in-place instrumentation is enabled.'
				);
			}

			inputs
				.map(input => expandToFileSet(input))
				.reduce((prev, curr) => {
					return curr.concat(prev);
				}, [])
				.forEach(filePath => this.addElement(filePath, filePath, sourceMapInfo));
		} else if (!inPlace) {
			// A target directory must be specified
			if (!target) {
				throw new InvalidConfigurationException('A target path must be specified using `--to`.');
			}
			ensureExistingDirectory(target);

			// Create task elements for all input specifiers
			for (const input of inputs) {
				if (isExistingFile(input)) {
					if (isExistingDirectory(target) || target.endsWith(path.sep)) {
						this.addElement(input, path.join(target, path.basename(input)), sourceMapInfo);
					} else {
						this.addElement(input, target, sourceMapInfo);
					}
				} else if (isExistingDirectory(input) || isPattern(input)) {
					const inputFiles = inputs
						.map(input => expandToFileSet(input))
						.reduce((prev, curr) => {
							return curr.concat(prev);
						}, []);

					if (isPattern(input)) {
						inputFiles.forEach(f => this.addElement(f, path.join(target, path.basename(f)), sourceMapInfo));
					} else {
						inputFiles.forEach(f =>
							this.addElement(f, path.join(target, path.relative(input, path.basename(f))), sourceMapInfo)
						);
					}
				} else {
					throw new InvalidConfigurationException(`The specified input '${input}' was not found.`);
				}
			}
		}

		return this;
	}

	/**
	 * Build the instrumentation task.
	 */
	public build(): InstrumentationTask {
		const pattern = new OriginSourcePattern(this.originSourceIncludePattern, this.originSourceExcludePattern);
		return new InstrumentationTask(Contract.requireDefined(this.collector), this.elements, pattern);
	}
}

/**
 * Does the given string look like a RegExp or Glob pattern?
 */
function isPattern(text: string): boolean {
	return text.includes('*') || text.includes('+') || text.includes('?') || text.includes('|');
}
