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

    const branchBufferRefs: Map<string, Map<number, number>> = new Map();

    const statementBufferRefs: Map<string, Set<number>> = new Map();

    function getBufferFor(fileId: string): FileCoverageBuffer {
        let fileBuffer = buffer.get(fileId);
        if (fileBuffer) {
            return fileBuffer;
        }

        fileBuffer = { branches: new Map(), statements: new Set() };
        buffer.set(fileId, fileBuffer);
        return fileBuffer;
    }

    function getBranchBufferFor(fileId: string): Map<number, number> {
        let result = branchBufferRefs.get(fileId);
        if (!result) {
            result = getBufferFor(fileId).branches;
            branchBufferRefs.set(fileId, result);
        }
        return result;
    }

    function getStatementBufferFor(fileId: string): Set<number> {
        let result = statementBufferRefs.get(fileId);
        if (!result) {
            result = getBufferFor(fileId).statements;
            statementBufferRefs.set(fileId, result);
        }
        return result;
    }

    function putBranchCoverage(fileId: string, branchId: number, locationId: number): void {
        getBranchBufferFor(fileId).set(branchId, locationId);
    }

    function putStatementCoverage(fileId: string, statementId: number): void {
        getStatementBufferFor(fileId).add(statementId);
    }

    function flush(): void {
        onFlush(buffer);

        buffer.clear();
        branchBufferRefs.clear();
        statementBufferRefs.clear();
    }

    setInterval(() => flush(), flushAfterMillis);

    return { putBranchCoverage, putStatementCoverage, flush };
}
