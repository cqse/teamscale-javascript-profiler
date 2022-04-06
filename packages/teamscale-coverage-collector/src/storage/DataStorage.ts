import { Contract, removePrefix } from '@cqse/commons';
import * as fs from 'fs';
import Logger from "bunyan";

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
	dumpToSimpleCoverageFile(filePath: string): void;
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
	private readonly projectId: string;

	/**
	 * The coverage.
	 */
	private readonly coveredLinesByFile: Map<string, Set<number>>;

	/**
	 * Constructor.
	 *
	 * @param projectId - The identifier of the project to collect the coverage for.
	 */
	constructor(projectId: string) {
		this.projectId = Contract.requireDefined(projectId);
		this.coveredLinesByFile = new Map();
	}

	/**
	 * Put coverage for a single line to the storage.
	 *
	 * @param sourceFile - The file in that the line is covered.
	 * @param line - The line number.
	 */
	public putLine(sourceFile: string, line: number): void {
		let targetSet = this.coveredLinesByFile.get(sourceFile);
		if (!targetSet) {
			targetSet = new Set();
			this.coveredLinesByFile.set(sourceFile, targetSet);
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
		return iterate(this.coveredLinesByFile.entries(), ([file, lines]) => {
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
	private readonly coverageByProject: Map<string, ProjectCoverage>;

	/**
	 * Logger to use.
	 */
	private readonly logger: Logger;

	/**
	 * Times unmapped coverage received.
	 */
	private timesUnmappedCoverage: number;

	/**
	 * Constructs the data storage.
	 *
	 * @param logger - The logger to use.
	 */
	constructor(logger: Logger) {
		this.coverageByProject = new Map<string, ProjectCoverage>();
		this.logger = Contract.requireDefined(logger);
		this.timesUnmappedCoverage = 0;
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
		let projectCoverage: ProjectCoverage | undefined = this.coverageByProject.get(project);
		if (!projectCoverage) {
			projectCoverage = new ProjectCoverage(project);
			this.coverageByProject.set(project, projectCoverage);
		}
		coveredOriginalLines.forEach(line => projectCoverage?.putLine(sourceFilePath, line));

		this.logger.debug(`Mapped Coverage: ${project} ${uniformPath} ${coveredOriginalLines}`);
	}

	/**
	 * Normalize the source file names provided by the Web browsers / from the
	 * instrumentation such that they can be matched to the original source code by Teamscale.
	 *
	 * @param sourceFile - The file name to normalize, produced by the instrumenter.
	 */
	private normalizeSourceFileName(sourceFile: string): string {
		return removePrefix('webpack:///', sourceFile.replace('\\', '/'));
	}

	/**
	 * {@inheritDoc IWriteableStorage.signalUnmappedCoverage}
	 */
	public signalUnmappedCoverage(project: string): void {
		// Currently only implemented to log the missing information.
		this.timesUnmappedCoverage++;
		if (this.timesUnmappedCoverage === 1) {
			this.logger.debug(`Received unmapped coverage for project "${project}"`);
		}
	}

	/**
	 * {@inheritDoc IReadableStorage.getCoverageBySourceFile}
	 */
	public getCoverageBySourceFile(project: string): IterableIterator<FileCoverage> | undefined {
		const projectCoverage = this.coverageByProject.get(project);
		return projectCoverage?.getCoverage();
	}

	/**
	 * {@inheritDoc IReadableStorage.writeToSimpleCoverageFile}
	 */
	public dumpToSimpleCoverageFile(filePath: string): number {
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
						result.push(String(lineNo));
					}
				}
			}

			return [result.length, result.join('\n')];
		};

		const [lines, content] = toSimpleCoverage();
		fs.writeFileSync(filePath.trim(), content, { flag: 'w', encoding: 'utf8' });
		return lines;
	}

	/**
	 * {@inheritDoc IReadableStorage.getProjects}
	 */
	getProjects(): string[] {
		return Array.from(this.coverageByProject.keys());
	}
}
