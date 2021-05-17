export const universe: any = require('globalthis')();

export function hasWindow(): boolean {
    return  (typeof window !== 'undefined');
}

export function getWindow(): any {
    return window;
}