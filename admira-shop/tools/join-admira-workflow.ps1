param(
  [string]$Workspace = "$HOME\Documents\Codex\admira-shop-workspace",
  [string]$Repository = "https://github.com/csilvasantin/csilvasantin.github.io.git",
  [string]$GitUserName = "AdmiraNext",
  [string]$GitUserEmail = "csilvasantin@gmail.com"
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

Write-Step "Checking Git"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed. Install Git for Windows first: https://git-scm.com/download/win"
}

Write-Step "Preparing workspace"

New-Item -ItemType Directory -Force -Path $Workspace | Out-Null
$repoPath = Join-Path $Workspace "csilvasantin.github.io"

if (Test-Path (Join-Path $repoPath ".git")) {
  Write-Step "Updating existing repository"
  git -C $repoPath pull --ff-only
} else {
  Write-Step "Cloning repository"
  git clone $Repository $repoPath
}

Write-Step "Configuring Git identity"

git -C $repoPath config user.name $GitUserName
git -C $repoPath config user.email $GitUserEmail
git config --global --add safe.directory $repoPath

$sitePath = Join-Path $repoPath "admira-shop"
$publishScript = Join-Path $sitePath "publish.ps1"

Write-Step "Creating publish helper"

@'
param(
  [string]$Message = "Update Admira.shop"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

git -C $repoRoot add admira-shop .github/workflows/telegram-publish.yml
git -C $repoRoot commit -m $Message
git -C $repoRoot push

Write-Host ""
Write-Host "Published: https://csilvasantin.github.io/admira-shop/" -ForegroundColor Green
Write-Host "Telegram notification is handled by GitHub Actions if repository secrets are configured." -ForegroundColor Green
'@ | Set-Content -Path $publishScript -Encoding UTF8

Write-Step "Ready"

Write-Host "Project folder:" -ForegroundColor Green
Write-Host $sitePath
Write-Host ""
Write-Host "Open it with:" -ForegroundColor Green
Write-Host "cd `"$sitePath`""
Write-Host ""
Write-Host "Publish changes with:" -ForegroundColor Green
Write-Host ".\publish.ps1 `"Update Admira.shop`""
Write-Host ""
Write-Host "Public URL:" -ForegroundColor Green
Write-Host "https://csilvasantin.github.io/admira-shop/"
