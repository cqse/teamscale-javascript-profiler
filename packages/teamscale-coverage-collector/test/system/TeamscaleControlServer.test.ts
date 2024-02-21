import { App } from '../../src/App';
import { CollectorClient } from '../CollectorClient';
import { CONTROL_URL, postAndDumpCoverage } from './CommonControlServerTestUtils';
import { getLocal } from 'mockttp';
import {awaitUntil, callAndInterceptStdOutAndErr} from "../TestUtils";

const TEAMSCALE_MOCK_PORT = 11234;

describe('Test the control server that is integrated in the collector with uploading to Teamscale', () => {
	const teamscaleServerMock = getLocal({ debug: true });
	let collectorState: { stop: () => Promise<void> };

	beforeEach(async () => {
		// Start the Teamscale mock serer
		await teamscaleServerMock.start(TEAMSCALE_MOCK_PORT);

		// Start the collector
		collectorState = App.runWithConfig({
			dump_to_folder: 'coverage',
			keep_coverage_files: true,
			enable_control_port: 7777,
			dump_after_mins: 1,
			teamscale_access_token: 'DummyAccessToken',
			teamscale_project: 'p',
			teamscale_partition: 'part',
			teamscale_user: 'Bert',
			teamscale_message: 'originalmessage',
			json_log: false,
			log_level: 'INFO',
			log_to_file: 'logs/test.log',
			port: 1234,
			teamscale_server_url: `http://localhost:${TEAMSCALE_MOCK_PORT}`
		});
	});

	afterEach(async () => {
		// Stop the mock server
		await teamscaleServerMock.stop();

		// Stop the collector
		await collectorState.stop();
	});

	it('Change message and dump coverage', async () => {
		let mockedEndpoint = await teamscaleServerMock
			.forPost(`/api/projects/p/external-analysis/session/auto-create/report`)
			.withQuery({ format: 'SIMPLE' })
			.thenReply(200, 'Mocked response');
		await CollectorClient.requestMessageChange(CONTROL_URL, 'mymessage');
		await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
		expect(requests[0].url).toContain('message=mymessage');
	}, 20000);

	it('Change commit and dump coverage', async () => {
		let mockedEndpoint = await teamscaleServerMock
			.forPost(`/api/projects/p/external-analysis/session/auto-create/report`)
			.withQuery({ format: 'SIMPLE' })
			.thenReply(200, 'Mocked response');
		await CollectorClient.requestCommitChange(CONTROL_URL, 'master:123456789000');
		await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
		expect(requests[0].url).toContain('t=master%3A123456789000');
	}, 20000);

	it('Change revision and dump coverage', async () => {
		let mockedEndpoint = await teamscaleServerMock
			.forPost(`/api/projects/p/external-analysis/session/auto-create/report`)
			.withQuery({ format: 'SIMPLE' })
			.thenReply(200, 'Mocked response');
		await CollectorClient.requestRevisionChange(CONTROL_URL, 'rev123');
		await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
		expect(requests[0].url).toContain('revision=rev123');
	}, 20000);

	it('Change partition and dump coverage', async () => {
		let mockedEndpoint = await teamscaleServerMock
			.forPost(`/api/projects/p/external-analysis/session/auto-create/report`)
			.withQuery({ format: 'SIMPLE' })
			.thenReply(200, 'Mocked response');
		await CollectorClient.requestPartitionChange(CONTROL_URL, 'dummyPartition');
		await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
		expect(requests[0].url).toContain('partition=dummyPartition');
	}, 20000);

	it('Change project ID and dump coverage', async () => {
		const projectId = 'dummyProjectId';
		let mockedEndpoint = await teamscaleServerMock
			.forPost(`/api/projects/${projectId}/external-analysis/session/auto-create/report`)
			.withQuery({ format: 'SIMPLE' })
			.thenReply(200, 'Mocked response');
		await CollectorClient.requestProjectSwitch(CONTROL_URL, projectId);
		await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
	}, 20000);

	it('Produce proper information on upload failures', async () => {
		const projectId = 'dummyProjectId';
		let mockedEndpoint = await teamscaleServerMock
			.forPost(`/api/projects/${projectId}/external-analysis/session/auto-create/report`)
			.withQuery({ format: 'SIMPLE' })
			.thenReply(410, 'Mocked response');
		const errorMessages: string[] = [];
		const otherMessages: string[] = [];
		await callAndInterceptStdOutAndErr(async () => {
			await CollectorClient.requestProjectSwitch(CONTROL_URL, projectId);
			await postAndDumpCoverage();
		}, errorMessages, otherMessages);

		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
		expect(otherMessages
			.filter(message => message.includes("ERROR: "))
			.filter(message => message.includes("Request failed with status 410: Mocked response"))).toHaveLength(1);

	}, 20000);
});
