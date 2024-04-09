#!/bin/bash

SCRIPT_DIR=$(dirname "$0")

source "$SCRIPT_DIR"/common.sh.inc
source "$SCRIPT_DIR"/testing_commons.sh.inc

PROFILING_RESULTS_FILE="bench-perf-stats.dat"

OUTPUT_FILE="$3"
if [ -z "$OUTPUT_FILE" ]
then
    echo "Please provide a target file name."
    exit 1
fi

npx cypress install

cd test/casestudies/grafana

if [ -f $PROFILING_RESULTS_FILE ]
then
  rm $PROFILING_RESULTS_FILE
fi

# Run the test with the memory profiler attached
gnutime -o "$PROFILING_RESULTS_FILE"  -f "%M %e" \
    yarn e2e

./scripts/grafana-server/kill-server

store_results "$PROFILING_RESULTS_FILE" "$OUTPUT_FILE"
