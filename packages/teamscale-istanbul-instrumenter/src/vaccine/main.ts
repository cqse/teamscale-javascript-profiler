// @ts-ignore
import DataWorker from 'web-worker:./worker/main.ts';
import {makeProxy} from "./Interceptor";
import * as unload from "unload";
import {getWindow, universe, hasWindow} from "./utils";
import {MESSAGE_TYPE_SOURCEMAP} from "./protocol";

declare const __coverage__: any;

universe().makeCoverageInterceptor = function(coverage: any, target: any, path: any) {
    const reported = new Set<string>();

    // @ts-ignore
    universe()._$Bc = function (coveredLine: string, coveredColumn: string) {
        // Do not send lines that have already been sent to reduce the network load
        const coverageMessage = coveredLine + ":" + coveredColumn;
        if (!reported.has(coverageMessage)) {
            worker.postMessage(coverageMessage);
            reported.add(coverageMessage);
        }
    };

    if (!universe()._$BcWorker) {
        // Create the worker with the worker code
        // (we use the tool 'rollup' to produce this object---see rollup.config.js)
        const worker = new DataWorker();
        universe()._$BcWorker = worker;

        (function sendSourceMaps() {
            // Send the source maps (for each of the files described in the coverage map?)
            // Optimization: The source map for a particular file might have already been sent.
            for (const entry of Object.values(__coverage__)) {
                const entryAny: any = entry;
                const sourceMap = entryAny.inputSourceMap;
                if (sourceMap) {
                    worker.postMessage(MESSAGE_TYPE_SOURCEMAP + JSON.stringify(sourceMap));
                }
            }
        })();

        const protectWindowEvent = function (name: string) {
            // Save the existing handler, wrap it in our handler
            let wrappedHandler = universe()[name];

            universe()[name] = function () {
                // Ask the worker to send all remaining coverage infos
                worker.postMessage("unload"); // The string "unload" is by accident the same as the window event
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
                    },
                });
            }
        };

        protectWindowEvent("onunload");
        protectWindowEvent("onbeforeunload");

        unload.add(() => worker.postMessage("unload"));
    }

    const worker = universe()._$BcWorker;

    return makeProxy(coverage, target, path);
}
