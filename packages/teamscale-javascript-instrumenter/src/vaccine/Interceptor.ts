import { BRANCH_COVERAGE_ID, IstanbulCoverageStore, STATEMENT_COVERAGE_ID } from './types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: DataWorker import
import DataWorker from './worker/vaccine.worker.ts';
import { ProtocolMessageTypes } from './protocol';

/**
 * Used to intercept updates to Istanbuls' coverage object.
 */
class Interceptor implements ProxyHandler<IstanbulCoverageStore> {
	/**
	 * Constructor.
	 */
	// eslint-disable-next-line no-useless-constructor
	constructor(private worker: DataWorker, private path: (symbol | string)[]) {}

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
		return makeProxy(this.worker, value, [...this.path, prop]);
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
			this.worker.postMessage(
				`${ProtocolMessageTypes.UNRESOLVED_CODE_ENTITY} ${STATEMENT_COVERAGE_ID} ${statementId}`
			);
		} else if (fullPath[0] === BRANCH_COVERAGE_ID) {
			// Handle "Branch" coverage.
			// This is important because often statements of the original code
			// are encoded into branch expressions as part of "Sequence Expressions".
			const branchId = fullPath[1] as string;
			const locationNo = Number.parseInt(fullPath[2] as string);

			this.worker.postMessage(
				`${ProtocolMessageTypes.UNRESOLVED_CODE_ENTITY} ${BRANCH_COVERAGE_ID} ${branchId} ${locationNo}`
			);
		}

		return true;
	}
}

/**
 * Constructs the actual interceptor/proxy that forwards changed coverage information.
 *
 * @param worker - The Web worker object that receives all the coverage and forwards it.
 * @param target - A sub-object of the object `coverage` to actually create the proxy for.
 * @param path - Notes the path to the sub-object the proxy is created for.
 */
export function makeProxy<T extends IstanbulCoverageStore>(
	worker: DataWorker,
	target: T,
	path: (symbol | string)[]
): T {
	return new Proxy(target, new Interceptor(worker, path));
}
