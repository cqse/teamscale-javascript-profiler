#!/bin/bash

SCRIPT_DIR=$(dirname `readlink -e $0`)
export PACK_NAME="teamscale-coverage-collector"
source $SCRIPT_DIR/common.inc.sh
