import {createHash} from 'crypto';

// ATTENTION: increment this version if there are schema changes
// that are not backwards compatible:
export const NAME = 'lib-instrument';
export const VERSION = '4';
export const SHA = 'sha1';
export const MAGIC_KEY = '_coverageSchema';
export const MAGIC_VALUE = createHash(SHA)
    .update(NAME + '@' + VERSION)
    .digest('hex');