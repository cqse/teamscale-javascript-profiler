/**
 * Various constants that are used to exchange data between
 * the instrumented application and the coverage collector.
 */
export enum ProtocolMessageTypes {
	/** A message that provides a source map */
	MESSAGE_TYPE_SOURCEMAP = 's',

	/** A message that provides coverage information */
	MESSAGE_TYPE_COVERAGE = 'c',

	/** A message containing an istanbul coverage object in JSON */
	ISTANBUL_COV_OBJECT = 'i',

	/** A message denoting an unresolved covered code entity */
	UNRESOLVED_CODE_ENTITY = 'u',

	/** A message requesting a flush of the aggregated coverage to the collector. */
	FLUSH_REQUEST = 'f'
}
