// @ts-ignore
import DataWorker from 'web-worker:./worker/main.ts';

declare const __coverage__: any;


// @ts-ignore
window._$Bc = function (coveredLine: string, coveredColumn: string) {

    // TODO: Do not send lines that have already been sent to reduce the network load

    // if (!seen.has(coveredLine + ':' + coveredColumn)) {
    worker.postMessage(coveredLine + ":" + coveredColumn);
    // seen.add(coveredLine + ':' + coveredColumn);
    // }
};

const windowAny = window as any;
if (!windowAny._$BcWorker) {
    // Create the worker with the worker code
    const worker = new DataWorker();
    windowAny._$BcWorker = worker;

    // Send the source maps (for each of the files described in the coverage map?)
    // Optimization: The source map for a particular might have already been sent.
    for (const entry of Object.values(__coverage__)) {
        const entryAny: any = entry;
        const sourceMap = entryAny.inputSourceMap;
        worker.postMessage("s" + JSON.stringify(sourceMap));
    }

    const wrapWindowEvent = function (name: string) {
        // Save the existing handler, wrap it in our handler
        let wrappedHandler = windowAny[name];

        windowAny[name] = function () {
            // Ask the worker to send all remaining coverage infos
            worker.postMessage("unload"); // The string "unload" is by accident the same as the window event
            if (wrappedHandler) {
                return wrappedHandler.apply(this, arguments);
            }
        };

        Object.defineProperty(window, name, {
            get: function () {
                return wrappedHandler;
            },
            set: function (newHandler: any) {
                wrappedHandler = newHandler;
            },
        });
    };

    // Register for the different window events
    wrapWindowEvent("onunload");
    wrapWindowEvent("onbeforeunload");

    window.addEventListener("unload", () => worker.postMessage("unload"));
    window.addEventListener("beforeunload", () => worker.postMessage("unload"));
}

const worker = windowAny._$BcWorker;

// const seen = new Set<string>();

