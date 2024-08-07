#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$SCRIPT_DIR"/common.sh.inc
source "$SCRIPT_DIR"/testing_commons.sh.inc

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
gnutime -o "$PROFILING_RESULTS_FILE"  -f "%M %e" \
    node --max-old-space-size=12000 ./dist/src/main.js \
        --in-place "${DIST_DIR}" \
        --relative-collector "port:$COLLECTOR_PORT" \
        "${@:4}"

store_results "$PROFILING_RESULTS_FILE" "$OUTPUT_FILE"