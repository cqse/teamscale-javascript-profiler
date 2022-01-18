/**
 * Helper class for building HTTP query parameter strings.
 */
export default class QueryParameters {
	private parameters: Record<string, string> = {};

	/**
	 * Adds a parameter if the value is defined.
	 */
	public addIfDefined(key: string, value: string | undefined): void {
		if (value) {
			this.parameters[key] = value;
		}
	}

	/**
	 * Convert the parameters to a query string that can be added to an URL.
	 */
	public toQueryParamString(): string {
		return Object.entries(this.parameters)
			.map(pair => pair.map(encodeURIComponent).join('='))
			.join('&');
	}
}
