// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: DataWorker import is handled by Esbuild---see `esbuild.mjs` and `workers.d.ts`
import DataWorker from './worker/vaccine.worker.ts';
import { makeProxy } from './Interceptor';
import * as unload from 'unload';
import { getWindow, universe, hasWindow, universeAttribute } from './utils';
import { ProtocolMessageTypes } from './protocol';
import { IstanbulCoverageStore } from './types';
import { FlushingBuffer } from './FlushingBuffer';

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

/**
 * Get the buffer of coverage information to be sent.
 */
function getCoverageMessageBuffer(): FlushingBuffer {
	return globalAgentObject._$CoverageMsgBuffer as FlushingBuffer;
}

/**
 * Get the buffer of coverage information to be sent.
 */
function setCoverageMessageBuffer(buffer: FlushingBuffer): void {
	globalAgentObject._$CoverageMsgBuffer = buffer;
}

const interceptedStores: Set<string> = new Set<string>();

/**
 * The function that intercepts changes to the Istanbul code coverage.
 * Also, the Web worker to forward the coverage information is started.
 */
universe().makeCoverageInterceptor = function (coverage: IstanbulCoverageStore) {
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

	// Create the worker or get a reference to it
	let worker: DataWorker = getWorker();
	const isFirstTimeInit = !worker;
	if (isFirstTimeInit) {
		// Create the worker with the worker code
		// (we use the tool 'rollup' to produce this object---see rollup.config.js)
		worker = setWorker(new DataWorker());
	} else {
		worker = getWorker();
	}

	// Create the window-side buffer for coverage messages
	let coverageMessageBuffer: FlushingBuffer = getCoverageMessageBuffer();
	if (!coverageMessageBuffer) {
		coverageMessageBuffer = new FlushingBuffer((buffer: string[]) => {
			worker.postMessage(buffer.join('\n'));
		});
		setCoverageMessageBuffer(coverageMessageBuffer);
	}

	if (isFirstTimeInit) {
		// Register to page unload events to make sure that coverage
		// is sent before the page closes.
		(function handleUnloading() {
			const protectWindowEvent = function (name: 'onunload' | 'onbeforeunload') {
				// Save the existing handler, wrap it in our handler
				let wrappedHandler = (getWindow() as Window)[name];

				getWindow()[name] = function (...args) {
					// Ask the worker to send all remaining coverage infos
					worker.postMessage(ProtocolMessageTypes.FLUSH_REQUEST);
					if (wrappedHandler) {
						return wrappedHandler.apply(this, args);
					}
				};

				// Define a proxy that prevents overwriting
				if (hasWindow()) {
					Object.defineProperty(getWindow(), name, {
						get: function () {
							return wrappedHandler;
						},
						set: function (newHandler: never) {
							wrappedHandler = newHandler;
						}
					});
				}
			};

			protectWindowEvent('onunload');
			protectWindowEvent('onbeforeunload');

			unload.add(() => coverageMessageBuffer.flushAndStop);
			unload.add(() => worker.postMessage(ProtocolMessageTypes.FLUSH_REQUEST));
		})();
	}

	(function sendSourceMapsAndCoverageObject() {
		// Send the coverage object
		getWorker().postMessage(`${ProtocolMessageTypes.ISTANBUL_COV_OBJECT} ${JSON.stringify(coverage)}`);

		// Send the source maps
		const sentMaps = universeAttribute('sentMaps', new Set());
		if (coverage.inputSourceMap) {
			if (!sentMaps.has(coverage.path)) {
				getWorker().postMessage(
					`${ProtocolMessageTypes.MESSAGE_TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(
						coverage.inputSourceMap
					)}`
				);
				sentMaps.add(coverage.path);
			}
		}
	})();

	return makeProxy(
		getWorker(),
		message => {
			coverageMessageBuffer.pushMessage(message);
		},
		coverage.hash,
		coverage,
		[]
	);
};
