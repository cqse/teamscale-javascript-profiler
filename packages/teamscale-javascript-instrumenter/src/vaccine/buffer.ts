/**
 * Coverage collected for a given file.
 */
export type FileCoverageBuffer = {
    /** Covered branches (in quartets of start line, start column, end line, end column) */
    branches: number[],

    /** Covered statements (in quartets of start line, start column, end line, end column)  */
    statements: number[],

    /** Covered functions (in quartets of start line, start column, end line, end column)  */
    functions: number[],

    /** Covered lines (in pairs: start line, end line) */
    lines: number[],
};

/**
 * Methods for collecting (buffering) and flushing coverage information.
 */
export interface CoverageBuffer {

    putFunctionCoverage(fileId: string, startLine: number, startCol: number, endLine: number, endCol: number): void;

    putStatementCoverage(fileId: string, startLine: number, startCol: number, endLine: number, endCol: number): void;

    putBranchCoverage(fileId: string, startLine: number, startCol: number, endLine: number, endCol: number): void;

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

        fileBuffer = { branches: [], statements: [], functions: [], lines: [] };
        buffer.set(fileId, fileBuffer);
        return fileBuffer;
    }

    function putStatementCoverage(fileId: string, startLine: number, startCol: number, endLine: number, endCol: number): void {
        getBufferFor(fileId).statements.push(startLine, startCol, endLine, endCol);
    }

    function putBranchCoverage(fileId: string, startLine: number, startCol: number, endLine: number, endCol: number): void {
        getBufferFor(fileId).branches.push(startLine, startCol, endLine, endCol);
    }

    function putFunctionCoverage(fileId: string, startLine: number, startCol: number, endLine: number, endCol: number): void {
        getBufferFor(fileId).functions.push(startLine, startCol, endLine, endCol);
    }

    function putLineCoverage(fileId: string, startLine: number, endLine: number): void {
        getBufferFor(fileId).lines.push(startLine, endLine);
    }

    function flush(): void {
        onFlush(buffer);

        buffer.clear();
    }

    setInterval(() => flush(), flushAfterMillis);

    return { putBranchCoverage, putStatementCoverage, putFunctionCoverage, putLineCoverage, flush };
}
