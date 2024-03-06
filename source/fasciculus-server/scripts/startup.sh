#!/bin/bash

if [ -z "$STEAM_API_KEY" ]; then
    echo "Missing STEAM_API_KEY! The server will not run without that"
    exit 1
fi

if [ ! -f "/world/.inited" ]; then
    echo ${STEAM_API_KEY} | npx screeps init
    touch /world/.inited
fi

npx screeps start --steam_api_key $STEAM_API_KEY
