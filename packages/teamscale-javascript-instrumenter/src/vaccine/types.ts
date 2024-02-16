/**
 * The collector URL is known at build time.
 */
export interface CollectorSpecifierUrl {
	/** Type of collector specifier. */
	type: "url";
	/** The URL under which the collector can be reached at runtime. */
	url: string;
}

/** Describes a one-time search and replace operation on a string. */
export interface SearchReplace {
	/** Literal string to search for. */
	search: string;
	/** Literal replacement string. */
	replace: string;
}

/**
 * The collector can be reached by replacing a term in location.host and optionally changing the port.
 */
export interface CollectorSpecifierRelative {
	/** Type of collector specifier. */
	type: "relative";
	/** Literal replacement string. */
	hostReplace?: SearchReplace;
	/** Optional port. If no port is given, uses the protocol's default port. */
	port?: number | "keep";
	/** Optional URL scheme to use. If no scheme is given, uses ws. */
	scheme?: string;
	/** Optional path. If no path is given, uses only the hostname. */
	path?: string;
}

/**
 * Specifies how the vaccine can reach the collector.
 */
export type CollectorSpecifier = CollectorSpecifierUrl | CollectorSpecifierRelative
