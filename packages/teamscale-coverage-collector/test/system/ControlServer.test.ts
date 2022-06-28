import { App } from '../../src/App';
import { getLocal } from 'mockttp';
import DoneCallback = jest.DoneCallback;
import { postCoverage, requestCoverageDump, requestProjectSwitch } from '../CollectorClient';

const TEAMSCALE_MOCK_PORT = 11234;

const CONTROL_URL = 'http://localhost:7777';

describe('Test the control server that is integrated in the collector', () => {
	const teamscaleServerMock = getLocal({});
	let collectorState: { stop: () => void };

	beforeEach(function (done: DoneCallback) {
		// Start the Teamscale mock serer
		teamscaleServerMock.start(TEAMSCALE_MOCK_PORT);

		// Start the collector
		collectorState = App.runWithConfig({
			dump_to_folder: 'coverage',
			keep_coverage_files: true,
			enable_control_port: 7777,
			dump_after_mins: 1,
			teamscale_access_token: 'DummyAccessToken',
			teamscale_user: 'Bert',
			json_log: false,
			log_level: 'INFO',
			log_to_file: 'logs/test.log',
			port: 1234,
			teamscale_server_url: `http://localhost:${TEAMSCALE_MOCK_PORT}`
		});

		done();
	});

	afterEach(function (done: DoneCallback) {
		// Stop the mock server
		teamscaleServerMock.stop();

		// Stop the collector
		collectorState.stop();

		done();
	});

	it('Request dumping project coverage to a Teamscale server', async () => {
		const projectId = 'dummyProjectId';
		await requestProjectSwitch(CONTROL_URL, projectId);
		const mockedEndpoint = await teamscaleServerMock
			.forPost(`api/projects/${projectId}/external-analysis/session/auto-create/report`)
			.thenReply(200, 'Mocked response');
		await postCoverage('ws://localhost:1234', 'dummyFileId', 1, 2, 3, 4);
		await requestCoverageDump(CONTROL_URL);
		expect(await mockedEndpoint.getSeenRequests()).toHaveLength(1);
	});
});
