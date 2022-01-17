export default class QueryParameters {
	private parameters: Record<string, string> = {};

	public addIfDefined(key: string, value: string | undefined): void {
		if (value) {
			this.parameters[key] = value;
		}
	}

	public toQueryParamString(): string {
		return Object.entries(this.parameters)
			.map(pair => pair.map(encodeURIComponent).join('='))
			.join('&');
	}
}
