import { App } from '../../src/App';
import { getLocal } from 'mockttp';

const TEAMSCALE_MOCK_PORT = 11234;

describe('Test the control server that is integrated in the collector', () => {
	const teamscaleServerMock = getLocal({});

	beforeEach(function (done) {
		// Start the Teamscale mock serer
		teamscaleServerMock.start(TEAMSCALE_MOCK_PORT);
	});

	afterEach(function (done) {
		// Stop the mock server
		teamscaleServerMock.stop();

		// Stop the collector
	});

	it('Foo', () => {
		App.runWithConfig({
			dump_to_folder: 'coverage',
			keep_coverage_files: true,
			dump_after_mins: 1,
			json_log: false,
			log_level: 'INFO',
			log_to_file: '',
			port: 1234,
			teamscale_server_url: `http://localhost:${TEAMSCALE_MOCK_PORT}`
		});
		console.log('The collector has been started');
	});
});
