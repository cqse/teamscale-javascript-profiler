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
	 * @param msg Message describing the condition.
	 */
	public static require(condition: boolean, msg?: string): void {
		if (!condition) {
			throw new IllegalArgumentException(msg);
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
	 * @param str The string to check.
	 * @param msg The message that describes the requirement.
	 */
	public static requireNonEmpty(str: string, msg?: string): string {
		this.requireDefined(str);
		if (str.length === 0) {
			throw new IllegalArgumentException(msg);
		}

		return str;
	}

	/**
	 * Require that the string adheres to a particular pattern.
	 *
	 * @param str The string to check.
	 * @param regexp The regular expression to satisfy.
	 * @param msg The message describing the requirement.
	 */
	public static requireStringPattern(str: string, regexp: string, msg?: string) {
		this.requireDefined(str);
		this.requireDefined(regexp);

		if (!str.match(regexp)) {
			throw new IllegalArgumentException(msg);
		}

		return str;
	}
}
