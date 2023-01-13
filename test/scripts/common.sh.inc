#!/bin/bash

gnudate() {
    if hash gdate 2>/dev/null; then
        # Typically available on MacOs (to be installed via homebrew)
        gdate "$@"
    elif hash date 2>/dev/null; then
        date "$@"
    else
        echo "Please make sure to have a variant of 'date' installed for use in 'bash'".
        exit 1
    fi
}