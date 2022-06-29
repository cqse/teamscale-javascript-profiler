import { App } from '../../src/App';
import { getLocal, MockedEndpoint } from 'mockttp';
import DoneCallback = jest.DoneCallback;
import { postCoverage, postSourceMap, requestCoverageDump, requestProjectSwitch } from '../CollectorClient';

const TEAMSCALE_MOCK_PORT = 11234;

const CONTROL_URL = 'http://localhost:7777';

describe('Test the control server that is integrated in the collector', () => {
	const teamscaleServerMock = getLocal({});
	let collectorState: { stop: () => void };

	beforeEach((done: DoneCallback) => {
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

	afterEach((done: DoneCallback) => {
		// Stop the mock server
		teamscaleServerMock.stop();

		// Stop the collector
		collectorState.stop();

		done();
	});

	it('Request dumping project coverage to a Teamscale server', (done: DoneCallback) => {
		const projectId = 'dummyProjectId';
		const sourceMap = {
			version: 3,
			file: 'main.js',
			sourceRoot: '',
			sources: ['../src/main.ts'],
			names: [],
			mappings:
				';AAKA;IAIE,qBAAY,IAAY,EAAE,EAAU;QAClC,IAAI,CAAC,IAAI,GAAG,IAAI,CAAC;QACjB,IAAI,CAAC,EAAE,GAAG,EAAE,CAAC;IACf,CAAC;IACH,kBAAC;AAAD,CAAC,AARD,IAQC;AAED,IAAM,IAAI,GAAS,IAAI,WAAW,CAAC,QAAQ,EAAE,CAAC,CAAC,CAAC'
		};
		let mockedEndpoint: MockedEndpoint;
		setImmediate(async () => {
			mockedEndpoint = await teamscaleServerMock
				.forPost(`api/projects/${projectId}/external-analysis/session/auto-create/report`)
				.thenReply(200, 'Mocked response');
			await requestProjectSwitch(CONTROL_URL, projectId);
			await postSourceMap('ws://localhost:1234', 'dummyFileId', sourceMap);
			await postCoverage('ws://localhost:1234', 'dummyFileId', 3, 2, 3, 15);
			await requestCoverageDump(CONTROL_URL);
			setTimeout(async () => {
				expect(await mockedEndpoint.getSeenRequests()).toHaveLength(1);
				done();
			}, 1000);
		});
	});
});
