#!/usr/bin/env bash

set -euo pipefail

WORKSPACE="${WORKSPACE:-$HOME/Documents/Codex/admira-shop-workspace}"
REPOSITORY="${REPOSITORY:-https://github.com/csilvasantin/csilvasantin.github.io.git}"
GIT_USER_NAME="${GIT_USER_NAME:-AdmiraNext}"
GIT_USER_EMAIL="${GIT_USER_EMAIL:-csilvasantin@gmail.com}"

step() {
  printf "\n==> %s\n" "$1"
}

step "Checking Git"

if ! command -v git >/dev/null 2>&1; then
  echo "Git is not installed."
  echo "Install Xcode Command Line Tools with: xcode-select --install"
  exit 1
fi

step "Preparing workspace"

mkdir -p "$WORKSPACE"
REPO_PATH="$WORKSPACE/csilvasantin.github.io"

if [ -d "$REPO_PATH/.git" ]; then
  step "Updating existing repository"
  git -C "$REPO_PATH" pull --ff-only
else
  step "Cloning repository"
  git clone "$REPOSITORY" "$REPO_PATH"
fi

step "Configuring Git identity"

git -C "$REPO_PATH" config user.name "$GIT_USER_NAME"
git -C "$REPO_PATH" config user.email "$GIT_USER_EMAIL"
git config --global --add safe.directory "$REPO_PATH"

SITE_PATH="$REPO_PATH/admira-shop"
PUBLISH_SCRIPT="$SITE_PATH/publish.sh"

step "Creating publish helper"

cat > "$PUBLISH_SCRIPT" <<'PUBLISH'
#!/usr/bin/env bash

set -euo pipefail

MESSAGE="${1:-Update Admira.shop}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

git -C "$REPO_ROOT" add admira-shop .github/workflows/telegram-publish.yml
git -C "$REPO_ROOT" commit -m "$MESSAGE"
git -C "$REPO_ROOT" push

printf "\nPublished: https://csilvasantin.github.io/admira-shop/\n"
printf "Telegram notification is handled by GitHub Actions if repository secrets are configured.\n"
PUBLISH

chmod +x "$PUBLISH_SCRIPT"

step "Ready"

printf "Project folder:\n%s\n\n" "$SITE_PATH"
printf "Open it with:\ncd \"%s\"\n\n" "$SITE_PATH"
printf "Publish changes with:\n./publish.sh \"Update Admira.shop\"\n\n"
printf "Public URL:\nhttps://csilvasantin.github.io/admira-shop/\n"
