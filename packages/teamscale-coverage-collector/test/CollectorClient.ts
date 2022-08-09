import WebSocket from 'ws';
import { ProtocolMessageTypes } from '../src/receiver/CollectingServer';
import axios from 'axios';

/** Sends a the given coverage to the collector via the given websocket. */
export async function postCoverage(
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
export function openSocket(collectorUrl: string): Promise<WebSocket> {
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
export async function postSourceMap(socket: WebSocket, fileId: string, sourceMap: any) {
	socket.send(`${ProtocolMessageTypes.TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(sourceMap)}`);
}

/** Sends a request to the collector to change the project ID used for the Teamscale upload. */
export async function requestProjectSwitch(controlServerUrl: string, targetProjectId: string) {
	await axios.post(`${controlServerUrl}/project`, targetProjectId, {
		headers: {
			'Content-Length': `${targetProjectId.length}`,
			'Content-Type': 'text/plain'
		},
		responseType: 'text'
	});
}

/** Sends a request to the collector to perform a coverage dump. */
export async function requestCoverageDump(controlServerUrl: string) {
	const result = await axios.post(`${controlServerUrl}/dump`);
	if (result.status !== 200) {
		throw new Error(`Request failed with code ${result.status} and message "${result.statusText}"`);
	}
}
