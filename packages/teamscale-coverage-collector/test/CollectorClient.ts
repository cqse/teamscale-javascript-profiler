import WebSocket from 'ws';
import { ProtocolMessageTypes } from '../src/receiver/CollectingServer';
import axios from 'axios';

export async function postCoverage(
	collectorUrl: string,
	fileId: string,
	startLine: number,
	startColumn: number,
	endLine: number,
	endColumn: number
) {
	const ws = new WebSocket(`${collectorUrl}/socket`, {
		perMessageDeflate: false
	});

	ws.on('open', function open() {
		ws.send(`${ProtocolMessageTypes.TYPE_COVERAGE} ${fileId} ${startLine} ${startColumn} ${endLine} ${endColumn}`);
	});
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
	await axios.post(`${controlServerUrl}/dump`);
}
