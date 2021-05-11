import {CachingSocket} from './CachingSocket';
import {CoverageAggregator} from './CoverageAggregator';

const socket = new CachingSocket("ws://localhost:8087/socket", `http://${location.host}:8087`);
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

