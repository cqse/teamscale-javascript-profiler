// @ts-nocheck
// @ts-ignore

import {assert} from "chai";
import { Instrumenter } from "../src/instrumenter";
import { create } from "./util/verifier";

describe('varia', () => {
    it('debug/ walkDebug should not cause errors', async () => {
        const v = create('output = args[0];', {}, { debug: true });
        assert.ok(!v.err);
        await v.verify(['X'], 'X', {
            lines: { 1: 1 },
            statements: { 1: 1 }
        });
    });

    it('auto-generates filename', async () => {
        const v = create('output = args[0];', { file: null });
        assert.ok(!v.err);
        await v.verify(['X'], 'X', {
            lines: { 1: 1 },
            statements: { 1: 1 }
        });
    });

    it('preserves comments when requested', async () => {
        const v = create(
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

    it('preserves function names for named export arrow functions', () => {
        /* https://github.com/istanbuljs/babel-plugin-istanbul/issues/125 */
        const v = create(
            'export const func = () => true;',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();

        assert.ok(code.indexOf("const func=") > 0);
    });

    it('honors ignore next for exported functions', () => {
        /* https://github.com/istanbuljs/istanbuljs/issues/297 */
        const v = create(
            '/* istanbul ignore next*/ export function fn1() {}' +
                '/* istanbul ignore next*/ export default function() {}',
            { generateOnly: true },
            { esModules: true, preserveComments: false }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(code.indexOf("export function fn1(){}export default function(){}") > -1);
    });

    it('instruments exported functions', () => {
        /* https://github.com/istanbuljs/istanbuljs/issues/297 */
        const v = create(
            'export function fn1() {}' + 'export default function() {}',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(
            code.match(
                /const _\$o.+=undefined;export function fn1\(\)\{_\$f\(_\$o.+,1,7,1,24\);}export default function\(\)\{_\$f\(_\$o.+,1,39,1,52\);}/
            )
        );
    });

    it('creates a source-map when requested', () => {
        const opts = {
            produceSourceMap: 'inline',
            coverageVariable: '__testing_coverage__'
        };
        const instrumenter = new Instrumenter(opts);
        const generated = instrumenter.instrumentSync(
            'output = args[0]',
            __filename
        );

        assert.ok(generated);
        assert.ok(typeof generated === 'string');
        assert.ok(generated.indexOf("sourceMappingURL=data:application/json" > 0));
    });

    describe('callback style instrumentation', () => {
        it('allows filename to be optional', cb => {
            const instrumenter = new Instrumenter({
                coverageVariable: '__testing_coverage__'
            });
            let generated;
            let err;

            instrumenter.instrument('output = args[0]', (e, c) => {
                err = e;
                generated = c;
                assert.ok(!err);
                assert.ok(generated);
                cb();
            });
        });
        it('returns instead of throwing errors', () => {
            const instrumenter = new Instrumenter({
                coverageVariable: '__testing_coverage__'
            });
            let generated = null;
            let err = null;

            instrumenter.instrument('output = args[0] : 1: 2', (e, c) => {
                err = e;
                generated = c;
            });
            assert.ok(err);
            assert.ok(!generated);
        });
    });

    it('properly exports named classes', () => {
        const v = create(
            'export class App extends Component {};',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(code.indexOf("export class App extends Component{};" > 0));
    });

    it('Yields function coverage statement', () => {
        const v = create(
            'function Function() {}',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(code.indexOf("Function(){_$f(_$o") > 0);
    });

    it('does not declare Function when not needed', () => {
        const v = create(
            'function differentFunction() {}',
            { generateOnly: true },
            { esModules: true }
        );
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(!code.match(/var Function\s*=/));
    });

    it('does not add extra parenthesis when superclass is an identifier', () => {
        const v = create('class App extends Component {};', {
            generateOnly: true
        });
        assert.ok(!v.err);

        const code = v.getGeneratedCode();
        assert.ok(code.indexOf("class App extends Component{};") === 0);
    });

});
