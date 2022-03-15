import {
	CollectorSpecifier,
	InstrumentationTask,
	OriginSourcePattern,
	SourceMapFileReference,
	SourceMapReference,
	TaskElement,
	TaskResult
} from './Task';
import { Contract, IllegalArgumentException } from '@cqse/commons';
import { RawSourceMap, SourceMapConsumer } from 'source-map';
import * as istanbul from 'istanbul-lib-instrument';
import * as fs from 'fs';
import * as path from 'path';
import * as convertSourceMap from 'convert-source-map';
import { Logger } from 'winston';
import { cleanSourceCode } from './Cleaner';
import { Optional } from 'typescript-optional';

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
		fs.existsSync(this.vaccineFilePath);

		// ATTENTION: Here is potential for parallelization. Maybe we can
		// run several instrumentation workers in parallel?

		let result: TaskResult = TaskResult.neutral();
		for (const taskElement of task.elements) {
			const instrumentationResult = await this.instrumentOne(
				task.collector,
				taskElement,
				task.originSourcePattern
			);
			result = result.withIncrement(instrumentationResult);
		}

		return Promise.resolve(result);
	}

	/**
	 * Perform the instrumentation for one given task element (file to instrument).
	 *
	 * @param collector - The collector to send the coverage information to.
	 * @param taskElement - The task element to perform the instrumentation for.
	 * @param sourcePattern - A pattern to restrict the instrumentation to only a fraction of the task element.
	 */
	async instrumentOne(
		collector: CollectorSpecifier,
		taskElement: TaskElement,
		sourcePattern: OriginSourcePattern
	): Promise<TaskResult> {
		const inputFileSource = fs.readFileSync(taskElement.fromFile, 'utf8');

		// We skip files that we have already instrumented
		if (inputFileSource.startsWith(IS_INSTRUMENTED_TOKEN)) {
			if (!taskElement.isInPlace()) {
				fs.writeFileSync(taskElement.toFile, inputFileSource);
			}
			return new TaskResult(0, 0, 0, 1, 0, 0, 0);
		}

		// Not all file types are supported by the instrumenter
		if (!this.isFileTypeSupported(taskElement.fromFile)) {
			return new TaskResult(0, 0, 0, 0, 1, 0, 0);
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
				const instrumenter = istanbul.createInstrumenter();
				inputSourceMap = this.loadInputSourceMap(
					inputFileSource,
					taskElement.fromFile,
					taskElement.externalSourceMapFile
				);

				// Based on the source maps of the file to instrument, we can now
				// decide if we should NOT write an instrumented version of it
				// and use the original code instead and write it to the target path.
				//
				if (
					this.shouldExcludeFromInstrumentation(
						sourcePattern,
						taskElement.fromFile,
						inputSourceMap?.sources ?? []
					)
				) {
					fs.writeFileSync(taskElement.toFile, inputFileSource);
					return new TaskResult(0, 1, 0, 0, 0, 0, 0);
				}

				// The main instrumentation (adding coverage statements) is performed now:
				instrumentedSource = instrumenter
					.instrumentSync(inputFileSource, taskElement.fromFile, inputSourceMap as any)
					.replace(/return actualCoverage/g, 'return makeCoverageInterceptor(actualCoverage)')
					.replace(/new Function\("return this"\)\(\)/g, "typeof window === 'object' ? window : this");
				this.logger.debug('Instrumentation source maps to:', instrumenter.lastSourceMap()?.sources);

				// In case of a bundle, the initial instrumentation step might have added
				// too much and undesired instrumentations. Remove them now.
				instrumentedSource = await this.removeUnwantedInstrumentation(
					taskElement,
					instrumentedSource,
					configurationAlternative,
					sourcePattern
				);

				// The process also can result in a new source map that we will append in the result.
				//
				// `lastSourceMap` === Sourcemap for the last file that was instrumented.
				finalSourceMap = convertSourceMap.fromObject(instrumenter.lastSourceMap()).toComment();

				break;
			} catch (e) {
				// If also the last configuration alternative failed,
				// we emit a corresponding warning or signal an error.
				if (i === configurationAlternatives.length - 1) {
					if (!inputSourceMap) {
						return TaskResult.warning(
							`Failed loading input source map for ${taskElement.fromFile}: ${(e as Error).message}`
						);
					}
					fs.writeFileSync(taskElement.toFile, inputFileSource);
					return TaskResult.error(e as Error);
				}
			}
		}

		// We now can glue together the final version of the instrumented file.
		//
		const vaccineSource = this.loadVaccine(collector);

		fs.writeFileSync(
			taskElement.toFile,
			`${IS_INSTRUMENTED_TOKEN} ${vaccineSource} ${instrumentedSource} \n${finalSourceMap}`
		);

		return new TaskResult(1, 0, 0, 0, 0, 0, 0);
	}

	private async removeUnwantedInstrumentation(
		taskElement: TaskElement,
		instrumentedSource: string,
		configurationAlternative: Record<string, unknown>,
		sourcePattern: OriginSourcePattern
	) {
		// Read the source map from the instrumented file
		const instrumentedSourceMapConsumer: SourceMapConsumer | undefined = await (async (
			instrumentedSource: string
		): Promise<SourceMapConsumer | undefined> => {
			const instrumentedSourceMap: RawSourceMap | undefined = this.loadInputSourceMap(
				instrumentedSource,
				taskElement.fromFile,
				Optional.empty()
			);
			if (instrumentedSourceMap) {
				return await new SourceMapConsumer(instrumentedSourceMap);
			}
			return undefined;
		})(instrumentedSource);

		// Without a source map, excludes/includes do not work.
		if (!instrumentedSourceMapConsumer) {
			return instrumentedSource;
		}

		// Remove the unwanted instrumentation
		return cleanSourceCode(instrumentedSource, configurationAlternative.esModules as boolean, location => {
			const originalPosition = instrumentedSourceMapConsumer.originalPositionFor({
				line: location.start.line,
				column: location.start.column
			});
			if (!originalPosition.source) {
				return true;
			}
			return sourcePattern.isAnyIncluded([originalPosition.source]);
		});
	}

	/**
	 * Loads the vaccine from the vaccine file and adjusts some template parameters.
	 *
	 * @param collector - The collector to send coverage information to.
	 */
	private loadVaccine(collector: CollectorSpecifier) {
		// We first replace some of the parameters in the file with the
		// actual values, for example, the collector to send the coverage information to.
		return fs
			.readFileSync(this.vaccineFilePath, 'utf8')
			.replace(/\$REPORT_TO_HOST/g, collector.host)
			.replace(/\$REPORT_TO_PORT/g, `${collector.port}`);
	}

	/**
	 * Should the given file be excluded from the instrumentation,
	 * based on the source files that have been transpiled into it?
	 *
	 * @param pattern - The pattern to match the origin source files.
	 * @param sourceFile - The bundle file name.
	 * @param originSourceFiles - The list of files that were transpiled into the bundle.
	 */
	private shouldExcludeFromInstrumentation(
		pattern: OriginSourcePattern,
		sourceFile: string,
		originSourceFiles: string[]
	): boolean {
		return !pattern.isAnyIncluded(originSourceFiles);
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
			produceSourceMap: true
		};

		return [
			{ ...baseConfig, ...{ esModules: true } },
			{ ...baseConfig, ...{ esModules: false } }
		];
	}

	/**
	 * Given a source code file and the task element, load the corresponding sourcemap.
	 *
	 * @param inputSource - The source code that might contain sourcemap comments.
	 * @param taskElement - The task element that can have a reference to an external sourcemap.
	 */
	private loadInputSourceMap(
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
}

/**
 * Extract a sourcemap for a given code comment.
 *
 * @param sourcecode - The source code that is scanned for source map comments.
 * @param sourceFilePath - The file name the code was loaded from.
 */
function sourceMapFromCodeComment(sourcecode: string, sourceFilePath: string): RawSourceMap | undefined {
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
						.fromMapFileComment(sourceMapComment, path.dirname(sourceFilePath))
						.toObject();
				}
			} catch (e) {
				// One JS file can refer to several source map files in its comments.
				failedLoading++;
			}

			if (result) {
				return result;
			}
		}
	} while (matched);

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
function sourceMapFromMapFile(mapFilePath: string): RawSourceMap | undefined {
	const content: string = fs.readFileSync(mapFilePath, 'utf8');
	return JSON.parse(content) as RawSourceMap;
}
