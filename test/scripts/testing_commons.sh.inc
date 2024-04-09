#!/bin/bash

store_results() {
  INPUT_FILE="$1"
  if [ ! -f "$INPUT_FILE" ]
  then
    echo "File with run performance data not found."
    exit 1
  fi

  OUTPUT_FILE="$2"
  if [ -z "$OUTPUT_FILE" ]
  then
      echo "Please provide a target file name."
      exit 1
  fi

  # Collect and compute the results
  # Only consider the first line of the input file with the measurement data;
  # the lines before somtimes hint on non-zero exit codes, which are not relevant
  # because we compare the produced coverage in the end.
  PERF_INFOS=$(tail -n1 "$INPUT_FILE")
  DURATION_SECS=$(echo "$PERF_INFOS" | cut -f2 -d" ")
  PEAK_MEM_MB=$(expr "$(echo "$PERF_INFOS" | cut -f1 -d" ")" / 1024)

  # Write the results to a JSON file
  echo "{ \"duration_secs\": $DURATION_SECS, \"memory_mb_peak\": $PEAK_MEM_MB }" > $OUTPUT_FILE
}
