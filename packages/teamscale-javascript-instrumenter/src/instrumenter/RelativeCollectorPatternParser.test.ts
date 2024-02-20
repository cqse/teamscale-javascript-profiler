import { CollectorSpecifierRelative } from "@src/vaccine/types";
import { RelativeCollectorPatternParser } from "./RelativeCollectorPatternParser";

describe("SubstitutionPatternParser", () => {

	test('empty pattern', () => {
		expect(RelativeCollectorPatternParser.parse("")).toEqual({
			type: "relative",
		} as CollectorSpecifierRelative);
	});

	test('keep port', () => {
		expect(RelativeCollectorPatternParser.parse("")).toEqual({
			type: "relative",
			port: "keep",
		} as CollectorSpecifierRelative);
	});

	test('all features', () => {
		expect(RelativeCollectorPatternParser.parse("scheme:wss,port:1234,replace-in-host:foo bar,path:path/path")).toEqual({
			type: "relative",
			hostReplace: {
				search: "foo",
				replace: "bar",
			},
			path: "path/path",
			port: 1234,
			scheme: "wss",
		} as CollectorSpecifierRelative);
	});

});