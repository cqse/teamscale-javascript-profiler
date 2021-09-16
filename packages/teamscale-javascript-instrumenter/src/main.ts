#!/usr/bin/env node

import { App } from './App';

// Run the instrumenter and print the results to the console.
App.run()
	.then(result => {
		console.log('Instrumentation finished.');
		console.log(`\tInstrumented: ${result.translated}`);
		console.log(`\tInstrumented from cache: ${result.translatedFromCache}`);
		console.log(`\tAlready instrumented: ${result.alreadyInstrumented}`);
		console.log(`\tUnsupported: ${result.unsupported}`);
		console.log(`\tWith warning: ${result.warnings}`);
		console.log(`\tFailed: ${result.failed}`);
	})
	.catch(reason => {
		console.log('Failed: ', reason);
	})
	.finally(() => {
		console.log('Bye bye.');
	});
