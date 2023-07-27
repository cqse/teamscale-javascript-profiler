import { determineSymbolMapsDir } from '../../src/instrumenter/WebToolkit';

test('Identification of GWT symbol map dirs', () => {
	const folders = determineSymbolMapsDir(
		'../../test/casestudies/gwt-showcase-js/war/showcase/deferredjs/28F63AD125178AAAB80993C11635D26F/5.cache.js'
	);
	expect(folders).toHaveLength(1);
	expect(folders[0].endsWith('test/casestudies/gwt-showcase-js/war/WEB-INF/deploy/showcase/symbolMaps')).toBeTruthy();
});

test('Extraction of file UIDs', () => {
	const folders = determineSymbolMapsDir(
		'../../test/casestudies/gwt-showcase-js/war/showcase/deferredjs/28F63AD125178AAAB80993C11635D26F/5.cache.js'
	);
	expect(folders).toHaveLength(1);
	expect(folders[0].endsWith('test/casestudies/gwt-showcase-js/war/WEB-INF/deploy/showcase/symbolMaps')).toBeTruthy();
});
