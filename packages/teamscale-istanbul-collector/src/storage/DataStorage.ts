import {Contract} from "@cqse/common-qualities";
import * as fs from "fs";
import path = require ("path");

export type FileCoverage = {
    sourceFile: string;
    coveredLines: Set<number>;
}

export interface IReadableStorage {

    getProjects(): string[];

    getCoverageBySourceFile(project: string): IterableIterator<FileCoverage> | undefined;

    writeToSimpleCoverageFile(filePath: string): void;

}

export interface IWriteableStorage {

    putCoverage(project: string, sourceFilePath: string, coveredOriginalLines: number[]): void;

    signalUnmappedCoverage(): void;

}

export interface IDataStorage extends IReadableStorage, IWriteableStorage {

}

export class ProjectCoverage {

    private readonly _projectId: string;

    private readonly _coveredLinesByFile: Map<string, Set<number>>;

    constructor(projectId: string) {
        this._projectId = Contract.requireDefined(projectId);
        this._coveredLinesByFile = new Map();
    }

    public putLine(sourceFile: string, line: number): void {
        let targetSet = this._coveredLinesByFile.get(sourceFile);
        if (!targetSet) {
            targetSet = new Set();
            this._coveredLinesByFile.set(sourceFile, targetSet);
        }
        targetSet.add(line);
    }

    public getCoverage(): IterableIterator<FileCoverage> {
        function* iterate<T, R>(iterable: Iterable<T>, transform: (a:T) => R): IterableIterator<R> {
            for (const e of iterable) {
                yield transform(e);
            }
        }
        return iterate(this._coveredLinesByFile.entries(), ([file, lines]) => {
            return {
                sourceFile: file,
                coveredLines: lines}
        });
    }

}

export class DataStorage implements IDataStorage {

    private readonly _coverageByProject: Map<string, ProjectCoverage>;

    constructor() {
        this._coverageByProject = new Map<string, ProjectCoverage>();
    }

    public putCoverage(project: string, sourceFilePath: string, coveredOriginalLines: number[]): void {
        const uniformPath = this.makeUniformPath(sourceFilePath);
        let projectCoverage: ProjectCoverage|undefined = this._coverageByProject.get(project);
        if (!projectCoverage) {
            projectCoverage = new ProjectCoverage(project);
            this._coverageByProject.set(project, projectCoverage);
        }
        coveredOriginalLines.forEach((line) => projectCoverage?.putLine(sourceFilePath, line));
        console.log(`Mapped Coverage: ${project} ${uniformPath} ${coveredOriginalLines}`);
    }

    private makeUniformPath(path: string): string {
        return path.replace("\\", "/");
    }

    signalUnmappedCoverage(): void {
        //
    }

    getCoverageBySourceFile(project: string): IterableIterator<FileCoverage> | undefined {
        const projectCoverage = this._coverageByProject.get(project);
        if (!projectCoverage) {
            return;
        }
        return projectCoverage.getCoverage();
    }

    private toSimpleCoverage(): string {
        const result: string[] = [];
        Contract.require(this.getProjects().length < 2, "Only one project supported to be handled in parallel.");

        for (const project of this.getProjects()) {
            const projectCoverage = this.getCoverageBySourceFile(project);
            if (!projectCoverage) {
                return "";
            }

            for (const entry of projectCoverage) {
                result.push(entry.sourceFile);
                for (const lineNo of entry.coveredLines) {
                    result.push("" + lineNo);
                }
            }
        }

        return result.join("\n");
    }


    public writeToSimpleCoverageFile(filePath: string): void {
        const content = this.toSimpleCoverage();
        fs.writeFileSync(filePath, content, 'utf8');
    }

    getProjects(): string[] {
        return Array.from(this._coverageByProject.keys());
    }


}