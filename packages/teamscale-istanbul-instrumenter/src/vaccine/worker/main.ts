import {CachingSocket} from './CachingSocket';
import {CoverageAggregator} from './CoverageAggregator';
import {universe} from "../utils";

const socket = new CachingSocket("ws://$REPORT_TO_HOST:$REPORT_TO_PORT/socket", `http://$REPORT_TO_HOST:$REPORT_TO_PORT`);
const aggregator = new CoverageAggregator(socket);

universe.onmessage = (event: MessageEvent) => {
    const message = event.data;
    console.log(`Worker message: ${message}`);

    if (message.startsWith('s')) {
        socket.send(message)
    } else if (message === "unload") {
        aggregator.flush();
    } else {
        aggregator.add(message);
    }
};

