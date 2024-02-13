/**
 * Information about code ranges covered.
 */
export type CoveredRanges = {
	/** Covered lines (in pairs: start line, end line) */
	lines: number[]
};

export interface CollectorSpecifierUrl {
	type: "url";
	url: string;
}

/**
 * The collector can be reached by replacing a term in document.location.hostname and optionally changing the port.
 */
export interface CollectorSpecifierSubstitutionPattern {
	type: "substitutionPattern";
	search: string;
	replace: string;
	port?: number;
	useWss: boolean;
}

/**
 * Specifies how the vaccine can reach the collector.
 */
export type CollectorSpecifier = CollectorSpecifierUrl | CollectorSpecifierSubstitutionPattern
