/**
 * This is the code of the WebWorker that forwards the coverage
 * information to the collector.
 */
import { CachingSocket } from './CachingSocket';
import { CoverageAggregator } from './CoverageAggregator';
import { ProtocolMessageTypes } from '../protocol';
import { BRANCH_COVERAGE_ID, IstanbulCoverageStore, STATEMENT_COVERAGE_ID } from '../types';

console.log('Starting coverage forwarding worker.');

// Create the client socket.
// ATTENTION: Parts of the URLs, for example, $REPORT_TO_URL,
// get replaced when injecting the code into the code to record coverage for.
const socket = new CachingSocket('$REPORT_TO_URL/socket');
const aggregator = new CoverageAggregator(socket);
let coverage: IstanbulCoverageStore | null;

// Handling of the messages the WebWorker receives
onmessage = (event: MessageEvent) => {
	const message: string = event.data;
	if (message.startsWith(ProtocolMessageTypes.MESSAGE_TYPE_SOURCEMAP)) {
		// Forward the source map to the collector
		socket.send(message);
	} else if (message.startsWith(ProtocolMessageTypes.ISTANBUL_COV_OBJECT)) {
		// Parse the Istanbul coverage object for usage in this Web worker
		coverage = JSON.parse(message.substring(2));
	} else if (message.startsWith(ProtocolMessageTypes.UNRESOLVED_CODE_ENTITY)) {
		// Handle the coverage of a code entity. The code range is looked up
		// using the Istanbul coverage object.
		handleUnresolvedCoveredEntity(message);
	} else if (message === 'unload') {
		// Send all information immediately
		aggregator.flush();
	} else {
		console.error(`No handler for message: ${message}`);
	}
};

/**
 * Handle the coverage of a code entity by mapping it to a code range
 * using the Istanbul code coverage object.
 *
 * @param message - The message to be processed.
 */
function handleUnresolvedCoveredEntity(message: string) {
	const messageParts: string[] = message.split(' ');
	if (messageParts.length < 3 || coverage === null) {
		return;
	}

	const coveredEntityType = messageParts[1];

	if (coveredEntityType === STATEMENT_COVERAGE_ID) {
		// Handle "Statement" coverage.
		const statementId = messageParts[2];
		const codeRange = coverage.statementMap[statementId];
		aggregator.addRange(coverage.hash, codeRange);
	} else if (coveredEntityType === BRANCH_COVERAGE_ID) {
		// Handle "Branch" coverage.
		// This is important because often statements of the original code
		// are encoded into branch expressions as part of "Sequence Expressions".
		const branchId = messageParts[2];
		const locationNo = Number.parseInt(messageParts[3]);
		const codeRange = coverage.branchMap[branchId].locations[locationNo];
		aggregator.addRange(coverage.hash, codeRange);
	}
}
