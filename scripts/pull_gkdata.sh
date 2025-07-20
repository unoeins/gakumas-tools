#!/bin/bash

set -e

# Load .env variables
export $(grep -v '^#' .env | xargs)

echo "🔄 Downloading CSVs from Gakumas Data..."

BASE_URL="https://docs.google.com/spreadsheets/d/${GKDATA_SHEET_ID}/export?format=csv"

declare -A tabs=(
  ["stages"]=$GID_STAGES
  ["idols"]=$GID_IDOLS
  ["p_idols"]=$GID_P_IDOLS
  ["p_items"]=$GID_P_ITEMS
  ["skill_cards"]=$GID_SKILL_CARDS
  ["customizations"]=$GID_CUSTOMIZATIONS
)

for name in "${!tabs[@]}"; do
  gid="${tabs[$name]}"
  out_path="packages/gakumas-data/csv/${name}.csv"
  echo "→ Downloading $name..."
  curl -s -L "${BASE_URL}&gid=${gid}" -o "$out_path"
done

echo "✅ All CSVs downloaded."
