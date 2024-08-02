#!/bin/sh

DEST_DIR="${1:-skeleton}"
DEST_DIR=$(realpath --relative-to="$PWD" "$DEST_DIR")

mkdir -p $DEST_DIR

find . \
    \( -name 'package.json' -o -name 'tsconfig.json' -o -name 'bun.lockb' \) \
    -not -path '*/node_modules/*' -not -path "./$DEST_DIR/*" \
    -exec cp --parents {} "$DEST_DIR" \;