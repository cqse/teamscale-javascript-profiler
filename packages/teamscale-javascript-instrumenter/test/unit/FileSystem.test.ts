import { findSubFolders } from '../../src/instrumenter/FileSystem';

test('Test identification of sub folders with GWT source maps', () => {
	const folders = findSubFolders('../../test/casestudies/gwt-showcase-js/', 'symbolMaps');
	expect(folders).toContain('../../test/casestudies/gwt-showcase-js/war/WEB-INF/deploy/showcase/symbolMaps');
});
