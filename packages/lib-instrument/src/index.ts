import {Instrumenter, InstrumenterOptions} from './instrumenter';

export type {InstrumenterOptions} from './instrumenter';
export {programVisitor} from './visitor';

/**
 * Creates a new coverage instrumenter.
 *
 * @param opts - instrumenter options
 */
export function createInstrumenter(opts: InstrumenterOptions): Instrumenter {
    return new Instrumenter(opts);
}
