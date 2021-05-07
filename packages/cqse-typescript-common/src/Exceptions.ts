import {Optional} from "typescript-optional";

export class ImplementMeException extends Error {

    private readonly _implementMeFor: Optional<string>;

    constructor(implementMeFor?: string) {
        super("Implement me!");
        this._implementMeFor = Optional.ofNullable(implementMeFor);
    }

    get message(): string {
        if (this._implementMeFor.isPresent()) {
            return `Implement me for: ${this._implementMeFor.get()}`;
        } else {
            return 'Implement me!';
        }
    }

}

export class IllegalStateException extends Error {

    constructor(message: string) {
        super(message);
    }

}

export class IllegalArgumentException extends Error {

    constructor(message?: string) {
        super(message);
    }

}