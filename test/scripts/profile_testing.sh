#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$SCRIPT_DIR"/common.sh.inc

# We assume that this script is executed from the
# root of the JS Profiler project.

if [ ! -f "LICENSE" ]
then
    echo "Please run the script from the root of the repository."
    exit 1
fi

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
if [ "$STUDY_NAME" = "grafana" ]
then
cd test/casestudies/grafana
if [ -f $PROFILING_RESULTS_FILE ]
then
  rm $PROFILING_RESULTS_FILE
fi

# Run the test with the memory profiler attached
/usr/bin/time -o "$PROFILING_RESULTS_FILE"  -f "%M %e" \
    yarn e2e

./scripts/grafana-server/kill-server


# Collect and compute the results
else
# Run the test with the memory profiler attached
/usr/bin/time -o "$PROFILING_RESULTS_FILE"  -f "%M %e" \
     npx cypress run \
            --e2e \
            --reporter "junit" \
            --browser "chrome" \
            --headless \
            --quiet \
            --spec "${INTEGRATION_FOLDER}*.spec.js" \
            --config baseUrl="${BASE_URL}",specPattern="${INTEGRATION_FOLDER}*.spec.js"


fi

# Collect and compute the results
DURATION_SECS=$(cut -f2 -d" " < $PROFILING_RESULTS_FILE)
PEAK_MEM_MB=$(expr "$(cut -f1 -d" " < $PROFILING_RESULTS_FILE)" / 1024)

# Write the results to a JSON file
echo "{ \"duration_secs\": $DURATION_SECS, \"memory_mb_peak\": $PEAK_MEM_MB }" > $OUTPUT_FILE
