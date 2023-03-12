#!/usr/bin/env bash
make -B LDFLAGS="-s -w -X 'key-giveaway/pkg/fw.host=localhost' -X 'key-giveaway/pkg/fw.port=:8080'"