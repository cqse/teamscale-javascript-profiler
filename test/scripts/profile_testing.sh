#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source $SCRIPT_DIR/common.sh.inc

# We assume that this script is executed from the
# root of the JS Profiler project.

if [ ! -f "package.json" ]
then
    echo "Please run the script from the root of the repository."
    exit 1
fi

STUDY_NAME="$1"
if [ -z $STUDY_NAME ]
then
    echo "Please provide a study name as first argument."
    exit 1
fi

SERVER_PORT="$2"
if [ -z $SERVER_PORT ]
then
    echo "Please provide a server port as second argument."
    exit 1
fi

OUTPUT_FILE="$3"
if [ -z $OUTPUT_FILE ]
then
    echo "Please provide a target file name."
    exit 1
fi

BASE_URL="http://localhost:${SERVER_PORT}"
INTEGRATION_FOLDER="test/integration/${STUDY_NAME}/"

MEMORY_SAMPLING_FILE="memory-sampling-instrument.dat"
if [ -f $MEMORY_SAMPLING_FILE ]
then
  rm $MEMORY_SAMPLING_FILE
fi

# Run the test with the memory profiler attached
START_NANOS=$(gnudate +%s%N)
mprof run --interval 0.05 --include-children --output "$MEMORY_SAMPLING_FILE" \
    npx cypress run \
        --config-file "cypress.json" \
        --reporter "junit" \
        --browser "chrome" \
        --headless \
        --quiet \
        --config "{ \"baseUrl\": \"${BASE_URL}\", \"video\": false, \"integrationFolder\": \"${INTEGRATION_FOLDER}\" }" 
END_NANOS=$(gnudate +%s%N)

# Collect and compute the results
DURATION_MILLIS=$((($END_NANOS - $START_NANOS) / 1000000))
PEAK_MEM_MB=$(sed 1d $MEMORY_SAMPLING_FILE | cut -f2 -d" " | sort -n | tail -n1)

# Write the results to a JSON file
echo "{ \"duration_millis\": $DURATION_MILLIS, \"memory_mb_peak\": $PEAK_MEM_MB }" > $OUTPUT_FILE
