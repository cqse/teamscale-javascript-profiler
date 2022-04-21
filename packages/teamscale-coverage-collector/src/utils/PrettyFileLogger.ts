import Logger from "bunyan";
import 'dotenv/config';
import {WriteStream} from "fs";

export class PrettyFileLogger {

    fileOutputStream: WriteStream | null;

    constructor(outputStream: WriteStream | null) {
        this.fileOutputStream = outputStream;
    }

    public write(rec: Record<any, any>): void {
        if (this.fileOutputStream == null) {
            return;
        }
        this.fileOutputStream.write(`[${rec.time.toISOString()}] ${Logger.nameFromLevel[rec.level].toUpperCase()}: ${rec.msg}\n`);
    }

    public end(): void {
        if (this.fileOutputStream == null) {
            return;
        }
        this.fileOutputStream.close();
    }
}