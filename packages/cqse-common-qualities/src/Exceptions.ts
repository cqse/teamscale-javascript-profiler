import { Optional } from 'typescript-optional';

/**
 * Excepting signaling that there is functionality that is supposed
 * to be implemented in case the exception is thrown.
 *
 * This is helpful for writing prototypes and not yet handling all possible cases.
 */
export class ImplementMeException extends Error {
	private readonly _implementMeFor: Optional<string>;

	constructor(implementMeFor?: string) {
		super('Implement me!');
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

/**
 * Exception signaling that the application is in an invalid state.
 */
export class IllegalStateException extends Error {
	constructor(message: string) {
		super(message);
	}
}

/**
 * Exception signaling that an invalid argument has been passed for a parameter.
 */
export class IllegalArgumentException extends Error {
	constructor(message?: string) {
		super(message);
	}
}

/**
 * Exception signaling that a component is misconfigured.
 */
export class InvalidConfigurationException extends Error {
	constructor(message: string) {
		super(message);
	}
}
