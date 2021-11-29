#!/bin/bash

NODE_VERSION=$(node -v)
YARN_VERSION=$(yarn -v)

if [ -z "${NODE_VERSION}" ]
then
    echo "NodeJS not installed. Please install."
    exit 1
fi

if [ -z "${YARN_VERSION}" ]
then
    echo "Yarn not installed. Please install."
    exit 1
fi

SCRIPT_DIR=$(dirname `readlink -e $0`)
export PACK_DIR="$SCRIPT_DIR/../packages/$PACK_NAME"
export MAIN_FILE="$PACK_DIR/dist/src/main.js"

if [ ! -f "$MAIN_FILE" ]
then
    cd "$PACK_DIR"
    yarn install
    yarn build
fi

node $MAIN_FILE "$@"

