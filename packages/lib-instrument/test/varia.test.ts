// @ts-nocheck
// @ts-ignore

import {assert} from "chai";
import { Instrumenter } from "../src/instrumenter";
import { create } from "./util/verifier";

describe('varia', () => {
    it('debug/ walkDebug should not cause errors', async () => {
        const v = await create('output = args[0];', {}, { debug: true });
        assert.ok(!v.err);
        await v.verify(['X'], 'X', {
            lines: { 1: 1 },
            statements: { 1: 1 }
        });
    });

    it('auto-generates filename', async () => {
        const v = await create('output = args[0];', { file: null });
        assert.ok(!v.err);
        await v.verify(['X'], 'X', {
            lines: { 1: 1 },
            statements: { 1: 1 }
        });
    });

    it('preserves comments when requested', async () => {
        const v = await create(
            '/* hello */\noutput = args[0];',
            {},
            { preserveComments: true }
        );
        assert.ok(!v.err);
        await v.verify(['X'], 'X', {
            lines: { 2: 1 },
            statements: { 2: 1 }
        });

        const code = v.getGeneratedCode();
        assert.ok(code.match(/\/* hello */));
    });

    it('preserves function names for named export arrow functions', async () => {
        /* https://github.com/istanbuljs/babel-plugin-istanbul/issues/125 */
        const v = await create(
            'export const func = () => true;',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();

        assert.ok(code.indexOf("const func =") > 0);
    });

    it('honors ignore next for exported functions', async () => {
        /* https://github.com/istanbuljs/istanbuljs/issues/297 */
        const v = await create(
            '/* istanbul ignore next*/ export function fn1() {}' +
                '/* istanbul ignore next*/ export default function() {}',
            { generateOnly: true },
            { esModules: true, preserveComments: false }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode().replace(/\n/g, " ");
        assert.ok(code.indexOf("export function fn1() {} export default function () {}") > -1);
    });

    it('instruments exported functions', async () => {
        /* https://github.com/istanbuljs/istanbuljs/issues/297 */
        const v = await create(
            'export function fn1() {}' + 'export default function() {}',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.isAtMost(code.indexOf('_$l' > 20), 10);
        assert.isAtLeast(code.lastIndexOf('_$l'), 20);
    });

    it('creates a source-map when requested', async () => {
        const opts = {
            produceSourceMap: 'inline',
            coverageVariable: '__testing_coverage__'
        };
        const instrumenter = new Instrumenter(opts);
        const generated = await instrumenter.instrument(
            'output = args[0]',
            __filename
        );

        assert.ok(generated);
        assert.ok(typeof generated === 'string');
        assert.ok(generated.indexOf("sourceMappingURL=data:application/json" > 0));
    });

    it('properly exports named classes', async () => {
        const v = await create(
            'export class App extends Component {};',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(code.indexOf("export class App extends Component{};" > 0));
    });

    it('Yields function coverage statement', async () => {
        const v = await create(
            'function Function() {}',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode().replace(/\n/g, " ");
        assert.ok(code.indexOf("_$l(_$o") > 0);
    });

    it('does not declare Function when not needed', async () => {
        const v = await create(
            'function differentFunction() {}',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(!code.match(/var Function\s*=/));
    });

    it('does not add extra parenthesis when superclass is an identifier', async () => {
        const v = await create('class App extends Component {};', {
            generateOnly: true
        });
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(code.indexOf("class App extends Component {}") === 0);
    });

});
