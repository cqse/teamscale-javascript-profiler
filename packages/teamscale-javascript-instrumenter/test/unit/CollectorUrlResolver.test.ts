import { CollectorUrlResolver } from '../../src/vaccine/worker/CollectorUrlResolver';

describe("CollectorUrlResolver", () => {

	test('all features used', () => {
		const url = CollectorUrlResolver.resolveRelative("app44.kubernetes.cluster", "8080", {
			type: "relative",
			hostReplace: {
				search: "app",
				replace: "collector",
			},
			port: 1234,
			scheme: "wss",
			path: "mycollector",
		})
		expect(url).toBe("wss://collector44.kubernetes.cluster:1234/mycollector")
	});

	test('host replacement is only applied once to prevent accidental double-replacement', () => {
		const url = CollectorUrlResolver.resolveRelative("app44.kubernetes.appcluster", "8080", {
			type: "relative",
			hostReplace: {
				search: "app",
				replace: "collector",
			},
		})
		expect(url).toBe("ws://collector44.kubernetes.appcluster")
	});

	test('keeping the port of the application', () => {
		const url = CollectorUrlResolver.resolveRelative("app44.kubernetes.appcluster", "8080", {
			type: "relative",
			port: "keep",
			hostReplace: {
				search: "app",
				replace: "collector",
			},
		})
		expect(url).toBe("ws://collector44.kubernetes.appcluster:8080")
	});

	test('default behaviour', () => {
		const url = CollectorUrlResolver.resolveRelative("app44.kubernetes.cluster", "8080", {
			type: "relative",
		})
		expect(url).toBe("ws://app44.kubernetes.cluster")
	});

});