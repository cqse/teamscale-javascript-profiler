import {
	CollectorSpecifier,
	InstrumentationTask,
	OriginSourcePattern,
	SourceMapFileReference,
	SourceMapReference,
	TaskElement
} from './Task';
import { Contract, ImplementMeException, InvalidConfigurationException } from '@cqse/common-qualities';
import fs = require('fs');
import path = require('path');
import {
	ensureExistingDirectory,
	expandToFileSet,
	isExistingDirectory,
	isExistingFile,
	specifiesFile
} from './FileSystem';

export class TaskBuilder {
	private readonly _elements: TaskElement[];

	private _collector: CollectorSpecifier | null;

	private _originSourceIncludePattern: string | undefined;

	private _originSourceExcludePattern: string | undefined;

	constructor() {
		this._elements = [];
		this._collector = null;
	}

	setCollectorFromString(spec: string): this {
		Contract.requireNonEmpty(spec);
		this._collector = new CollectorSpecifier(spec);
		return this;
	}

	setOriginSourceIncludePattern(pattern: string | undefined): this {
		this._originSourceIncludePattern = pattern;
		return this;
	}

	setOriginSourceExcludePattern(pattern: string | undefined): this {
		this._originSourceExcludePattern = pattern;
		return this;
	}

	addElement(fromFilePath: string, toFilePath: string, fromFileSourceMap?: SourceMapReference): this {
		this._elements.push(new TaskElement(fromFilePath, toFilePath, fromFileSourceMap));
		return this;
	}

	addFromConfig(config: any): this {
		const inputs: any[] = (config['inputs'] ?? []) as [];
		const inPlace: boolean = config['in_place'];
		const target: string = config['to'];
		const sourceMap: string = config['source_map'];
		this.setCollectorFromString(config['collector']);
		this.setOriginSourceIncludePattern(config['include_origin']);
		this.setOriginSourceExcludePattern(config['exclude_origin']);

		let sourceMapInfo: SourceMapReference | undefined;
		if (sourceMap) {
			if (!fs.existsSync(sourceMap)) {
				throw new InvalidConfigurationException(`The specified source map file '${sourceMap}' was not found.`);
			}
			sourceMapInfo = new SourceMapFileReference(sourceMap);
		}

		if (inPlace) {
			if (target) {
				throw new InvalidConfigurationException(
					'No target path must be specified in case an in-place instrumetation is enabled.'
				);
			}

			inputs
				.map(input => expandToFileSet(input))
				.reduce((prev, curr) => {
					return curr.concat(prev);
				}, [])
				.forEach(filePath => this.addElement(filePath, filePath, sourceMapInfo));
		} else if (!inPlace) {
			if (!target) {
				throw new InvalidConfigurationException('A target path must be specified using `--to`.');
			}
			ensureExistingDirectory(target);

			for (const input of inputs) {
				if (isExistingFile(input)) {
					if (specifiesFile(target)) {
						this.addElement(input, target, sourceMapInfo);
					} else {
						throw new ImplementMeException();
					}
				} else if (isExistingDirectory(input) || this.isPattern(input)) {
					const inputFiles = inputs
						.map(input => expandToFileSet(input))
						.reduce((prev, curr) => {
							return curr.concat(prev);
						}, []);

					if (this.isPattern(input)) {
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

	build(): InstrumentationTask {
		const pattern = new OriginSourcePattern(this._originSourceIncludePattern, this._originSourceExcludePattern);
		return new InstrumentationTask(Contract.requireDefined(this._collector), this._elements, pattern);
	}

	private isPattern(text: string): boolean {
		return text.includes('*') || text.includes('+') || text.includes('?') || text.includes('|');
	}
}
