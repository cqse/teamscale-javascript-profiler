#!/bin/bash

# We assume that this script is executed from the
# root of the JS Profiler project.

if [ ! -f "LICENSE" ]
then
    echo "Please run the script from the root of the repository."
    exit 1
fi

OUTPUT_FILE="$1"

if [ -z "$OUTPUT_FILE" ]
then
    echo "Please provide a target file name."
    exit 1
fi

store_results() {
  # Collect and compute the results
  DURATION_SECS=$(cut -f2 -d" " < "$1")
  PEAK_MEM_MB=$(expr "$(cut -f1 -d" " < "$1")" / 1024)

  # Write the results to a JSON file
  echo "{ \"duration_secs\": $DURATION_SECS, \"memory_mb_peak\": $PEAK_MEM_MB }" > $OUTPUT_FILE
}
