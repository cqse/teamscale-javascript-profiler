import {App} from "../../src/App";

test('Postprocessing of config input parameters', () => {
    const config = { inputs: ['"abc"', "'cde'"], collector: "'foo'"};
    App.postprocessConfig(config)
    expect(config.inputs[0]).toEqual('abc');
    expect(config.inputs[1]).toEqual('cde');
    expect(config.collector).toEqual('foo');
});