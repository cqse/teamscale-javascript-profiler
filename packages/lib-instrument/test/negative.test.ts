// @ts-nocheck
// @ts-ignore

import {create} from "./util/verifier";

describe('negative tests', () => {
    it('should barf on junk code', async () => {
        const v = await create('}', {quiet: true});
        const err = v.compileError();
        expect(err).toBeTruthy();
        expect(err.message.match(/Unexpected token/)).toBeTruthy();
    });

    it('should barf on mainline returns with no auto-wrap', async () => {
        const v = await create(
            'return 10;',
            {quiet: true},
            {autoWrap: false}
        );
        const err = v.compileError();
        expect(err).toBeTruthy();
        expect(err.message.match(/'return' outside/)).toBeTruthy();
    });
});
