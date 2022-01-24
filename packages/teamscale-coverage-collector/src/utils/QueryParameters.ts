/**
 * Helper class for building HTTP query parameter strings.
 */
export default class QueryParameters extends URLSearchParams {
	/**
	 * Adds a parameter if the value is defined.
	 */
	public addIfDefined(key: string, value: string | undefined): void {
		if (value) {
			this.append(key, value);
		} else {
			this.delete(key);
		}
	}
}
