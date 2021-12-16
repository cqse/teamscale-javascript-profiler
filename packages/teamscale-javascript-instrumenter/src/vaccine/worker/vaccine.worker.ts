/**
 * This is the code of the WebWorker that forwards the coverage
 * information to the collector.
 */
import { CachingSocket } from './CachingSocket';
import { CoverageAggregator } from './CoverageAggregator';
import { ProtocolMessageTypes } from '../protocol';

console.log('Starting coverage forwarding worker.');

// Create the client socket.
// ATTENTION: Parts of the URLs, for example, $REPORT_TO_HOST,
// get replaced when injecting the code into the code to record coverage for.
const socket = new CachingSocket('ws://$REPORT_TO_HOST:$REPORT_TO_PORT/socket');
const aggregator = new CoverageAggregator(socket);

// Handling of the messages the WebWorker receives
onmessage = (event: MessageEvent) => {
	const message = event.data;
	if (message.startsWith(ProtocolMessageTypes.MESSAGE_TYPE_SOURCEMAP)) {
		socket.send(message);
	} else if (message === 'unload') {
		// Send all information immediately
		aggregator.flush();
	} else {
		// Coverage information
		aggregator.add(message);
	}
};
