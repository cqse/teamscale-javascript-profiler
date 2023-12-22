import {Instrumenter, InstrumenterOptions} from './instrumenter';

export type {InstrumenterOptions} from './instrumenter';
export {programVisitor} from './visitor';

/**
 * Creates a new instrumenter with the supplied options.
 *
 * @param opts - instrumenter options.
 *      See the documentation for the Instrumenter class.
 */
export function createInstrumenter(opts: InstrumenterOptions): Instrumenter {
    return new Instrumenter(opts);
}
