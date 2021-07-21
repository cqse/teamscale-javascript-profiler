/**
 * Determines if the given function is executed in NodeJs.
 */
export function isNodeJs()
{
    return typeof process === 'object' && typeof require === 'function';
}

/**
 * Determines if the given function is executed in a Browser environment.
 */
export function isBrowser() {
    return typeof window === 'object';
}

/**
 * Determines if the code is executed in a Web Worker.
 */
export function isWebWorker() {
    return typeof importScripts === 'function';
}

/**
 * Return the global universe object (in a Web browser: The window object).
 */
export function universe() {
    return getWindow();
}

/**
 * Determines if the window object is present.
 */
export function hasWindow(): boolean {
    return  (typeof window !== 'undefined');
}

/**
 * Returns the window object.
 */
export function getWindow(): any {
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
    return result;
}