#!/usr/bin/env bash
sam local start-api -n .env --parameter-overrides "AllowedOrigin=https://localhost:8080"