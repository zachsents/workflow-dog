#!/bin/bash

# check for required arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide an environment as the first argument and a service as the second argument."
    exit 1
fi

./run.sh "$1" pull "$2" && ./run.sh "$1" up "$2" -d