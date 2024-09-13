#!/bin/bash

# Define the environment as the first argument and throw an error if it's not set
if [ -z "$1" ]; then
    echo "Please provide an environment as the first argument."
    exit 1
fi

ENV=$1
shift

# If there's a file called "compose.$ENV.yml", use it as the compose file
if [ -f "compose.$ENV.yml" ]; then
    COMPOSE_FILE_FLAG="-f compose.yml -f compose.$ENV.yml"
fi

# If there's a file called "env/$ENV.env", use it as the environment file
if [ -f "env/$ENV.env" ]; then
    ENV_FILE_FLAG="--env-file env/$ENV.env --env-file env/.env"
else
    ENV_FILE_FLAG="--env-file env/.env"
fi

# Run docker compose with the configured flags and the remaining arguments
docker compose $COMPOSE_FILE_FLAG $ENV_FILE_FLAG "$@"
