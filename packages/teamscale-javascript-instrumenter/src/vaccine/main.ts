// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: DataWorker import is handled by Esbuild---see `esbuild.mjs` and `workers.d.ts`
import DataWorker from './worker/vaccine.worker.ts';
import { getWindow, universe, universeAttribute } from './utils';
import { ProtocolMessageTypes } from './protocol';
import { IstanbulCoverageStore } from './types';
import {createCoverageBuffer, FileCoverageBuffer} from "./buffer";

// Prepare our global JavaScript object. This will hold
// a reference to the WebWorker thread.
const globalAgentObject: Record<string, unknown> = universeAttribute('__TS_AGENT', {});

/**
 * Get the WebWorker instance, if already initialized.
 */
function getWorker(): DataWorker {
	return globalAgentObject._$BcWorker;
}

/**
 * Set the WebWorker instance in the global object.
 */
function setWorker(worker: DataWorker): DataWorker {
	globalAgentObject._$BcWorker = worker;
	return worker;
}

// Create a coverage buffer on the main window side.
const coverageBuffer = createCoverageBuffer(250,(buffer: Map<string, FileCoverageBuffer>) => {
	for (const fileEntry of buffer.entries()) {
		getWorker().postMessage(fileEntry);
	}
});

// Sets the handler for signaling the coverage of a particular function.
universe()._$fnCov = function (fileId: string, functionId: number): void {};

// Signal the coverage of a particular statement.
universe()._$stmtCov = coverageBuffer.putStatementCoverage;

// Sets the handler for signaling the coverage of a particular branch.
universe()._$brCov = coverageBuffer.putBranchCoverage;

const interceptedStores: Set<string> = new Set<string>();

/**
 * The function that intercepts changes to the Istanbul code coverage.
 * Also, the Web worker to forward the coverage information is started.
 */
universe()._$registerCoverageObject = function (coverage: IstanbulCoverageStore): void {
	// The `fileId` is used to map coverage and source maps. Note that
	// a browser window (tab) can run multiple JavaScript files, with different source maps, ... .
	const fileId = coverage.hash;

	// Prevent adding the interceptor twice for the same file
	if (interceptedStores.has(fileId)) {
		console.log(`Coverage interceptor added twice for ${fileId}. This seems to be a bug in the instrumentation.`);
		return;
	} else {
		interceptedStores.add(fileId);
	}

	if (!getWorker()) {
		// Create the worker with the worker code
		// (we use the tool 'rollup' to produce this object---see rollup.config.js)
		const worker = setWorker(new DataWorker());

		(function handleUnloading() {
			const vaccineUnloadHandler = () => {
				coverageBuffer.flush();
				// Attention: the following 'unload' string does not correspond to the event name
				// but to the message that is handled by the worker.
				worker.postMessage('unload');
			};

			const addVaccineUnloadHandler = function (
				eventName: 'blur' | 'unload' | 'beforeunload' | 'visibilitychange', toObject: EventTarget | undefined) {
				if (!toObject) {
					return;
				}

				toObject.addEventListener(eventName, vaccineUnloadHandler, { capture: true });
			};

			const win = getWindow();
			addVaccineUnloadHandler('blur', win);
			addVaccineUnloadHandler('unload', win);
			addVaccineUnloadHandler('visibilitychange', win);
			addVaccineUnloadHandler('beforeunload', win);
		})();
	}

	(function sendSourceMapsAndCoverageObject() {
		// Send the coverage object
		getWorker().postMessage(`${ProtocolMessageTypes.ISTANBUL_COV_OBJECT} ${JSON.stringify(coverage)}`);

		// Send the source maps
		const sentMaps = universeAttribute('sentMaps', new Set());
		if (coverage.inputSourceMap) {
			if (!sentMaps.has(coverage.hash)) {
				getWorker().postMessage(
					`${ProtocolMessageTypes.MESSAGE_TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(
						coverage.inputSourceMap
					)}`
				);
				sentMaps.add(coverage.hash);
			}
		} else {
			console.error(`The coverage object of "${fileId} "does not include a valid 'inputSourceMap'.`);
		}
	})();
};
