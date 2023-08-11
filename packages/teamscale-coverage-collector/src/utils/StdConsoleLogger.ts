import Logger from 'bunyan';
import 'dotenv/config';

/** Class for console logger. Doesn't print all information to ensure better readability. */
export class StdConsoleLogger {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public write(rec: any): void {
		console.log(`[${rec.time.toISOString()}] ${Logger.nameFromLevel[rec.level].toUpperCase()}: ${rec.msg}`);
	}
}
