import {Instrumenter} from './instrumenter';

export type {InstrumenterOptions} from './instrumenter';
export {programVisitor} from './visitor';
export {readInitialCoverage} from './read-coverage';

/**
 * Creates a new instrumenter with the supplied options.
 *
 * @param opts - instrumenter options.
 *      See the documentation for the Instrumenter class.
 */
export function createInstrumenter(opts: object): Instrumenter {
    return new Instrumenter(opts);
}