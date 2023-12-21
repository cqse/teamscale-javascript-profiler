/**
 * Information about code ranges covered.
 */
export type CoveredRanges = {
	/** Covered branches (in quartets of start line, start column, end line, end column) */
	branches: number[],

	/** Covered statements (in quartets of start line, start column, end line, end column)  */
	statements: number[],

	/** Covered functions (in quartets of start line, start column, end line, end column)  */
	functions: number[],

	/** Covered lines (in pairs: start line, end line) */
	lines: number[]
};