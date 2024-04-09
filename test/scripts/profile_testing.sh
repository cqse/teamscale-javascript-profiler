#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
source "$SCRIPT_DIR"/common.sh.inc
source "$SCRIPT_DIR"/testing_commons.sh.inc

STUDY_NAME="$1"
if [ -z "$STUDY_NAME" ]
then
    echo "Please provide a study name as first argument."
    exit 1
fi

SERVER_PORT="$2"
if [ -z "$SERVER_PORT" ]
then
    echo "Please provide a server port as second argument."
    exit 1
fi

OUTPUT_FILE="$3"
if [ -z "$OUTPUT_FILE" ]
then
    echo "Please provide a target file name."
    exit 1
fi

BASE_URL="http://localhost:${SERVER_PORT}"
INTEGRATION_FOLDER="test/integration/${STUDY_NAME}/"
PROFILING_RESULTS_FILE="bench-perf-stats.dat"
if [ -f $PROFILING_RESULTS_FILE ]
then
  rm $PROFILING_RESULTS_FILE
fi

npx cypress install

# Run the test with the memory profiler attached
gnutime -o "$PROFILING_RESULTS_FILE"  -f "%M %e" \
     npx cypress run \
            --e2e \
            --browser "chrome" \
            --headless \
            --quiet \
            --spec "${INTEGRATION_FOLDER}*.spec.js" \
            --config baseUrl="${BASE_URL}",specPattern="${INTEGRATION_FOLDER}*.spec.js" \
            > /dev/null

store_results "$PROFILING_RESULTS_FILE" "$OUTPUT_FILE"
