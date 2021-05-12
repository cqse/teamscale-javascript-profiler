import {CollectorSpecifier, InstrumentationTask, SourceMapFileReference, SourceMapReference, TaskElement} from "./Task";
import {Contract, ImplementMeException, InvalidConfigurationException} from "@cqse/common-qualities";
import glob = require ("glob");
import fs = require ("fs");
import path = require ("path");
import mkdirp = require("mkdirp");

export class TaskBuilder {

    private readonly _elements: TaskElement[];

    private _collector: CollectorSpecifier | null;

    constructor() {
        this._elements = [];
        this._collector = null;
    }

    setCollectorFromString(spec: string): this {
        Contract.requireNonEmpty(spec);
        this._collector = new CollectorSpecifier(spec);
        return this;
    }

    addElement(fromFilePath: string, toFilePath: string, fromFileSourceMap?: SourceMapReference): this {
        this._elements.push(new TaskElement(fromFilePath, toFilePath, fromFileSourceMap))
        return this;
    }

    addFromConfig(config: any): this {
        const inputs: any[] = (config['inputs'] ?? []) as [];
        const inPlace: boolean = config['in_place'];
        const target: string = config['to'];
        const sourceMap: string = config['source_map'];
        this.setCollectorFromString(config['collector']);

        let sourceMapInfo: SourceMapReference|undefined;
        if (sourceMap) {
            if (!fs.existsSync(sourceMap)) {
                throw new InvalidConfigurationException(`The specified source map file '${sourceMap}' was not found.`);
            }
            sourceMapInfo = new SourceMapFileReference(sourceMap);
        }

        if (inPlace) {
            if (target) {
                throw new InvalidConfigurationException("No target path must be specified in case an in-place instrumetation is enabled.");
            }

            inputs.map((input) => this.expandToFileSet(input))
                .reduce((prev, curr) => {return curr.concat(prev);}, [])
                .forEach((filePath) => this.addElement(filePath, filePath, sourceMapInfo));
        } else if (!inPlace) {
            if (!target) {
                throw new InvalidConfigurationException("A target path must be specified using `--to`.");
            }
            this.ensureExistingDirectory(target);

            for (const input of inputs) {
                if (this.isExistingFile(input)) {
                    if (this.specifiesFile(target)) {
                        this.addElement(input, target, sourceMapInfo);
                    } else {
                        throw new ImplementMeException();
                    }
                } else if (this.isExistingDirectory(input) || this.isPattern(input)) {
                    const inputFiles = inputs
                        .map((input) => this.expandToFileSet(input))
                        .reduce((prev, curr) => {return curr.concat(prev);}, []);

                    if (this.isPattern(input)) {
                        inputFiles.forEach((f) => this.addElement(f, path.join(target, path.basename(f)), sourceMapInfo));
                    } else {
                        inputFiles.forEach((f) => this.addElement(f, path.join(target, path.relative(input, path.basename(f))), sourceMapInfo));
                    }
                } else {
                    throw new InvalidConfigurationException(`The specified input '${input}' was not found.`)
                }
            }
        }

        return this;
    }

    build(): InstrumentationTask {
        return new InstrumentationTask(Contract.requireDefined(this._collector), this._elements);
    }

    private isPattern(text: string): boolean {
        return text.includes("*") || text.includes("+") || text.includes("?") || text.includes("|");
    }

    /**
     * The given file is allowed to not exist.
     */
    private specifiesFile(path: string): boolean {
        throw new ImplementMeException();
    }

    private isExistingFile(path: string): boolean {
        return fs.existsSync(path) && fs.lstatSync(path).isFile();
    }

    private isExistingDirectory(path: string): boolean {
        return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
    }

    private ensureExistingDirectory(path: string): void {
        if (!fs.existsSync(path)) {
            mkdirp.sync(path);
        }

        if (!fs.lstatSync(path).isDirectory()) {
            throw new InvalidConfigurationException(`The specified path '${path}' does not point to an existing directory!`);
        }
    }

    private isDirectoryEmpty(path: string): boolean {
        return !this.isExistingDirectory(path) || fs.readdirSync(path).length > 0;
    }

    private expandToFileSet(toExpand: string): string[] {
        let globPattern = toExpand;
        if (fs.existsSync(toExpand)) {
            const stat = fs.lstatSync(toExpand, {});
            if (stat.isFile()) {
                return [toExpand];
            }

            if (stat.isDirectory()) {
                globPattern = `${toExpand}${path.delimiter}**`;
            }
        }

        const result: string[] = glob.sync(globPattern, {nodir: true});

        if (result.length === 0) {
            throw new InvalidConfigurationException(`No files to instrument found. \n\tWorking directory: '${process.cwd()}'\n\tPattern: '${globPattern}'`);
        }

        return result;
    }
}