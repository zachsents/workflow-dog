#!/bin/bash

# check for required arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide an environment as the first argument and a service as the second argument."
    exit 1
fi

ENV="$1"
shift

./run.sh "$ENV" build "$@" && ./run.sh "$ENV" push "$@"