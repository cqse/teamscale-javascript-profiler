import {
	CollectorSpecifier,
	FileExcludePattern,
	InstrumentationTask,
	OriginSourcePattern,
	SourceMapFileReference,
	SourceMapReference,
	TaskElement,
	TaskResult
} from './Task';
import { Contract, IllegalArgumentException } from '@cqse/commons';
import { RawSourceMap, SourceMapConsumer } from 'source-map';
import * as istanbul from '@teamscale/lib-instrument';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as convertSourceMap from 'convert-source-map';
import { cleanSourceCode } from './Postprocessor';
import { Optional } from 'typescript-optional';
import Logger from 'bunyan';
import async from 'async';

export const IS_INSTRUMENTED_TOKEN = '/** $IS_JS_PROFILER_INSTRUMENTED=true **/';

/**
 * An instrumenter that can conduct a {@code InstrumentationTask}.
 */
export interface IInstrumenter {
	/**
	 * Perform the given instrumentation task.
	 *
	 * @param task - The instrumentation task to conduct.
	 */
	instrument(task: InstrumentationTask): Promise<TaskResult>;
}

/**
 * An instrumenter based on the IstanbulJs instrumentation and coverage framework.
 */
export class IstanbulInstrumenter implements IInstrumenter {
	/**
	 * The path to the vaccine to inject. The vaccine is a JavaScript
	 * file with the code to forward the coverage information
	 * produced by the Istanbul instrumentation.
	 */
	private readonly vaccineFilePath: string;

	/**
	 * The logger instance to log to.
	 */
	private logger: Logger;

	constructor(vaccineFilePath: string, logger: Logger) {
		this.vaccineFilePath = Contract.requireNonEmpty(vaccineFilePath);
		Contract.require(
			fs.existsSync(vaccineFilePath),
			`The vaccine file to inject "${vaccineFilePath}" must exist!\nCWD:${process.cwd()}`
		);
		this.logger = logger;
	}

	/**
	 * {@inheritDoc #IInstrumenter.instrument}
	 */
	async instrument(task: InstrumentationTask): Promise<TaskResult> {
		this.clearDumpOriginsFileIfNeeded(task.dumpOriginsFile);

		// We limit the number of instrumentations in parallel to one to
		// not overuse memory (NodeJS has only limited mem to use).
		return async
			.mapLimit(task.elements, 1, async (taskElement: TaskElement) => {
				return await this.instrumentOne(
					task.collector,
					taskElement,
					task.excludeFilesPattern,
					task.originSourcePattern,
					task.dumpOriginsFile
				);
			})
			.then(results => {
				return results.reduce((prev, curr) => {
					return prev.withIncrement(curr);
				}, TaskResult.neutral());
			});
	}

