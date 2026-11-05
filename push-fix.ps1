# -----------------------------------------------------------------------------
#  .elsewhere - send the new site to the CORRECT GitHub repo (elsewheregit)
#
#  Run from PowerShell:
#    cd "D:\elsewhere-main_latest\elsewhere-main"
#    powershell -ExecutionPolicy Bypass -File .\push-fix.ps1
#
#  The first push went to elsewherepause/elsewhere by mistake. This script:
#    1. Points this folder at elsewherepause/elsewheregit instead
#    2. (Optional) removes the stray "rebuild" branch from the wrong repo
#    3. Rebuilds the "rebuild" branch on top of elsewheregit's own history
#       (your files here are not changed) and pushes it as a PREVIEW
#  Your live site does not change until you merge on GitHub.
#
#  Plain ASCII on purpose (Windows PowerShell 5.1 misreads other characters).
# -----------------------------------------------------------------------------

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$correctUrl = 'https://github.com/elsewherepause/elsewheregit.git'
$wrongUrl   = 'https://github.com/elsewherepause/elsewhere.git'
$branch     = 'rebuild'

function Step($n, $text) { Write-Host "`n[$n/5] $text" -ForegroundColor Cyan }
function Ok($text)       { Write-Host "      OK  $text" -ForegroundColor Green }
function Fail($text)     { Write-Host "`n  STOPPED: $text`n" -ForegroundColor Red; exit 1 }
function Git-Run($what) {
  & git @args
  if ($LASTEXITCODE -ne 0) { Fail "$what failed (see the messages above)." }
}

# --- 1. Point at the correct repo --------------------------------------------
Step 1 'Pointing this folder at the correct repo'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail 'Git is not installed.' }
if (-not (Test-Path .git)) { Fail 'This folder is not connected to Git yet. Run push.ps1 instead.' }
$current = (git remote get-url origin 2>$null)
Write-Host "      Was: $current"
Git-Run 'Changing the GitHub address' remote set-url origin $correctUrl
Ok "Now: $correctUrl"

foreach ($f in '.env', '.env.local', '.env.production') {
  if (Test-Path $f) {
    git check-ignore -q $f
    if ($LASTEXITCODE -ne 0) { Fail "$f exists and is not ignored by .gitignore. It contains passwords and this repo is PUBLIC - remove it first." }
  }
}
Ok 'No password files will be uploaded (important: this repo is public)'

# --- 2. Optionally tidy up the wrong repo ------------------------------------
Step 2 "Tidying up the stray branch in the wrong repo"
$stray = git ls-remote --heads $wrongUrl $branch 2>$null
if ($stray) {
  $a = Read-Host "      Delete the '$branch' branch that was pushed to elsewherepause/elsewhere by mistake? (y/n)"
  if ($a -match '^[yY]') {
    Git-Run 'Deleting the stray branch' push $wrongUrl --delete $branch
    Ok 'Stray branch removed from the wrong repo'
  } else {
    Write-Host '      Left it there. It is harmless; you can delete it on GitHub any time.'
  }
} else {
  Ok 'Nothing to tidy up'
}

# --- 3. Download the correct repo's history ----------------------------------
Step 3 'Downloading elsewheregit history (a GitHub sign-in window may pop up)'
Git-Run 'Downloading from GitHub' fetch --prune origin
$headLine = (git ls-remote --symref origin HEAD) | Where-Object { $_ -match '^ref:' } | Select-Object -First 1
if (-not $headLine) { Fail 'Could not work out the main branch of elsewheregit.' }
$mainBranch = ($headLine -replace '^ref:\s*refs/heads/', '' -replace '\s+HEAD$', '').Trim()
Ok "Live branch is '$mainBranch'"
$exists = git ls-remote --heads origin $branch
if ($exists) { Fail "elsewheregit already has a '$branch' branch. Delete it on GitHub (Branches page), then run this again." }

# --- 4. Re-record the new site on top of elsewheregit ------------------------
Step 4 'Recording the new site on top of elsewheregit (files here are not changed)'
Git-Run 'Switching to the branch' symbolic-ref HEAD "refs/heads/$branch"
Git-Run 'Moving the branch onto elsewheregit' update-ref "refs/heads/$branch" "refs/remotes/origin/$mainBranch"
Git-Run 'Preparing' reset -q
# Keep editor settings that only exist on GitHub (this folder came from a ZIP without them).
$remoteOnly = git ls-tree -d --name-only "refs/remotes/origin/$mainBranch" .vscode
if ($remoteOnly -and -not (Test-Path .vscode)) { Git-Run 'Keeping .vscode' checkout "refs/remotes/origin/$mainBranch" -- .vscode }
Git-Run 'Staging files' add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Fail 'Nothing differs from elsewheregit - the new site may already be there.' }
git diff --cached --stat | Select-Object -Last 1
Git-Run 'Commit' commit -q -m 'Rebuild: one auto-layout story template, Open Rolls tabs, reliable publishing and uploads'
Ok 'Committed'

# --- 5. Push ------------------------------------------------------------------
Step 5 "Uploading the '$branch' branch to elsewheregit"
Git-Run 'Uploading' push -u origin $branch
Ok 'Uploaded'

Write-Host ''
Write-Host '----------------------------------------------------------------------' -ForegroundColor Green
Write-Host ' DONE. Your live site has NOT changed yet. Next:' -ForegroundColor Green
Write-Host '  1. Run the database update in Neon if you have not yet (SQL Editor).'
Write-Host "  2. Vercel > Deployments: open the '$branch' preview and check it."
Write-Host '  3. Go live: https://github.com/elsewherepause/elsewheregit/compare/main...rebuild'
Write-Host '     "Create pull request", then "Merge pull request".'
Write-Host '  Undo after going live: Vercel > Deployments > previous production > Instant Rollback.'
Write-Host '----------------------------------------------------------------------' -ForegroundColor Green
