/**
 * Coverage collected for a given file.
 */
export type FileCoverageBuffer = {
    /** Covered lines */
    lines: Set<number>,
};

/**
 * Methods for collecting (buffering) and flushing coverage information.
 */
export interface CoverageBuffer {

    /** Post the given line coverage into the buffer. */
    putLineCoverage(fileId: string, startLine: number, endLine: number): void;

    /** Flush the coverage buffer. */
    flush(): void;
}

/**
 * Function to actually handle (flush) the buffered information.
 */
export type FlushFunction = (buffer: Map<string, FileCoverageBuffer>) => void;

/**
 * Creates a coverage buffer.
 */
export function createCoverageBuffer(flushAfterMillis: number, onFlush: FlushFunction): CoverageBuffer {

    const buffer: Map<string, FileCoverageBuffer> = new Map();

    function getBufferFor(fileId: string): FileCoverageBuffer {
        let fileBuffer = buffer.get(fileId);
        if (fileBuffer) {
            return fileBuffer;
        }

        fileBuffer = { lines: new Set(), };
        buffer.set(fileId, fileBuffer);
        return fileBuffer;
    }

    function putLineCoverage(fileId: string, startLine: number, endLine?: number): void {
        const bufferedLines = getBufferFor(fileId).lines;
        if (endLine) {
            for (let line=startLine; line<endLine; line++) {
                bufferedLines.add(line);
            }
        } else {
            bufferedLines.add(startLine);
        }

        if (bufferedLines.size > 1000) {
            flush();
        }
    }

    function flush(): void {
        onFlush(buffer);

        buffer.clear();
    }

    setInterval(() => flush(), flushAfterMillis);

    return { putLineCoverage, flush };
}
