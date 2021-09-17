import { universe } from './utils';

/**
 * The identifier of Istanbul coverage on the statement level.
 */
const STATEMENT_COVERAGE_ID = 's';

export type InstanbulCoverageData = {
	path: string;
	statementMap: Record<string, unknown>;
	inputSourceMap: unknown;
	hash: string;
};

export type IstanbulCoverageStore = {
	hash: string;
	statementMap: Record<string, { start: { line: number; column: number } }>;
} & Record<string, InstanbulCoverageData>;

type CoverageBroadcastFunction = (fileId: string, coveredLine: number, coveredColumn: number) => void;

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
		// Handle "Statement" coverage
		if (fullPath[0] === STATEMENT_COVERAGE_ID) {
			const fileId = this.coverageObj.hash;
			const start = this.coverageObj.statementMap[fullPath[1] as string].start;
			(universe()._$Bc as CoverageBroadcastFunction)(fileId, start.line, start.column);
		}
		return true;
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
