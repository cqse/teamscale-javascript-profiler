// @ts-nocheck
// @ts-ignore

import {createInstrumenter, programVisitor} from "../src/index";

describe('external interface', () => {
    it('exposes the correct objects', () => {
        const i = createInstrumenter();
        expect(i).toBeTruthy();
        expect(i.instrument).toBeTruthy();
        const pc = programVisitor;
        expect(pc).toBeTruthy();
        expect(typeof pc).toEqual('function');
    });
});

describe('instrumenter', () => {
    it('should remove comments when asked to', async () => {
        const instrumenter = createInstrumenter({
            preserveComments: false
        });
        const instrumentedCode = await instrumenter.instrument(
            '/*foo*/\n//bar\ncode = true',
            'somefile.js'
        );
        expect(instrumentedCode.indexOf('foo')).toStrictEqual(-1);
        expect(instrumentedCode.indexOf('bar')).toStrictEqual(-1);
    }, 5000);
});
