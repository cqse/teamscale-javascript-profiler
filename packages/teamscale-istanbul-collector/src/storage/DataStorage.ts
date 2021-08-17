import { Contract } from '@cqse/common-qualities';
import * as fs from 'fs';
import { Logger } from 'winston';

/**
 * Lines covered for the specified file.
 */
export type FileCoverage = {
	/** Name of the file in the origin */
	sourceFile: string;

	/** Lines covered */
	coveredLines: Set<number>;
};

/**
 * Storage interface for reading information.
 */
export interface IReadableStorage {
	/**
	 * The list of projects the collector received coverage information for.
	 */
	getProjects(): string[];

	/**
	 * Retrieve the projects' coverage by source file.
	 */
	getCoverageBySourceFile(project: string): IterableIterator<FileCoverage> | undefined;

	/**
	 * Write the coverage to the specified file.
	 *
	 * @param filePath - Full path of the file to write the coverage to.
	 */
	writeToSimpleCoverageFile(filePath: string): void;
}

/**
 * Storage interface for writing information.
 */
export interface IWriteableStorage {
	/**
	 * Add coverage information to the storage.
	 *
	 * @param project - The project to add the information to.
	 * @param sourceFilePath - The file for that lines are covered.
	 * @param coveredOriginalLines - The covered lines.
	 */
	putCoverage(project: string, sourceFilePath: string, coveredOriginalLines: number[]): void;

	/**
	 * Signals that we have received coverage information
	 * for that no mapping based on sourcemaps was possible.
	 *
	 * @param project - The project to add the information to.
	 */
	signalUnmappedCoverage(project: string): void;
}

/**
 * Union of write and read interface.
 */
export interface IDataStorage extends IReadableStorage, IWriteableStorage {}

/**
 * The coverage information received for one particular project.
 */
export class ProjectCoverage {
	/**
	 * The identifier of the project.
	 */
	private readonly _projectId: string;

	/**
	 * The coverage.
	 */
	private readonly _coveredLinesByFile: Map<string, Set<number>>;

	/**
	 * Constructor.
	 *
	 * @param projectId - The identifier of the project to collect the coverage for.
	 */
	constructor(projectId: string) {
		this._projectId = Contract.requireDefined(projectId);
		this._coveredLinesByFile = new Map();
	}

	/**
	 * Put coverage for a single line to the storage.
	 *
	 * @param sourceFile - The file in that the line is covered.
	 * @param line - The line number.
	 */
	public putLine(sourceFile: string, line: number): void {
		let targetSet = this._coveredLinesByFile.get(sourceFile);
		if (!targetSet) {
			targetSet = new Set();
			this._coveredLinesByFile.set(sourceFile, targetSet);
		}
		targetSet.add(line);
	}

	/**
	 * Returns an iterator over the projects' coverage.
	 */
	public getCoverage(): IterableIterator<FileCoverage> {
		function* iterate<T, R>(iterable: Iterable<T>, transform: (a: T) => R): IterableIterator<R> {
			for (const e of iterable) {
				yield transform(e);
			}
		}
		return iterate(this._coveredLinesByFile.entries(), ([file, lines]) => {
			return {
				sourceFile: file,
				coveredLines: lines
			};
		});
	}
}

/**
 * The data storage which retrieves coverage information.
 */
export class DataStorage implements IDataStorage {
	/**
	 * Coverage information by project.
	 */
	private readonly _coverageByProject: Map<string, ProjectCoverage>;

	/**
	 * Logger to use.
	 */
	private readonly _logger: Logger;

	/**
	 * Constructs the data storage.
	 *
	 * @param logger - The logger to use.
	 */
	constructor(logger: Logger) {
		this._coverageByProject = new Map<string, ProjectCoverage>();
		this._logger = Contract.requireDefined(logger);
	}

	/**
	 * Put coverage into the storage.
	 *
	 * @param project - The project to add it to.
	 * @param sourceFilePath - The covered file.
	 * @param coveredOriginalLines - The lines covered in the file.
	 */
	public putCoverage(project: string, sourceFilePath: string, coveredOriginalLines: number[]): void {
		const uniformPath = this.normalizeSourceFileName(sourceFilePath);
		let projectCoverage: ProjectCoverage | undefined = this._coverageByProject.get(project);
		if (!projectCoverage) {
			projectCoverage = new ProjectCoverage(project);
			this._coverageByProject.set(project, projectCoverage);
		}
		coveredOriginalLines.forEach(line => projectCoverage?.putLine(sourceFilePath, line));

		this._logger.debug(`Mapped Coverage: ${project} ${uniformPath} ${coveredOriginalLines}`);
	}

	/**
	 * Normalize the source file names provided by the Web browsers / from the
	 * instrumentation such that they can be matched to the original source code by Teamscale.
	 *
	 * @param sourceFile - The file name to normalize, produced by the instrumenter.
	 */
	private normalizeSourceFileName(sourceFile: string): string {
		const removePrefix = (prefix: string, removeFrom: string): string => {
			if (removeFrom.startsWith(prefix)) {
				return removeFrom.substring(prefix.length);
			}
			return removeFrom;
		};
		return removePrefix('webpack:///', sourceFile.replace('\\', '/'));
	}

	/**
	 * {@inheritDoc IWriteableStorage.signalUnmappedCoverage}
	 */
	public signalUnmappedCoverage(project: string): void {
		// Currently not used.
	}

	/**
	 * {@inheritDoc IReadableStorage.getCoverageBySourceFile}
	 */
	public getCoverageBySourceFile(project: string): IterableIterator<FileCoverage> | undefined {
		const projectCoverage = this._coverageByProject.get(project);
		if (!projectCoverage) {
			return;
		}
		return projectCoverage.getCoverage();
	}

	/**
	 * {@inheritDoc IReadableStorage.writeToSimpleCoverageFile}
	 */
	public writeToSimpleCoverageFile(filePath: string): number {
		const toSimpleCoverage: () => [number, string] = () => {
			const result: string[] = [];
			Contract.require(this.getProjects().length < 2, 'Only one project supported to be handled in parallel.');

			for (const project of this.getProjects()) {
				const projectCoverage = this.getCoverageBySourceFile(project);
				if (!projectCoverage) {
					return [0, ''];
				}

				for (const entry of projectCoverage) {
					result.push(this.normalizeSourceFileName(entry.sourceFile));
					for (const lineNo of entry.coveredLines) {
						result.push('' + lineNo);
					}
				}
			}

			return [result.length, result.join('\n')];
		};

		const [lines, content] = toSimpleCoverage();
		fs.writeFileSync(filePath, content, 'utf8');
		return lines;
	}

	/**
	 * {@inheritDoc IReadableStorage.getProjects}
	 */
	getProjects(): string[] {
		return Array.from(this._coverageByProject.keys());
	}
}
