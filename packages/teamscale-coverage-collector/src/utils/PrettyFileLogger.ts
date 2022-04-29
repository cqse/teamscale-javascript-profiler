import Logger from 'bunyan';
import 'dotenv/config';
import { WriteStream } from 'fs';

/**
 * Class for log4j-like logger. Stream output shows less information than the
 * standard JSON format of the bunyan logger and therefore has better readability.
 */
export class PrettyFileLogger {
	outputStream: WriteStream;

	constructor(outputStream: WriteStream) {
		this.outputStream = outputStream;
	}

	public write(rec: Record<any, any>): void {
		this.outputStream.write(
			`[${rec.time.toISOString()}] ${Logger.nameFromLevel[rec.level].toUpperCase()}: ${rec.msg}\n`
		);
	}

	public end(): void {
		this.outputStream.close();
	}
}
