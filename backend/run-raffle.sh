# run-raffle.sh
#!/usr/bin/env bash
if [[ $# -ne 2 ]]; then
    echo "usage: ./run-raffle.sh <DROP_ID> <PROFILE>" >&2
    exit 1
fi

echo "{\"detail\": {\"drop_id\": \"${1}\"}}" > spike.json
sam local invoke HandleRaffleFunction \
--env-vars sam-vars.json \
--event spike.json \
--docker-network kga_net \
--profile "${2}" 
