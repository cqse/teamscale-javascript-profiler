export function isNodeJs()
{
    return typeof process === 'object' && typeof require === 'function';
}

export function isBrowser() {
    return typeof window === 'object';
}

export function isWebWorker() {
    return typeof importScripts === 'function';
}

export function universe() {
    return getWindow();
}

export function hasWindow(): boolean {
    return  (typeof window !== 'undefined');
}

export function getWindow(): any {
    return window;
}