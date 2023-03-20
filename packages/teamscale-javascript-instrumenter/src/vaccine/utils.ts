/**
 * Determines if the code is executed in a Web Worker.
 */
export function isWebWorker(): boolean {
	return typeof importScripts === 'function';
}

/**
 * Return the global universe object (in a Web browser: The window object).
 */
export function universe(): {[k: string]: any} {
	return getWindow();
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
export function getWindow(): {[k: string]: any} & EventTarget {
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
