#!/usr/bin/env bash

set -euo pipefail

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/csilvasantin/csilvasantin.github.io/main/admira-shop/tools/join-admira-workflow.sh)"

printf "\nPress Enter to close."
read -r
