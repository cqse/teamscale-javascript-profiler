import { App } from '../../src/App';
import { getLocal } from 'mockttp';
import { CollectorClient } from '../CollectorClient';
import {CONTROL_URL, postAndDumpCoverage} from "./CommonControlServer.test";

const ARTIFACTORY_MOCK_PORT = 11235;

describe('Test the control server that is integrated in the collector with uploading to Artifactory', () => {
	const artifactoryServerMock = getLocal({ debug: true });
	let collectorState: { stop: () => Promise<void> };

	beforeEach(() => {
		// Start the Artifactory mock serer
		artifactoryServerMock.start(ARTIFACTORY_MOCK_PORT);

		// Start the collector
		collectorState = App.runWithConfig({
			dump_to_folder: 'coverage',
			keep_coverage_files: true,
			enable_control_port: 7777,
			dump_after_mins: 1,
			artifactory_access_token: 'DummyAccessToken',
			teamscale_partition: 'part',
			teamscale_commit: 'someBranch:someTime',
			json_log: false,
			log_level: 'INFO',
			log_to_file: 'logs/test.log',
			port: 1234,
			artifactory_server_url: `http://localhost:${ARTIFACTORY_MOCK_PORT}/some/prefix`
		});
	});

	afterEach(async () => {
		// Stop the mock server
		artifactoryServerMock.stop();

		// Stop the collector
		await collectorState.stop();
	});

	it('Dump coverage', async () => {
		let mockedEndpoint = await artifactoryServerMock
			.forPut(`/some/prefix/uploads/someBranch/someTime/part/simple/report.simple`)
			.withHeaders({"x-jfrog-art-api": "DummyAccessToken"})
			.thenReply(200, 'Mocked response');
    await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
	}, 10000);

	it('Change commit and dump coverage', async () => {
		let mockedEndpoint = await artifactoryServerMock
			.forPut(`/some/prefix/uploads/master/123456789000/part/simple/report.simple`)
			.withHeaders({"x-jfrog-art-api": "DummyAccessToken"})
			.thenReply(200, 'Mocked response');
		await CollectorClient.requestCommitChange(CONTROL_URL, 'master:123456789000');
    await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
	}, 10000);

	it('Change revision and dump coverage', async () => {
		let mockedEndpoint = await artifactoryServerMock
			.forPut(`/some/prefix/uploads/someBranch/someTime-rev123/part/simple/report.simple`)
			.withHeaders({"x-jfrog-art-api": "DummyAccessToken"})
			.thenReply(200, 'Mocked response');
		await CollectorClient.requestRevisionChange(CONTROL_URL, 'rev123');
    await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
	}, 10000);

	it('Change partiton and dump coverage', async () => {
		let mockedEndpoint = await artifactoryServerMock
			.forPut(`/some/prefix/uploads/someBranch/someTime/dummyPartition/simple/report.simple`)
			.withHeaders({"x-jfrog-art-api": "DummyAccessToken"})
			.thenReply(200, 'Mocked response');
		await CollectorClient.requestPartitionChange(CONTROL_URL, 'dummyPartition');
    await postAndDumpCoverage();
		const requests = await mockedEndpoint.getSeenRequests();
		expect(requests).toHaveLength(1);
	}, 10000);
});
