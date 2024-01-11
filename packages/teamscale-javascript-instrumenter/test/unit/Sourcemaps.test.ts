import * as istanbul from '@teamscale/lib-instrument';
import fs from 'fs';
import path from 'path';
import { loadInputSourceMap } from '../../src/instrumenter/Instrumenter';
import { Optional } from 'typescript-optional';
import { RawSourceMap } from 'source-map';

test('Test if the Istanbul Instrumentation updates the SourceMap infos', async () => {
	const inputFileName = 'mini-bundle-from-ts.js';
	// @ts-ignore
	const instrumenter = istanbul.createInstrumenter({
		produceSourceMap: 'inline'
	} as any);
	const bundleJsCode: string = fs.readFileSync(path.join(__dirname, 'inputs', inputFileName), {
		encoding: 'utf8',
		flag: 'r'
	});

	const bundleSourcemap: RawSourceMap | undefined = loadInputSourceMap(bundleJsCode, inputFileName, Optional.empty());

	expect(bundleSourcemap).not.toBeNull();

	const instrumentedSource = await instrumenter.instrument(bundleJsCode, inputFileName, bundleSourcemap as any);

	const instrumentedSourcemap: RawSourceMap | undefined = loadInputSourceMap(
		instrumentedSource,
		inputFileName + '.instrumented.js',
		Optional.empty()
	);

	expect(bundleSourcemap?.sources).toEqual(instrumentedSourcemap?.sources);
	expect(bundleSourcemap?.mappings).not.toEqual(instrumentedSourcemap?.mappings);
});
