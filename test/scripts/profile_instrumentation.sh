#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$SCRIPT_DIR"/common.sh.inc

if [ ! -f "tsconfig.vaccine.json" ]
then
    echo "Please run the script from the root of the instrumenter package."
    exit 1
fi

DIST_DIR="$1"
if [ -z "$DIST_DIR" ]
then
    echo "Please provide a distribution folder to instrument."
    exit 1
fi

COLLECTOR_PORT="$2"
if [ -z "$COLLECTOR_PORT" ]
then
    echo "Please provide a collector port as second argument."
    exit 1
fi

OUTPUT_FILE="$3"
if [ -z "$OUTPUT_FILE" ]
then
    echo "Please provide a target file name."
    exit 1
fi

PROFILING_RESULTS_FILE="bench-perf-stats.dat"
if [ -f $PROFILING_RESULTS_FILE ]
then
  rm $PROFILING_RESULTS_FILE
fi

# Run the instrumenter with the memory profiler attached
/usr/bin/time -o "$PROFILING_RESULTS_FILE"  -f "%M %e" \
    node ./dist/src/main.js \
        --in-place "${DIST_DIR}" \
        --collector "ws://localhost:$COLLECTOR_PORT" \
        "${@:4}"

# Collect and compute the results
DURATION_SECS=$(cut -f2 -d" " < $PROFILING_RESULTS_FILE)
PEAK_MEM_MB=$(expr "$(cut -f1 -d" " < $PROFILING_RESULTS_FILE)" / 1024)

# Write the results to a JSON file
echo "{ \"duration_secs\": $DURATION_SECS, \"memory_mb_peak\": $PEAK_MEM_MB }" > $OUTPUT_FILE