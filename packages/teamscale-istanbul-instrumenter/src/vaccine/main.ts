// @ts-ignore
import DataWorker from 'web-worker:./worker/main.ts';
import {makeProxy} from "./Interceptor";
import * as unload from "unload";
import {getWindow, universe, hasWindow} from "./utils";

declare const __coverage__: any;

universe().makeCoverageInterceptor = function(coverage: any, target: any, path: any) {

    // @ts-ignore
    universe()._$Bc = function (coveredLine: string, coveredColumn: string) {

        // TODO: Do not send lines that have already been sent to reduce the network load

        // if (!seen.has(coveredLine + ':' + coveredColumn)) {
        worker.postMessage(coveredLine + ":" + coveredColumn);
        // seen.add(coveredLine + ':' + coveredColumn);
        // }
    };

    if (!universe()._$BcWorker) {
        // Create the worker with the worker code
        const worker = new DataWorker();
        universe()._$BcWorker = worker;

        (function sendSourceMaps() {
            // Send the source maps (for each of the files described in the coverage map?)
            // Optimization: The source map for a particular file might have already been sent.
            for (const entry of Object.values(__coverage__)) {
                const entryAny: any = entry;
                const sourceMap = entryAny.inputSourceMap;
                worker.postMessage("s" + JSON.stringify(sourceMap));
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

// const seen = new Set<string>();

