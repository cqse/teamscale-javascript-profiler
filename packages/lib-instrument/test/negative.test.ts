// @ts-nocheck
// @ts-ignore

import {assert} from "chai";
import { create } from "./util/verifier";

describe('negative tests', () => {
    it('should barf on junk code', async () => {
        const v = await create('}', { quiet: true });
        const err = v.compileError();
        assert.ok(err);
        assert.ok(err.message.match(/Unexpected token/));
    });

    it('should barf on mainline returns with no auto-wrap', async () => {
        const v = await create(
            'return 10;',
            { quiet: true },
            { autoWrap: false }
        );
        const err = v.compileError();
        assert.ok(err);
        assert.ok(err.message.match(/'return' outside/));
    });
});
