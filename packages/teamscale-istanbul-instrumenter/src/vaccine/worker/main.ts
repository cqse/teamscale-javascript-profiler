import {CachingSocket} from './CachingSocket';
import {CoverageAggregator} from './CoverageAggregator';
import {ProtocolMessageTypes} from "../protocol";

console.log("Starting worker.");

const socket = new CachingSocket("ws://$REPORT_TO_HOST:$REPORT_TO_PORT/socket", `http://$REPORT_TO_HOST:$REPORT_TO_PORT`);
const aggregator = new CoverageAggregator(socket);

onmessage = (event: MessageEvent) => {
    const message = event.data;
    if (message.startsWith(ProtocolMessageTypes.MESSAGE_TYPE_SOURCEMAP)) {
        socket.send(message)
    } else if (message === "unload") {
        // Send all information immediately
        aggregator.flush();
    } else {
        // Coverage information
        aggregator.add(message);
    }
};
