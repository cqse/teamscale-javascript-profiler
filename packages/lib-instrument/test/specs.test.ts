import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import {create, MOCK_VACCINE} from "./util/verifier";
import * as guards from "./util/guards";
import clone from "clone";

type SpecDoc = {
    guard?: string;
    file: any;
    code?: string;
    name: string;
    opts?: {
        generateOnly?: boolean;
        noCoverage?: boolean;
    };
    instrumentOpts?: {};
    err?: string;
    inputSourceMapClass?: boolean;
    inputSourceMap?: {};
    tests?: TestDoc[];
}

type TestDoc = {
    name: string;
    args?: any[];
    out: any;
    lines: {};
}

// Avoid problems with times: Mock the default timers
jest.useFakeTimers()

const dir = path.resolve(__dirname, 'specs');
const files = fs.readdirSync(dir).filter(f => {
    let match = true;
    if (process.env.FILTER) {
        match = new RegExp(`.*${process.env.FILTER}.*`).test(f);
    }
    return f.match(/\.yaml$/) && match;
});

class NonPojo {
    constructor(props: {}) {
        Object.assign(this, props);
    }
}

function loadDocs(): SpecDoc[] {
    const docs: SpecDoc[] = [];

    files.forEach(f => {
        const filePath = path.resolve(dir, f);
        const contents = fs.readFileSync(filePath, 'utf8');
        try {
            yaml.loadAll(contents, (obj: any) => {
                obj.file = f;
                docs.push(obj);
            });
        } catch (ex: any) {
            docs.push({
                file: f,
                name: 'loaderr',
                err:
                    'Unable to load file [' +
                    f +
                    ']\n' +
                    ex.message +
                    '\n' +
                    ex.stack
            } satisfies SpecDoc);
        }
    });

    return docs;
}

function generateTests(docs: SpecDoc[]) {
    docs.forEach(doc => {
        const guard = doc.guard;
        let skip = false;
        let skipText = '';

        // @ts-ignore
        if (guard && guards[guard]) {
            // @ts-ignore
            if (!guards[guard]()) {
                skip = true;
                skipText = '[SKIP] ';
            }
        }

        const suiteName = skipText + doc.file + '/' + (doc.name || 'suite');
        describe(suiteName, () => {
            if (doc.err) {
                it('has errors', async () => {
                    expect(doc.err).toBeNull();
                });
            } else {
                (doc.tests || []).forEach(t => {
                    const fn = async function () {
                        const genOnly = (doc.opts || {}).generateOnly;
                        const noCoverage = (doc.opts || {}).noCoverage;
                        if (doc.inputSourceMapClass) {
                            doc.inputSourceMap = new NonPojo(
                                doc.inputSourceMap ?? {}
                            );
                        }

                        return create(
                            doc.code!,
                            doc.opts || {},
                            {codeToPrepend: MOCK_VACCINE, ...doc.instrumentOpts},
                            doc.inputSourceMap
                        ).then(verifier => {
                            const test = clone(t);
                            const args = test.args ?? [];
                            const out = test.out;
                            delete test.args;
                            delete test.out;

                            if (!genOnly && !noCoverage) {
                                verifier.verify(args, out, test, suiteName);
                            }
                            if (noCoverage) {
                                expect(verifier.getGeneratedCode().trim()).toEqual(doc.code!.trim());
                            }
                        }).catch(reason => {
                            console.error("Test", test.name, 'failed.', reason);
                        });
                    };

                    if (skip) {
                        it.skip(t.name || 'default test', fn);
                    } else {
                        it(t.name || 'default test', fn);
                    }
                });
            }
        });
    });
}

generateTests(loadDocs());
