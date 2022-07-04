import WebSocket from 'ws';
import { ProtocolMessageTypes } from '../src/receiver/CollectingServer';
import axios from 'axios';
import { file } from 'tmp';

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

export async function postSourceMap(socket: WebSocket, fileId: string, sourceMap: any) {
	socket.send(`${ProtocolMessageTypes.TYPE_SOURCEMAP} ${fileId}:${JSON.stringify(sourceMap)}`);
}

export async function requestProjectSwitch(controlServerUrl: string, targetProjectId: string) {
	await axios.post(`${controlServerUrl}/project`, targetProjectId, {
		headers: {
			'Content-Length': `${targetProjectId.length}`,
			'Content-Type': 'text/plain'
		},
		responseType: 'text'
	});
}

export async function requestCoverageDump(controlServerUrl: string) {
	const result = await axios.post(`${controlServerUrl}/dump`);
	if (result.status !== 200) {
		throw new Error(`Request failed with code ${result.status} and message "${result.statusText}"`);
	}
}
