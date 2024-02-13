/**
 * This is the code of the WebWorker that forwards the coverage
 * information to the collector.
 */
import { SocketWithRecovery } from './SocketWithRecovery';
import { CoverageAggregator } from './CoverageAggregator';
import { CollectorSpecifier, CollectorSpecifierSubstitutionPattern, CoveredRanges } from "../types";

console.log('Starting coverage forwarding worker.');

// ATTENTION: $COLLECTOR_SPECIFIER gets replaced with a JSON object when injecting the vaccine code
// into the code to record coverage for.
declare const $COLLECTOR_SPECIFIER: CollectorSpecifier

function resolveCollectorUrl(): string {
	const specifier = $COLLECTOR_SPECIFIER;
	switch (specifier.type) {
		case 'url':
			return specifier.url;
		case 'substitutionPattern':
			return resolveSubstitutionPattern(specifier);
	}
}

function resolveSubstitutionPattern(specifier: CollectorSpecifierSubstitutionPattern): string {
	const host = location.host;
	console.debug(`Resolved hostname ${host}, applying substitution`)
	const newHost = host.replace(specifier.search, specifier.replace)
	const protocol = specifier.useWss ? "wss" : "ws";

	let portSection = ""
	if (specifier.port !== undefined) {
		portSection = `:${specifier.port}`
	}
	const url = `${protocol}://${newHost}${portSection}`
	console.debug(`Resolved collector URL ${url}`)
	return url
}

const socket = new SocketWithRecovery(`${resolveCollectorUrl()}/socket`);
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