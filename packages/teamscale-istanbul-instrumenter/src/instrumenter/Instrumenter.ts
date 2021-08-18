import {
	CollectorSpecifier,
	InstrumentationTask,
	OriginSourcePattern,
	SourceMapFileReference,
	TaskElement,
	TaskResult
} from './Task';
import { Contract, IllegalArgumentException, ImplementMeException } from '@cqse/common-qualities';
import { RawSourceMap } from 'source-map';
import * as istanbul from 'istanbul-lib-instrument';
import * as fs from 'fs';
import * as path from 'path';
import * as convertSourceMap from 'convert-source-map';

export const IS_INSTRUMENTED_TOKEN = '/** $IS_TS_AGENT_INSTRUMENTED=true **/';

export interface IInstrumenter {
	instrument(task: InstrumentationTask): Promise<TaskResult>;
}

export class IstanbulInstrumenter implements IInstrumenter {
	private readonly _vaccineFilePath: string;
	private readonly _verboseDebugOutput: boolean;

	constructor(vaccineFilePath: string, verboseDebugOutput: boolean) {
		this._vaccineFilePath = Contract.requireNonEmpty(vaccineFilePath);
		Contract.require(
			fs.existsSync(vaccineFilePath),
			`The vaccine file to inject "${vaccineFilePath}" must exist!\nCWD:${process.cwd()}`
		);
		this._verboseDebugOutput = verboseDebugOutput;
	}

	instrument(task: InstrumentationTask): Promise<TaskResult> {
		fs.existsSync(this._vaccineFilePath);

		// TODO: Do this concurrently with a set of workers.
		const result = task.elements
			.map(e => this.instrumentOne(task.collector, e, task.originSourcePattern))
			.reduce((prev, current) => current.withIncrement(prev), TaskResult.neutral());
		return Promise.resolve(result);
	}

	instrumentOne(
		collector: CollectorSpecifier,
		taskElement: TaskElement,
		sourcePattern: OriginSourcePattern
	): TaskResult {
		const inputFileSource = fs.readFileSync(taskElement.fromFile, 'utf8');

		if (inputFileSource.startsWith(IS_INSTRUMENTED_TOKEN)) {
			if (!taskElement.isInPlace()) {
				fs.writeFileSync(taskElement.toFile, inputFileSource);
			}
			return new TaskResult(0, 0, 1, 0, 0, 0);
		}

		if (!this.isFileTypeSupported(taskElement.fromFile)) {
			return new TaskResult(0, 0, 0, 1, 0, 0);
		}

		console.log(path.basename(taskElement.fromFile));

		if (taskElement.externalSourceMapFile.isPresent()) {
			throw new ImplementMeException();
		}

		let finalSourceMap;
		let instrumentedSource;

		const configurationAlternatives = this.configurationAlternativesFor(taskElement);
		for (let i = 0; i < configurationAlternatives.length; i++) {
			let inputSourceMap;
			try {
				const instrumenter = istanbul.createInstrumenter(configurationAlternatives[i]);
				inputSourceMap = this.loadInputSourceMap(inputFileSource, taskElement);

				instrumentedSource = instrumenter
					.instrumentSync(inputFileSource, taskElement.fromFile, inputSourceMap)
					.replace(
						/return actualCoverage/g,
						'return makeCoverageInterceptor(actualCoverage, actualCoverage, [])'
					)
					.replace(/new Function\("return this"\)\(\)/g, "typeof window === 'object' ? window : this");

				if (this._verboseDebugOutput) {
					console.log('Instrumentation source maps to:', instrumenter.lastSourceMap().sources);
				}

				if (
					this.shouldExcludeFromInstrumentation(
						sourcePattern,
						taskElement.fromFile,
						instrumenter.lastSourceMap().sources
					)
				) {
					fs.writeFileSync(taskElement.toFile, inputFileSource);
					return new TaskResult(1, 0, 0, 0, 0, 0);
				}

				finalSourceMap = convertSourceMap.fromObject(instrumenter.lastSourceMap()).toComment();

				break;
			} catch (e) {
				if (i == configurationAlternatives.length - 1) {
					if (!inputSourceMap) {
						return TaskResult.warning(
							`Failed loading input source map for ${taskElement.fromFile}: ${e.message}`
						);
					}
					fs.writeFileSync(taskElement.toFile, inputFileSource);
					return TaskResult.error(e);
				}
			}
		}

		const vaccineSource = fs
			.readFileSync(this._vaccineFilePath, 'utf8')
			.replace(/\$REPORT_TO_HOST/g, collector.host)
			.replace(/\$REPORT_TO_PORT/g, `${collector.port}`);

		fs.writeFileSync(
			taskElement.toFile,
			`${IS_INSTRUMENTED_TOKEN} ${vaccineSource} ${instrumentedSource} \n${finalSourceMap}`
		);

		return new TaskResult(1, 0, 0, 0, 0, 0);
	}

	private shouldExcludeFromInstrumentation(
		pattern: OriginSourcePattern,
		sourcefile: string,
		originSourcefiles: string[]
	): boolean {
		return !pattern.isAnyIncluded(originSourcefiles);
	}

	private isFileTypeSupported(fileName: string) {
		const ext = path.extname(fileName).toLowerCase();
		return ext == '.js';
	}

	private configurationAlternativesFor(taskElement: TaskElement): {}[] {
		const baseConfig = {
			coverageVariable: '__coverage__',
			produceSourceMap: true
		};

		return [
			{ ...baseConfig, ...{ esModules: true } },
			{ ...baseConfig, ...{ esModules: false } }
		];
	}

	private loadInputSourceMap(inputSource: string, taskElement: TaskElement): RawSourceMap | undefined {
		if (taskElement.externalSourceMapFile.isPresent()) {
			const sourceMapOrigin = taskElement.externalSourceMapFile.get();
			if (!(sourceMapOrigin instanceof SourceMapFileReference)) {
				throw new IllegalArgumentException('Type of source map not yet supported!');
			}
			return sourceMapFromMapFile(sourceMapOrigin.sourceMapFilePath);
		} else {
			return sourceMapFromCodeComment(inputSource, taskElement.fromFile);
		}
	}
}

export function sourceMapFromCodeComment(sourcecode: string, sourceFilePath: string): RawSourceMap | undefined {
	// Either `//# sourceMappingURL=vendor.5d7ba975.js.map`
	// or `//# sourceMappingURL=data:application/json;base64,eyJ2ZXJ ...`
	//
	// "It is reasonable for tools to also accept “//@” but “//#” is preferred."
	const re = /\/\/[#@]\s(source(?:Mapping)?URL)=\s*(\S+)/;
	const matched: RegExpMatchArray | null = re.exec(sourcecode);
	if (!matched) {
		return undefined;
	}

	const sourceMapComment: string = matched[0];
	if (sourceMapComment.slice(0, 50).indexOf('data:application/json') > 0) {
		return convertSourceMap.fromComment(sourceMapComment).toObject();
	} else {
		return convertSourceMap.fromMapFileComment(sourceMapComment, path.dirname(sourceFilePath)).toObject();
	}
}

export function sourceMapFromMapFile(mapFilePath: string): RawSourceMap | undefined {
	const content: string = fs.readFileSync(mapFilePath, 'utf8');
	return JSON.parse(content) as RawSourceMap;
}
