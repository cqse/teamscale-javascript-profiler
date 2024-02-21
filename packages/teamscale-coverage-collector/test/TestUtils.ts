const stdoutWrite = process.stdout.write.bind(process.stdout);
const stderrWrite = process.stderr.write.bind(process.stderr);

/**
 * Intercept the console stdout/stderr for the given call.
 */
export async function callAndInterceptStdOutAndErr(interceptOutpusOf: () => Promise<void>,
                                                   errorTarget: string[], messageTarget: string[]): Promise<void> {
    process.stdout.write = (data) => {
        messageTarget.push(removeColorCodes(data as string));
        return stdoutWrite(data);
    };

    process.stderr.write = (data) => {
        errorTarget.push(removeColorCodes(data as string));
        return stderrWrite(data);
    };

    try {
        await interceptOutpusOf();
    } finally {
        process.stdout.write = stdoutWrite;
        process.stderr.write = stderrWrite;
    }
}

/**
 * Execute other async tasks until the given condition is satisfied, or we ran into a timeout.
 */
export function awaitUntil(check: () => boolean, timeoutMillis: number): Promise<void> {
    const pollIntervalMillis = 100; // Interval to wait between check attempts

    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();
        let timeoutId: NodeJS.Timeout | null = null;

        const attemptCheck = () => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId); // Clear previous timeout to avoid unnecessary polling
                timeoutId = null;
            }

            try {
                const result = check();
                if (result) {
                    resolve();
                } else if (Date.now() - startTime > timeoutMillis) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    timeoutId = setTimeout(attemptCheck, pollIntervalMillis);
                }
            } catch (error) {
                reject(error);
            }
        };

        // Initial call to start the polling process
        attemptCheck();
    });
}

/**
 * Remove color escape sequences from the given console/log output.
 */
function removeColorCodes(input: string): string {
    // ANSI escape codes start with ESC (Escape) followed by '[' character,
    // then followed by any number (and some other characters like ';') of
    // characters, ending with 'm'. This pattern will match most color codes.
    const ansiEscapeCodePattern = /\x1B\[[0-9;]*m/g;
    return input.replace(ansiEscapeCodePattern, '');
}
