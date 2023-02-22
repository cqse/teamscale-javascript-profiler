/**
 * This is the code of the WebWorker that forwards the coverage
 * information to the collector.
 */
import { CachingSocket } from './CachingSocket';
import { CoverageAggregator } from './CoverageAggregator';
import { ProtocolMessageTypes } from '../protocol';
import { IstanbulCoverageStore } from '../types';

console.log('Starting coverage forwarding worker.');

type CoverageInfos = { branches: Map<number, number>, statements: Set<number> };

// Create the client socket.
// ATTENTION: Parts of the URLs, for example, $REPORT_TO_URL,
// get replaced when injecting the code into the code to record coverage for.
const socket = new CachingSocket('$REPORT_TO_URL/socket');
const aggregator = new CoverageAggregator(socket);
const coverage: Map<string, IstanbulCoverageStore> = new Map();

// Handling of the messages the WebWorker receives
onmessage = (event: MessageEvent) => {
	if (Array.isArray(event.data)) {
		// Handle the coverage of a code entity. The code range is looked up
		// using the Istanbul coverage object.
		handleUnresolvedCoveredEntity(event.data as [string, CoverageInfos]);
	} else {
		const message: string = event.data;
		if (message.startsWith(ProtocolMessageTypes.MESSAGE_TYPE_SOURCEMAP)) {
			// Forward the source map to the collector
			socket.send(message);
		} else if (message.startsWith(ProtocolMessageTypes.ISTANBUL_COV_OBJECT)) {
			// Parse the Istanbul coverage object for usage in this Web worker
			const fileCoverage = JSON.parse(message.substring(2));
			coverage.set(fileCoverage.hash, fileCoverage);
			console.info(`Received coverage mapping information for "${fileCoverage.hash}".`);
		} else if (message === 'unload') {
			// Send all information immediately
			aggregator.flush();
		} else {
			console.error(`No handler for message: ${message}`);
		}
	}
};

/**
 * Handle the coverage of a code entity by mapping it to a code range
 * using the Istanbul code coverage object.
 *
 * @param message - The message to be processed.
 */
function handleUnresolvedCoveredEntity(message: [string, CoverageInfos]) {
	const fileId = message[0];
	const newlyCovered = message[1];

	const fileCoverageInfos = coverage.get(fileId);
	if (!fileCoverageInfos) {
		console.log(`No coverage mapping information for ${fileId} available!`);
		return;
	}

	for (const [branchId, locationNo] of newlyCovered.branches.entries()) {
		// Handle "Branch" coverage.
		// This is important because often statements of the original code
		// are encoded into branch expressions as part of "Sequence Expressions".
		const codeRange = fileCoverageInfos.branchMap[branchId]?.locations[locationNo];
		if (codeRange) {
			aggregator.addRange(fileId, codeRange);
		}
	}

	for (const statementId of newlyCovered.statements) {
		// Handle "Statement" coverage.
		const codeRange = fileCoverageInfos.statementMap[statementId];
		if (codeRange) {
			aggregator.addRange(fileId, codeRange);
		}
	}
}
