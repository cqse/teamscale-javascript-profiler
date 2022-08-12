import WebSocket from 'ws';
import { ProtocolMessageTypes } from '../src/receiver/CollectingServer';
import axios from 'axios';

export class CollectorClient {

	/** Sends a the given coverage to the collector via the given websocket. */
	static postCoverage(
		socket: WebSocket,
		fileId: string,
		startLine: number,
		startColumn: number,
		endLine: number,
		endColumn: number
	) {
		socket.send(`${ProtocolMessageTypes.TYPE_COVERAGE} ${fileId} ${startLine}:${startColumn}:${endLine}:${endColumn}`);
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
		socket.send(`${ProtocolMessageTypes.TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(sourceMap)}`);
	}

	/** Sends a request to the collector to change the message used for the Teamscale upload. */
	static async requestMessageChange(controlServerUrl: string, targetMessage: string) {
		await axios.put(`${controlServerUrl}/message`, targetMessage, {
			headers: {
				'Content-Length': `${targetMessage.length}`,
				'Content-Type': 'text/plain'
			},
			responseType: 'text'
		});
	}

	/** Sends a request to the collector to change the project ID used for the Teamscale upload. */
	static async requestCommitChange(controlServerUrl: string, targetProjectId: string) {
		await axios.put(`${controlServerUrl}/commit`, targetProjectId, {
			headers: {
				'Content-Length': `${targetProjectId.length}`,
				'Content-Type': 'text/plain'
			},
			responseType: 'text'
		});
	}

	/** Sends a request to the collector to change the revision used for the Teamscale upload. */
	static async requestRevisionChange(controlServerUrl: string, targetRevision: string) {
		await axios.put(`${controlServerUrl}/revision`, targetRevision, {
			headers: {
				'Content-Length': `${targetRevision.length}`,
				'Content-Type': 'text/plain'
			},
			responseType: 'text'
		});
	}

	/** Sends a request to the collector to change the partition used for the Teamscale upload. */
	static async requestPartitionChange(controlServerUrl: string, targetPartition: string) {
		await axios.put(`${controlServerUrl}/partition`, targetPartition, {
			headers: {
				'Content-Length': `${targetPartition.length}`,
				'Content-Type': 'text/plain'
			},
			responseType: 'text'
		});
	}

	/** Sends a request to the collector to change the project ID used for the Teamscale upload. */
	static async requestProjectSwitch(controlServerUrl: string, targetProjectId: string) {
		await axios.put(`${controlServerUrl}/project`, targetProjectId, {
			headers: {
				'Content-Length': `${targetProjectId.length}`,
				'Content-Type': 'text/plain'
			},
			responseType: 'text'
		});
	}

	/** Sends a request to the collector to perform a coverage dump. */
	static async requestCoverageDump(controlServerUrl: string) {
		const result = await axios.post(`${controlServerUrl}/dump`);
		if (result.status !== 200) {
			throw new Error(`Request failed with code ${result.status} and message "${result.statusText}"`);
		}
	}

}
