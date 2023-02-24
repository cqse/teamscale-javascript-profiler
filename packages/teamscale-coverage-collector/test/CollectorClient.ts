import WebSocket from 'ws';
import { ProtocolMessageTypes } from '../src/receiver/CollectingServer';
import axios from 'axios';

/** Allows controlling a running collector via its API. */
export class CollectorClient {

	/** Sends the given coverage to the collector via the given websocket. */
	static async postCoverage(
		socket: WebSocket,
		fileId: string,
		startLine: number,
		startColumn: number,
		endLine: number,
		endColumn: number
	) {
		await (async () => socket.send(`${ProtocolMessageTypes.TYPE_COVERAGE} ${fileId} ${startLine}:${startColumn}:${endLine}:${endColumn}`, {
			binary: false
		}))();
	}

	/** Opens a websocket to the collector. */
	static async openSocket(collectorUrl: string): Promise<WebSocket> {
		const socket = new WebSocket(`${collectorUrl}/socket`, {
			perMessageDeflate: false
		});

		return new Promise((resolve, reject) => {
			socket.on('open', () => {
				resolve(socket);
			});
			socket.on('error', err => {
				reject(err);
			});
		});
	}

	/** Sends the given source map of the file with the given ID to the given websocket. */
	static async postSourceMap(socket: WebSocket, fileId: string, sourceMap: any) {
		await (async () => socket.send(`${ProtocolMessageTypes.TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(sourceMap)}`, {binary: false}))();
	}

	/** Sends a request to the collector to change the message used for the Teamscale upload. */
	static async requestMessageChange(controlServerUrl: string, targetMessage: string) {
		await CollectorClient.sendPut(`${controlServerUrl}/message`, targetMessage);
	}

	private static async sendPut(url: string, textBody: string) {
		await axios.put(url, textBody, {
			headers: {
				'Content-Length': `${textBody.length}`,
				'Content-Type': 'text/plain'
			},
			responseType: 'text'
		});
	}

	/** Sends a request to the collector to change the commit used for the Teamscale upload. */
	static async requestCommitChange(controlServerUrl: string, targetCommit: string) {
		await CollectorClient.sendPut(`${controlServerUrl}/commit`, targetCommit);
	}

	/** Sends a request to the collector to change the revision used for the Teamscale upload. */
	static async requestRevisionChange(controlServerUrl: string, targetRevision: string) {
		await CollectorClient.sendPut(`${controlServerUrl}/revision`, targetRevision);
	}

	/** Sends a request to the collector to change the partition used for the Teamscale upload. */
	static async requestPartitionChange(controlServerUrl: string, targetPartition: string) {
		await CollectorClient.sendPut(`${controlServerUrl}/partition`, targetPartition);
	}

	/** Sends a request to the collector to change the project ID used for the Teamscale upload. */
	static async requestProjectSwitch(controlServerUrl: string, targetProjectId: string) {
		await CollectorClient.sendPut(`${controlServerUrl}/project`, targetProjectId);
	}

	/** Sends a request to the collector to perform a coverage dump. */
	static async requestCoverageDump(controlServerUrl: string) {
		const result = await axios.post(`${controlServerUrl}/dump`);
		if (result.status !== 200) {
			throw new Error(`Request failed with code ${result.status} and message "${result.statusText}"`);
		}
	}

}
