// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: DataWorker import
import DataWorker from './worker/vaccine.worker.ts';
import { InstanbulCoverageData, IstanbulCoverageStore, makeProxy } from './Interceptor';
import * as unload from 'unload';
import { getWindow, universe, hasWindow, universeAttribute } from './utils';
import { ProtocolMessageTypes } from './protocol';

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
 * The function that intercepts changes to the Istanbul code coverage.
 * Also the Web worker to forward the coverage information is started.
 */
universe().makeCoverageInterceptor = function (coverage: IstanbulCoverageStore) {
	// The `fileId` is used to map coverage and source maps. Note that
	// a browser window (tab) can run multiple JavaScript files, with different source maps, ... .
	const fileId = coverage.hash;

	if (!getWorker()) {
		// Create the worker with the worker code
		// (we use the tool 'rollup' to produce this object---see rollup.config.js)
		const worker = setWorker(new DataWorker());

		(function handleUnloading() {
			const protectWindowEvent = function (name: 'onunload' | 'onbeforeunload') {
				// Save the existing handler, wrap it in our handler
				let wrappedHandler = (getWindow() as Window)[name];

				getWindow()[name] = function (...args) {
					// Ask the worker to send all remaining coverage infos
					worker.postMessage('unload'); // The string "unload" is by accident the same as the window event
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

			unload.add(() => worker.postMessage('unload'));
		})();
	}

	(function sendSourceMaps() {
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

	(function registerCoverageReporter() {
		const reported = new Set<string>();
		universe()._$Bc = (fileId: string, startLine: number, startColumn: number, endLine: number, endColumn: number) => {
			// Do not send lines that have already been sent to reduce the network load
			const coverageMessage = `${fileId}:${startLine}:${startColumn}:${endLine}:${endColumn}`;
			if (!reported.has(coverageMessage)) {
				getWorker().postMessage(coverageMessage);
				reported.add(coverageMessage);
			}
		};
	})();

	return makeProxy(coverage, coverage, []);
};
