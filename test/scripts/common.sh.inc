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

gnutime() {
    if hash gtime 2>/dev/null; then
        # Typically available on MacOs (to be installed via homebrew)
        gtime "$@"
    elif hash /usr/bin/time 2>/dev/null; then
        /usr/bin/time "$@"
    else
        echo "Please make sure to have a variant of 'date' installed for use in 'bash'".
        exit 1
    fi
}
