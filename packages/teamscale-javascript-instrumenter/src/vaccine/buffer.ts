/**
 * Coverage collected for a given file.
 */
export type FileCoverageBuffer = {
    /** Covered branches */
    branches: Map<number, number>,
    /** Covered statements */
    statements: Set<number>
};

/**
 * Methods for collecting (buffering) and flushing coverage information.
 */
export interface CoverageBuffer {
    /** Record a branch coverage. */
    putBranchCoverage(fileId: string, branchId: number, locationId: number): void;

    /** Record a statement coverage. */
    putStatementCoverage(fileId: string, statementId: number): void;

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

        fileBuffer = { branches: new Map(), statements: new Set() };
        buffer.set(fileId, fileBuffer);
        return fileBuffer;
    }

    function putBranchCoverage(fileId: string, branchId: number, locationId: number): void {
        getBufferFor(fileId).branches.set(branchId, locationId);
    }

    function putStatementCoverage(fileId: string, statementId: number): void {
        getBufferFor(fileId).statements.add(statementId);
    }

    function flush(): void {
        onFlush(buffer);

        buffer.clear();
    }

    setInterval(() => flush(), flushAfterMillis);

    return { putBranchCoverage, putStatementCoverage, flush };
}
