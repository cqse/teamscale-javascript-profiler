// @ts-nocheck
// @ts-ignore

import {assert} from "chai";
import { create } from "./util/verifier";

describe('negative tests', () => {
    it('should barf on junk code', () => {
        const v = create('}', { quiet: true });
        const err = v.compileError();
        assert.ok(err);
        assert.ok(err.message.match(/Unexpected token/));
    });

    it('should barf on non-string code', () => {
        const v = create({}, { quiet: true });
        const err = v.compileError();
        assert.ok(err);
        assert.ok(err.message.match(/must be a string/));
    });

    it('should barf on mainline returns with no auto-wrap', () => {
        const v = create(
            'return 10;',
            { quiet: true },
            { autoWrap: false }
        );
        const err = v.compileError();
        assert.ok(err);
        assert.ok(err.message.match(/'return' outside/));
    });
});