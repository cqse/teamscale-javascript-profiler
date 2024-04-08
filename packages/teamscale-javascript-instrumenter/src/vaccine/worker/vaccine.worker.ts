/**
 * This is the code of the WebWorker that forwards the coverage
 * information to the collector.
 */
import { SocketWithRecovery } from './SocketWithRecovery';
import { CoverageAggregator } from './CoverageAggregator';
import { CollectorSpecifier, LocationMessage } from "../types";
import { CollectorUrlResolver } from './CollectorUrlResolver';

console.log('Starting coverage forwarding worker.');

// ATTENTION: $COLLECTOR_SPECIFIER gets replaced with a JSON object when injecting the vaccine code
// into the code to record coverage for.
declare const $COLLECTOR_SPECIFIER: CollectorSpecifier

const socket = new SocketWithRecovery();
const aggregator = new CoverageAggregator(socket);

// Handling of the messages the WebWorker receives
onmessage = (event: MessageEvent) => {
	if (Array.isArray(event.data)) {
		// Handle the coverage of a code entity. The code range is looked up
		// using the Istanbul coverage object.
		const [fileName, lines] = event.data as [string, number[]];
		aggregator.addLines(fileName, lines);
	} else if (event.data === 'unload') {
		// Send all information immediately
		aggregator.flush();
	} else if (event.data.type === "location") {
		const locationMessage = event.data as LocationMessage;
		const url = CollectorUrlResolver.resolve($COLLECTOR_SPECIFIER, locationMessage.host, locationMessage.port)
		socket.connect(`${url}/socket`);
	} else {
		console.error(`No handler for message: ${event.data}`);
	}
};
