import Logger from 'bunyan';
import 'dotenv/config';

/** Class for console logger. Doesn't print all information to ensure better readability. */
export class StdConsoleLogger {
	public write(rec: Record<any, any>): void {
		console.log(`[${rec.time.toISOString()}] ${Logger.nameFromLevel[rec.level].toUpperCase()}: ${rec.msg}`);
	}
}
