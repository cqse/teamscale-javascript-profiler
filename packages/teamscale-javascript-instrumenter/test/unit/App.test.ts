import { App } from "../../src/App";

test('Postprocessing of config input parameters', () => {
    const config = { inputs: ['"abc"', "'cde'"], collector: "'foo'" };
    App.postprocessConfig(config)
    expect(config.inputs[0]).toEqual('abc');
    expect(config.inputs[1]).toEqual('cde');
    expect(config.collector).toEqual('foo');
});


test('Parsing command-line parameters', () => {
    expect(App.parseCommandLine(["--relative-collector", "replace-in-host:app collector", "input.file"]).relative_collector)
        .toEqual("replace-in-host:app collector")
    expect(App.parseCommandLine(["input.file"]).relative_collector)
        .toBeUndefined()
});
