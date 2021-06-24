// @ts-ignore
import DataWorker from 'web-worker:./worker/main.ts';
import {makeProxy} from "./Interceptor";
import * as unload from "unload";
import {getWindow, universe, hasWindow} from "./utils";
import {MESSAGE_TYPE_SOURCEMAP} from "./protocol";

declare const __coverage__: any;

universe().makeCoverageInterceptor = function(coverage: any, target: any, path: any) {
    const fileId = coverage.hash;

    if (!universe()._$BcWorker) {
        // Create the worker with the worker code
        // (we use the tool 'rollup' to produce this object---see rollup.config.js)
        const worker = new DataWorker();
        universe()._$BcWorker = worker;

        (function handleUnloading() {
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
        })();

        (function sendSourceMaps() {
            // Send the source maps (for each of the files described in the coverage map?)
            // Optimization: The source map for a particular file might have already been sent.
            for (const key of Object.keys(__coverage__)) {
                const value: any = __coverage__[key];
                const sourceMap = value.inputSourceMap;
                if (sourceMap) {
                    worker.postMessage(`${MESSAGE_TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(sourceMap)}`);
                }
            }
        })();
    }

    const worker = universe()._$BcWorker;

    // @ts-ignore
    (function registerCoverageReporter() {
        const reported = new Set<string>();
        universe()._$Bc = function (fileId: string, coveredLine: number, coveredColumn: number) {
            // Do not send lines that have already been sent to reduce the network load
            const coverageMessage = `${fileId}:${coveredLine}:${coveredColumn}`;
            if (!reported.has(coverageMessage)) {
                worker.postMessage(coverageMessage);
                reported.add(coverageMessage);
            }
        };
    })();

    return makeProxy(coverage, target, path);
}
