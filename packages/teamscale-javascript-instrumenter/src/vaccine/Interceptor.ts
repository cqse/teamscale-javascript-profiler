import { universe } from './utils';

/**
 * The identifier of Istanbul coverage on the statement level.
 */
const STATEMENT_COVERAGE_ID = 's';

/**
 * The identifier of Istanbul coverage on the branch level.
 */
const BRANCH_COVERAGE_ID = 'b';

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

type CoverageBroadcastFunction = (
	fileId: string,
	startLine: number,
	startColumn: number,
	endLine: number,
	endColumn: number
) => void;

/**
 * Used to intercept updates to Istanbuls' coverage object.
 */
class Interceptor implements ProxyHandler<IstanbulCoverageStore> {
	/**
	 * Constructor.
	 */
	// eslint-disable-next-line no-useless-constructor
	constructor(private coverageObj: IstanbulCoverageStore, private path: (symbol | string)[]) {}

	/**
	 * Intercept reading an objects' property.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public get(target: never, prop: string | symbol, receiver: never): unknown {
		const value = target[prop];
		if (value !== Object(value)) {
			// Extract the primitive value
			return value;
		}
		return makeProxy(this.coverageObj, value, [...this.path, prop]);
	}

	/**
	 * Intercept writing an objects' property.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public set(obj: never, prop: symbol | string, value: never): boolean {
		const fullPath = [...this.path, prop];

		if (fullPath[0] === STATEMENT_COVERAGE_ID) {
			// Handle "Statement" coverage.
			const statementId = fullPath[1] as string;
			const codeRange = this.coverageObj.statementMap[statementId];
			this.broadcastCodeRangeCoverage(codeRange);
		} else if (fullPath[0] === BRANCH_COVERAGE_ID) {
			// Handle "Branch" coverage.
			// This is important because often statements of the original code
			// are encoded into branch expressions as part of "Sequence Expressions".
			const branchId = fullPath[1] as string;
			const locationNo = Number.parseInt(fullPath[2] as string);
			const codeRange = this.coverageObj.branchMap[branchId].locations[locationNo];
			this.broadcastCodeRangeCoverage(codeRange);
		}

		return true;
	}

	private broadcastCodeRangeCoverage(range: CodeRange): void {
		const fileId = this.coverageObj.hash;
		(universe()._$Bc as CoverageBroadcastFunction)(
			fileId,
			range.start.line,
			range.start.column,
			range.end.line,
			range.end.column
		);
	}
}

/**
 * Constructs the actual interceptor/proxy that forwards changed coverage information.
 *
 * @param coverage - The coverage object to intercept.
 * @param target - A sub-object of the object `coverage` to actually create the proxy for.
 * @param path - Notes the path to the sub-object the proxy is created for.
 */
export function makeProxy<T extends IstanbulCoverageStore>(coverage: T, target: T, path: (symbol | string)[]): T {
	return new Proxy(target, new Interceptor(coverage, path));
}
