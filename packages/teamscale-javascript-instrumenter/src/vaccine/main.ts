// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: DataWorker import is handled by Esbuild---see `esbuild.mjs` and `workers.d.ts`
import DataWorker from './worker/vaccine.worker.ts';
import { getWindow, universe, universeAttribute } from './utils';
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

// Sets the handler for signaling the coverage of a particular line.
universe()._$l = coverageBuffer.putLineCoverage;

/**
 * The Web worker to forward the coverage information is started.
 */
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