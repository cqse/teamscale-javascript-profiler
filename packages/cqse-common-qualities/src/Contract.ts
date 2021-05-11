import {IllegalArgumentException} from "./Exceptions";

export class Contract {

    public static require(condition: boolean, msg?: string): void {
        if (!condition) {
            throw new IllegalArgumentException(msg);
        }
    }

    public static requireDefined<E>(obj: E, message?: string): E {
        if (obj) {
            return obj;
        }

        if (typeof obj === 'string' || obj instanceof String) {
            // Deal with the case `obj === ""`
            return obj;
        }

        if (message) {
            throw new IllegalArgumentException(message);
        } else {
            throw new IllegalArgumentException("Reference must not be undefined.");
        }
    }

    public static requireNonEmpty(str: string, msg?: string): string {
        this.requireDefined(str);
        if (str.length === 0) {
            throw new IllegalArgumentException(msg);
        }

        return str;
    }

    public static requireStringPattern(str: string, regexp: string, msg?: string) {
        this.requireDefined(str);
        this.requireDefined(regexp);

        if (!str.match(regexp)) {
            throw new IllegalArgumentException(msg);
        }

        return str;
    }

}