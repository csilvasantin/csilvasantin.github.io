#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SITE_DIR="$REPO_ROOT/admira-shop"
INDEX_FILE="$SITE_DIR/index.html"
TODAY="$(date +%Y.%m.%d)"
PREFIX="V.${TODAY}.R"

if [ ! -f "$INDEX_FILE" ]; then
  echo "Cannot find $INDEX_FILE"
  exit 1
fi

git -C "$REPO_ROOT" pull --ff-only

CURRENT_VERSION="$(grep -Eo '[vV]\.[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.R[0-9]+' "$INDEX_FILE" | head -n 1 || true)"

if [[ "$CURRENT_VERSION" == V.${TODAY}.R* || "$CURRENT_VERSION" == v.${TODAY}.R* ]]; then
  CURRENT_RELEASE="${CURRENT_VERSION##*.R}"
  NEXT_RELEASE="$((CURRENT_RELEASE + 1))"
else
  NEXT_RELEASE="1"
fi

NEW_VERSION="${PREFIX}${NEXT_RELEASE}"
perl -0pi -e "s/[vV]\.\d{4}\.\d{2}\.\d{2}\.R\d+/${NEW_VERSION}/g" "$INDEX_FILE"

git -C "$REPO_ROOT" add admira-shop/index.html

if git -C "$REPO_ROOT" diff --cached --quiet; then
  echo "No changes to publish. Current version: ${NEW_VERSION}"
  exit 0
fi

git -C "$REPO_ROOT" commit -m "Release Admira.shop ${NEW_VERSION}"
git -C "$REPO_ROOT" push

echo "Published ${NEW_VERSION}: https://csilvasantin.github.io/admira-shop/"
echo "Telegram notification is handled by GitHub Actions."