	/**
	 * Perform the instrumentation for one given task element (file to instrument).
	 *
	 * @param collector - The collector to send the coverage information to.
	 * @param taskElement - The task element to perform the instrumentation for.
	 * @param excludeBundles - A exclude pattern to restrict which bundles should be instrumented
	 * @param sourcePattern - A pattern to restrict the instrumentation to only a fraction of the task element.
	 * @param dumpOriginsFile - A file path where all origins from the source map should be dumped in json format, or undefined if no origins should be dumped
	 */
	async instrumentOne(
		collector: CollectorSpecifier,
		taskElement: TaskElement,
		excludeBundles: FileExcludePattern,
		sourcePattern: OriginSourcePattern,
		dumpOriginsFile: string | undefined
	): Promise<TaskResult> {
		// Not all file types are supported by the instrumenter
		if (!this.isFileTypeSupported(taskElement.fromFile)) {
			if (!taskElement.isInPlace()) {
				copyToFile(taskElement.toFile, taskElement.fromFile);
			}
			return new TaskResult(0, 0, 0, 0, 1, 0, 0);
		}

		// We might want to skip the instrumentation of the file
		if (excludeBundles.isExcluded(taskElement.fromFile)) {
			if (!taskElement.isInPlace()) {
				copyToFile(taskElement.toFile, taskElement.fromFile);
			}
			return new TaskResult(0, 1, 0, 0, 0, 0, 0);
		}

		const inputFileSource = fs.readFileSync(taskElement.fromFile, 'utf8');

		// We skip files that we have already instrumented
		if (inputFileSource.startsWith(IS_INSTRUMENTED_TOKEN)) {
			if (!taskElement.isInPlace()) {
				writeToFile(taskElement.toFile, inputFileSource);
			}
			return new TaskResult(0, 0, 0, 1, 0, 0, 0);
		}

		// Report progress
		this.logger.info(`Instrumenting "${path.basename(taskElement.fromFile)}"`);

		let finalSourceMap;
		let instrumentedSource;

		// We try to perform the instrumentation with different
		// alternative configurations of the instrumenter.
		const configurationAlternatives = this.configurationAlternativesFor(taskElement);
		for (let i = 0; i < configurationAlternatives.length; i++) {
			const configurationAlternative = configurationAlternatives[i];
			let inputSourceMap: RawSourceMap | undefined;
			try {
				const instrumenter = istanbul.createInstrumenter(configurationAlternative);
				inputSourceMap = loadInputSourceMap(
					inputFileSource,
					taskElement.fromFile,
					taskElement.externalSourceMapFile
				);

				// Based on the source maps of the file to instrument, we can now
				// decide if we should NOT write an instrumented version of it
				// and use the original code instead and write it to the target path.
				//
				const originSourceFiles = inputSourceMap?.sources ?? [];
				if (dumpOriginsFile) {
					this.dumpOrigins(dumpOriginsFile, originSourceFiles);
				}

				// The main instrumentation (adding coverage statements) is performed now:
				instrumentedSource = instrumenter.instrumentSync(inputFileSource, taskElement.fromFile, inputSourceMap);
				this.logger.debug('Instrumentation source maps to:', instrumenter.lastSourceMap()?.sources);

				// In case of a bundle, the initial instrumentation step might have added
				// too much and undesired instrumentations. Remove them now.
				const instrumentedSourcemap = instrumenter.lastSourceMap();

				let instrumentedAndCleanedSource = await this.removeUnwantedInstrumentation(
					taskElement,
					instrumentedSource,
					configurationAlternative,
					sourcePattern,
					instrumentedSourcemap
				);

				instrumentedAndCleanedSource = instrumentedAndCleanedSource
					.replace(
						/actualCoverage\s*=\s*coverage\[path\]/g,
						'actualCoverage=_$registerCoverageObject(coverage[path])'
					)
					.replace(/new Function\("return this"\)\(\)/g, "typeof window === 'object' ? window : this");

				// The process also can result in a new source map that we will append in the result.
				//
				// `lastSourceMap` === Sourcemap for the last file that was instrumented.
				finalSourceMap = convertSourceMap.fromObject(instrumenter.lastSourceMap()).toComment();

				// We now can glue together the final version of the instrumented file.
				const vaccineSource = this.loadVaccine(collector);

				writeToFile(
					taskElement.toFile,
					`${IS_INSTRUMENTED_TOKEN} ${vaccineSource} ${instrumentedAndCleanedSource} \n${finalSourceMap}`
				);

				return new TaskResult(1, 0, 0, 0, 0, 0, 0);
			} catch (e) {
				// If also the last configuration alternative failed,
				// we emit a corresponding warning or signal an error.
				if (i === configurationAlternatives.length - 1) {
					if (!inputSourceMap) {
						return TaskResult.warning(
							`Failed loading input source map for ${taskElement.fromFile}: ${(e as Error).message}`
						);
					}
					writeToFile(taskElement.toFile, inputFileSource);
					return TaskResult.error(e as Error);
				}
			}
		}

		return new TaskResult(0, 0, 0, 0, 0, 1, 0);
	}

	private async removeUnwantedInstrumentation(
		taskElement: TaskElement,
		instrumentedSource: string,
		configurationAlternative: Record<string, unknown>,
		sourcePattern: OriginSourcePattern,
		instrumentedSourcemap: RawSourceMap
	): Promise<string> {
		const instrumentedSourceMapConsumer: SourceMapConsumer | undefined = await new SourceMapConsumer(
			instrumentedSourcemap
		);

		// Without a source map, excludes/includes do not work.
		if (!instrumentedSourceMapConsumer) {
			return instrumentedSource;
		}

		const removedInstrumentationFor: Set<string> = new Set<string>();

		// Remove the unwanted instrumentation
		const cleaned = cleanSourceCode(instrumentedSource, configurationAlternative.esModules as boolean, location => {
			const originalPosition = instrumentedSourceMapConsumer.originalPositionFor({
				line: location.start.line,
				column: location.start.column
			});
			if (!originalPosition.source) {
				return false;
			}

			const isToCover = sourcePattern.isAnyIncluded([originalPosition.source]);
			if (!isToCover) {
				removedInstrumentationFor.add(originalPosition.source);
			}
			return isToCover;
		});

		if (removedInstrumentationFor.size) {
			this.logger.info(`Removed from ${taskElement.toFile} instrumentation for:`);
			removedInstrumentationFor.forEach(entry => this.logger.info(entry));
		}

		// Explicitly free the source map to avoid memory leaks
		instrumentedSourceMapConsumer.destroy();

		return cleaned;
	}

	/**
	 * Loads the vaccine from the vaccine file and adjusts some template parameters.
	 *
	 * @param collector - The collector to send coverage information to.
	 */
	private loadVaccine(collector: CollectorSpecifier) {
		// We first replace parameters in the file with the
		// actual values, for example, the collector to send the coverage information to.
		return fs.readFileSync(this.vaccineFilePath, 'utf8').replace(/\$REPORT_TO_URL/g, collector.url);
	}

	/**
	 * @returns whether the given file is supported for instrumentation.
	 */
	private isFileTypeSupported(fileName: string) {
		const ext = path.extname(fileName).toLowerCase();
		return ext === '.js' || ext === '.mjs';
	}

