/**
 * Remove the given prefix, if present, from the given string.
 *
 * @param prefix - The prefix to remove.
 * @param removeFrom - The string to remove the prefix from.
 *
 * @returns a new string where the prefix is removed.
 */
export function removePrefix(prefix: string, removeFrom: string): string {
	if (removeFrom.startsWith(prefix)) {
		return removeFrom.substring(prefix.length);
	}
	return removeFrom;
}
