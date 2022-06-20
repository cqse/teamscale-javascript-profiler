/**
 * The identifier of Istanbul coverage on the statement level.
 */
export const STATEMENT_COVERAGE_ID = 's';

/**
 * The identifier of Istanbul coverage on the branch level.
 */
export const BRANCH_COVERAGE_ID = 'b';

/**
 * The range in a source file to consider.
 */
export type CodeRange = {
	start: { line: number; column: number };
	end: { line: number; column: number };
};

/**
 * The fraction of the IstanbulJS coverage object we are interested in.
 */
export type IstanbulCoverageStore = {
	hash: string;
	statementMap: Record<string, CodeRange>;
	branchMap: Record<string, { locations: CodeRange[] }>;
	path: string;
	inputSourceMap: unknown;
};

/**
 * A function for broadcasting coverage of a given code fragment.
 */
export type CoverageBroadcastFunction = (
	fileId: string,
	startLine: number,
	startColumn: number,
	endLine: number,
	endColumn: number
) => void;
