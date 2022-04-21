import Logger from 'bunyan';
import 'dotenv/config';
import { WriteStream } from 'fs';

export class PrettyFileLogger {
	fileOutputStream: WriteStream;

	constructor(outputStream: WriteStream) {
		this.fileOutputStream = outputStream;
	}

	public write(rec: Record<any, any>): void {
		this.fileOutputStream.write(
			`[${rec.time.toISOString()}] ${Logger.nameFromLevel[rec.level].toUpperCase()}: ${rec.msg}\n`
		);
	}

	public end(): void {
		this.fileOutputStream.close();
	}
}
