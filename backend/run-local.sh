#!/usr/bin/env bash
sam local start-api \
--env-vars sam-vars.json \
--parameter-overrides "AllowedOrigin=https://localhost:8080" \
--warm-containers LAZY \
--docker-network kga_net \
--profile ${1:?'Must provide AWS profile name'}