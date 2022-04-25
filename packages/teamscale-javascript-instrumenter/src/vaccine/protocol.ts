/**
 * Various constants that are used to exchange data between
 * the instrumented application and the coverage collector.
 */
export enum ProtocolMessageTypes {
	/** A message that provides a source map */
	MESSAGE_TYPE_SOURCEMAP = 's',

	/** A message that provides coverage information */
	MESSAGE_TYPE_COVERAGE = 'c'
}
