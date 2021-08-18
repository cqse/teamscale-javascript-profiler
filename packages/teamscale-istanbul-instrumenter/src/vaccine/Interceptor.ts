import { universe } from './utils';

const STATEMENT_COVERAGE_ID = 's';

/**
 * Used to intercepts updates to Istanbuls' coverage object.
 */
class Interceptor implements ProxyHandler<any> {
	/**
	 * Constructor.
	 */
	constructor(private coverageObj: any, private path: any) {}

	/**
	 * Intercept reading an objects' property.
	 */
	public get(target: any, prop: any, receiver: any): any {
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
	public set(obj: any, prop: any, value: any): boolean {
		const fullPath = [...this.path, prop];
		// Handle "Statement" coverage
		if (fullPath[0] === STATEMENT_COVERAGE_ID) {
			const fileId = this.coverageObj.hash;
			const start = this.coverageObj.statementMap[fullPath[1]].start;
			universe()['_$Bc'](fileId, start.line, start.column);
		}
		return true;
	}
}

/**
 * Constructs the actual interceptor/proxy that forwards changed coverage information.
 *
 * See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy}.
 */
export function makeProxy(coverage: any, target: any, path: any) {
	return new Proxy(target, new Interceptor(coverage, path));
}
