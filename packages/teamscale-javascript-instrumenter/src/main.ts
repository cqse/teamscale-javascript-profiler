#!/usr/bin/env node

import { App } from './App';

// Run the instrumenter and print the results to the console.
App.run()
	.then(result => {
		console.log('Instrumentation finished.');
		console.log(`\tInstrumented: ${result.translated}`);
		console.log(`\tExcluded: ${result.excluded}`);
		console.log(`\tInstrumented from cache: ${result.translatedFromCache}`);
		console.log(`\tAlready instrumented: ${result.alreadyInstrumented}`);
		console.log(`\tUnsupported: ${result.unsupported}`);
		console.log(`\tWith warning: ${result.warnings}`);
		console.log(`\tFailed: ${result.failed}`);

		const originMatching = result.task?.originSourcePattern.retrieveMatchingFiles();
		if (originMatching) {
			console.log(`\tSource origin matches`);
			console.log(`\t\tInclude patterns: [${originMatching.includePatterns}]`);
			console.log(`\t\tExclude patterns: [${originMatching.excludeMatches}]`);
			console.log(`\t\tInclude matches: ${originMatching.includeMatches.length}`);
			console.log(`\t\tExclude matches: ${originMatching.excludeMatches.length}`);
			console.log(`\t\tNeither matches: ${originMatching.neitherExcludedNorIncluded.length}`);
		}

	})
	.catch(reason => {
		console.log('Failed: ', reason);
	})
	.finally(() => {
		console.log('Bye bye.');
	});
