import Logger from "bunyan";
import 'dotenv/config';

export class StdConsoleLogger {
    public write(rec: Record<any, any>): void {
        console.log(`[${rec.time.toISOString()}] ${Logger.nameFromLevel[rec.level].toUpperCase()}: ${rec.msg}`);
    }
}