	/**
	 * Determine the list of configurations to try conducting the
	 * given task element.
	 */
	private configurationAlternativesFor(taskElement: TaskElement): Record<string, unknown>[] {
		this.logger.debug(`Determining configuration alternatives for ${taskElement.fromFile}`);

		const baseConfig = {
			coverageVariable: '__coverage__',
			produceSourceMap: 'both'
		};

		return [
			{ ...baseConfig, ...{ esModules: true } },
			{ ...baseConfig, ...{ esModules: false } }
		];
	}

	/** Appends all origins from the source map to a given file. Creates the file if it does not exist yet. */
	private dumpOrigins(dumpOriginsFile: string, originSourceFiles: string[]) {
		const jsonContent = JSON.stringify(originSourceFiles, null, 2);
		fs.writeFile(dumpOriginsFile, jsonContent + '\n', { flag: 'a' }, error => {
			if (error) {
				this.logger.warn('Could not dump origins file');
			}
		});
	}

	/** Clears the dump origins file if it exists, such that it is now ready to be appended for every instrumented file. */
	private clearDumpOriginsFileIfNeeded(dumpOriginsFile: string | undefined) {
		if (dumpOriginsFile && fs.existsSync(dumpOriginsFile)) {
			try {
				fs.unlinkSync(dumpOriginsFile);
			} catch (err) {
				this.logger.warn('Could not clear origins file: ' + err);
			}
		}
	}
}

/**
 * Extract the sourcemap from the given source code.
 *
 * @param instrumentedSource - The source code.
 * @param instrumentedSourceFileName - The file name to assume for the file name.
 */
export async function loadSourceMap(
	instrumentedSource: string,
	instrumentedSourceFileName: string
): Promise<SourceMapConsumer | undefined> {
	const instrumentedSourceMap: RawSourceMap | undefined = loadInputSourceMap(
		instrumentedSource,
		instrumentedSourceFileName,
		Optional.empty()
	);
	if (instrumentedSourceMap) {
		return await new SourceMapConsumer(instrumentedSourceMap);
	}
	return undefined;
}

/**
 * Given a source code file, load the corresponding sourcemap.
 *
 * @param inputSource - The source code that might contain sourcemap comments.
 * @param taskFile - The name of the file the `inputSource` is from.
 * @param externalSourceMapFile - An external source map file to consider.
 */
export function loadInputSourceMap(
	inputSource: string,
	taskFile: string,
	externalSourceMapFile: Optional<SourceMapReference>
): RawSourceMap | undefined {
	if (externalSourceMapFile.isPresent()) {
		const sourceMapOrigin = externalSourceMapFile.get();
		if (!(sourceMapOrigin instanceof SourceMapFileReference)) {
			throw new IllegalArgumentException('Type of source map not yet supported!');
		}
		return sourceMapFromMapFile(sourceMapOrigin.sourceMapFilePath);
	} else {
		return sourceMapFromCodeComment(inputSource, taskFile);
	}
}

/**
 * Extract a sourcemap for a given code comment.
 *
 * @param sourcecode - The source code that is scanned for source map comments.
 * @param sourceFilePath - The file name the code was loaded from.
 */
export function sourceMapFromCodeComment(sourcecode: string, sourceFilePath: string): RawSourceMap | undefined {
	// Either `//# sourceMappingURL=vendor.5d7ba975.js.map`
	// or `//# sourceMappingURL=data:application/json;base64,eyJ2ZXJ ...`
	//
	// "It is reasonable for tools to also accept “//@” but “//#” is preferred."
	const re = /\/\/[#@]\s(source(?:Mapping)?URL)=\s*(\S+)/g;

	let failedLoading = 0;
	let result: RawSourceMap | undefined;
	let matched: RegExpMatchArray | null;
	do {
		matched = re.exec(sourcecode);
		if (matched) {
			const sourceMapComment: string = matched[0];
			try {
				if (sourceMapComment.slice(0, 50).indexOf('data:application/json') > 0) {
					result = convertSourceMap.fromComment(sourceMapComment).toObject();
				} else {
					result = convertSourceMap
						.fromMapFileComment(sourceMapComment, function (filename) {
							return fs.readFileSync(path.resolve(path.dirname(sourceFilePath), filename), 'utf-8');
						})
						.toObject();
				}
			} catch (e) {
				// One JS file can refer to several source map files in its comments.
				failedLoading++;
			}
		}
	} while (matched);

	if (result) {
		return result;
	}

	if (failedLoading > 0) {
		throw new IllegalArgumentException('None of the referenced source map files loaded!');
	} else {
		return undefined;
	}
}

/**
 * Read a source map from a source map file.
 *
 * @param mapFilePath
 */
export function sourceMapFromMapFile(mapFilePath: string): RawSourceMap | undefined {
	const content: string = fs.readFileSync(mapFilePath, 'utf8');
	return JSON.parse(content) as RawSourceMap;
}

function writeToFile(filePath: string, fileContent: string) {
	mkdirp.sync(path.dirname(filePath));
	fs.writeFileSync(filePath, fileContent);
}

function copyToFile(targetFilePath: string, sourceFilePath: string) {
	mkdirp.sync(path.dirname(targetFilePath));
	fs.copyFileSync(sourceFilePath, targetFilePath);
}
