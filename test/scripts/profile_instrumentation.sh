#!/bin/bash

if [ ! -f "tsconfig.vaccine.json" ]
then
    echo "Please run the script from the root of the instrumenter package."
    exit 1
fi

DIST_DIR="$1"
if [ -z $DIST_DIR ]
then
    echo "Please provide a distribution folder to instrument."
    exit 1
fi

COLLECTOR_PORT="$2"
if [ -z $COLLECTOR_PORT ]
then
    echo "Please provide a collector port as second argument."
    exit 1
fi

OUTPUT_FILE="$3"
if [ -z $OUTPUT_FILE ]
then
    echo "Please provide a target file name."
    exit 1
fi

MEMORY_SAMPLING_FILE="memory-sampling-instrument.dat"

# Run the instrumenter with the memory profiler attached
START_NANOS=$(date +%s%N)
mprof run --interval 0.05 --include-children --output "$MEMORY_SAMPLING_FILE" \
    node ./dist/src/main.js \
        --in-place ${DIST_DIR} \
        --collector "ws://localhost:$COLLECTOR_PORT" \
        "${@:4}"
END_NANOS=$(date +%s%N)

# Collect and compute the results
DURATION_MILLIS=$((($END_NANOS - $START_NANOS) / 1000000))
PEAK_MEM_MB=$(sed 1d $MEMORY_SAMPLING_FILE | cut -f3 -d" " | sort -n | tail -n1)

# Write the results to a JSON file
echo "{ \"duration_millis\": $DURATION_MILLIS, \"memory_mb_peak\": $PEAK_MEM_MB }" > $OUTPUT_FILE