import {CachingSocket} from './CachingSocket';
import {CoverageAggregator} from './CoverageAggregator';

const socket = new CachingSocket("ws://$REPORT_TO_HOST:$REPORT_TO_PORT/socket", `http://$REPORT_TO_HOST:$REPORT_TO_PORT`);
const aggregator = new CoverageAggregator(socket);

self.onmessage = (event: MessageEvent) => {
    const message = event.data;
    if (message.startsWith('s')) {
        socket.send(message)
    } else if (message === "unload") {
        aggregator.flush();
    } else {
        aggregator.add(message);
    }
};

