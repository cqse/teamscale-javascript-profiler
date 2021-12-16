/**
 * Determines if the code is executed in a Web Worker.
 */
export function isWebWorker(): boolean {
	return typeof importScripts === 'function';
}

/**
 * Return the global universe object (in a Web browser: The window object).
 */
export function universe(): Record<string, unknown> {
	// eslint-disable-next-line @typescript-eslint/ban-types
	return getWindow() as {};
}

/**
 * Determines if the window object is present.
 */
export function hasWindow(): boolean {
	return typeof window !== 'undefined';
}

/**
 * Returns the window object.
 */
export function getWindow(): Window {
	return window;
}

/**
 * Query or set a global attribute.
 */
export function universeAttribute<T>(attributeName: string, defaultValue: T): T {
	let result = universe()[attributeName];
	if (!result) {
		result = defaultValue;
		universe()[attributeName] = result;
	}

	return result as T;
}
