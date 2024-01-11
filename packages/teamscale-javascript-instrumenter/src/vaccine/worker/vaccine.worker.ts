/**
 * This is the code of the WebWorker that forwards the coverage
 * information to the collector.
 */
import { SocketWithRecovery } from './SocketWithRecovery';
import { CoverageAggregator } from './CoverageAggregator';
import {CoveredRanges} from "../types";

console.log('Starting coverage forwarding worker.');

// Create the client socket.
// ATTENTION: Parts of the URLs, for example, $REPORT_TO_URL,
// get replaced when injecting the code into the code to record coverage for.
const socket = new SocketWithRecovery('$REPORT_TO_URL/socket');
const aggregator = new CoverageAggregator(socket);

// Handling of the messages the WebWorker receives
onmessage = (event: MessageEvent) => {
	if (Array.isArray(event.data)) {
		// Handle the coverage of a code entity. The code range is looked up
		// using the Istanbul coverage object.
		const [fileName, ranges] = event.data as [string, CoveredRanges];
		aggregator.addRanges(fileName, ranges);
	} else if (event.data === 'unload') {
		// Send all information immediately
		aggregator.flush();
	} else {
		console.error(`No handler for message: ${event.data}`);
	}
};