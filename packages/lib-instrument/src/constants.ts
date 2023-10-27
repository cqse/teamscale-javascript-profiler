import {createHash} from 'crypto';

// ATTENTION: increment this version if there are schema changes
// that are not backwards compatible.

/** Name of the instrumentation library. */
export const NAME = 'lib-instrument';

/** Version of the instrumentation scheme. */
export const VERSION = '4';

/** SHA algorithm. */
export const SHA = 'sha1';
export const MAGIC_KEY = '_coverageSchema';
export const MAGIC_VALUE = createHash(SHA)
    .update(NAME + '@' + VERSION)
    .digest('hex');