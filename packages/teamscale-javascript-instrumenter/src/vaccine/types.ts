/**
 * Information about code ranges covered.
 */
export type CoveredRanges = {
	/** Covered lines (in pairs: start line, end line) */
	lines: number[]
};

/**
 * The collector URL is known at build time.
 */
export interface CollectorSpecifierUrl {
	/** Type of collector specifier. */
	type: "url";
	/** The URL under which the collector can be reached at runtime. */
	url: string;
}

/**
 * The collector can be reached by replacing a term in location.host and optionally changing the port.
 */
export interface CollectorSpecifierSubstitutionPattern {
	/** Type of collector specifier. */
	type: "substitutionPattern";
	/** Literal string to search for in location.host. */
	search: string;
	/** Literal replacement string. */
	replace: string;
	/** Optional port. If no port is given, uses the protocol's default port. */
	port?: number;
	/** Whether to use ws or wss protocol. */
	useWss: boolean;
}

/**
 * Specifies how the vaccine can reach the collector.
 */
export type CollectorSpecifier = CollectorSpecifierUrl | CollectorSpecifierSubstitutionPattern
