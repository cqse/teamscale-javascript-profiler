import { IllegalArgumentException } from './Exceptions';

/**
 * Nullable type.
 */
export type Nullable<Type> = Type | null;

/**
 * Methods to express and check code contracts.
 */
export class Contract {
	/**
	 * The given predicate `condition` has to be satisfied.
	 *
	 * @param condition Condition predicate (boolean value)
	 * @param message Message describing the condition.
	 */
	public static require(condition: boolean, message?: string): void {
		if (!condition) {
			throw new IllegalArgumentException(message);
		}
	}

	/**
	 * Require that the given argument `obj` is defined.
	 *
	 * @param obj The object that has to be defined.
	 * @param message The message describing this requirement.
	 */
	public static requireDefined<E>(obj: Nullable<E>, message?: string): E {
		if (obj) {
			return obj;
		}

		if (typeof obj === 'number' || typeof obj === 'boolean') {
			return obj;
		}

		if (typeof obj === 'string' || obj instanceof String) {
			// Deal with the case `obj === ""`
			return obj;
		}

		if (message) {
			throw new IllegalArgumentException(message);
		} else {
			throw new IllegalArgumentException('Reference must be defined.');
		}
	}

	/**
	 * Require that the given string is not empty.
	 *
	 * @param text The string to check.
	 * @param message The message that describes the requirement.
	 */
	public static requireNonEmpty(text: string, message?: string): string {
		this.requireDefined(text);
		if (text.length === 0) {
			throw new IllegalArgumentException(message);
		}

		return text;
	}

	/**
	 * Require that the string adheres to a particular pattern.
	 *
	 * @param text The string to check.
	 * @param regexp The regular expression to satisfy.
	 * @param message The message describing the requirement.
	 */
	public static requireStringPattern(text: string, regexp: string, message?: string): string {
		this.requireDefined(text);
		this.requireDefined(regexp);

		if (!text.match(regexp)) {
			throw new IllegalArgumentException(message);
		}

		return text;
	}
}
