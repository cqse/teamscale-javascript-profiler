// @ts-ignore
import DataWorker from 'web-worker:./worker/main.ts';
import { makeProxy } from './Interceptor';
import * as unload from 'unload';
import { getWindow, universe, hasWindow, universeAttribute } from './utils';
import { ProtocolMessageTypes } from './protocol';

// Bringing the global __coverage__ object with type information
// into the scope.
declare const __coverage__: any;

// Prepare our global JavaScript object. This will hold
// a reference to the WebWorker thread.
const globalAgentObject: any = universeAttribute('__TS_AGENT', {});

/**
 * Get the WebWorker instance, if already initialized.
 */
function getWorker() {
	return globalAgentObject._$BcWorker;
}

/**
 * Set the WebWorker instance in the global object.
 */
function setWorker(worker: any): any {
	globalAgentObject._$BcWorker = worker;
	return worker;
}

/**
 * The function that intercepts changes to the Istanbul code coverage.
 * Also the Web worker to forward the coverage information is started.
 */
universe().makeCoverageInterceptor = function (coverage: any, target: any, path: any) {
	// The `fileId` is used to map coverage and source maps. Note that
	// a browser window (tab) can run multiple JavaScript files, with different source maps, ... .
	const fileId = coverage.hash;

	if (!getWorker()) {
		// Create the worker with the worker code
		// (we use the tool 'rollup' to produce this object---see rollup.config.js)
		const worker = setWorker(new DataWorker());

		(function handleUnloading() {
			const protectWindowEvent = function (name: string) {
				// Save the existing handler, wrap it in our handler
				let wrappedHandler = getWindow()[name];

				getWindow()[name] = function () {
					// Ask the worker to send all remaining coverage infos
					worker.postMessage('unload'); // The string "unload" is by accident the same as the window event
					if (wrappedHandler) {
						return wrappedHandler.apply(this, arguments);
					}
				};

				// Define a proxy that prevents overwriting
				if (hasWindow()) {
					Object.defineProperty(getWindow(), name, {
						get: function () {
							return wrappedHandler;
						},
						set: function (newHandler: any) {
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
		for (const key of Object.keys(__coverage__)) {
			const value: any = __coverage__[key];
			const sourceMap = value.inputSourceMap;
			if (!sentMaps.has(key)) {
				if (sourceMap) {
					getWorker().postMessage(
						`${ProtocolMessageTypes.MESSAGE_TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(sourceMap)}`
					);
					sentMaps.add(key);
				}
			}
		}
	})();

	// @ts-ignore
	(function registerCoverageReporter() {
		const reported = new Set<string>();
		universe()._$Bc = (fileId: string, coveredLine: number, coveredColumn: number) => {
			// Do not send lines that have already been sent to reduce the network load
			const coverageMessage = `${fileId}:${coveredLine}:${coveredColumn}`;
			if (!reported.has(coverageMessage)) {
				getWorker().postMessage(coverageMessage);
				reported.add(coverageMessage);
			}
		};
	})();

	return makeProxy(coverage, target, path);
};
