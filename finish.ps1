# -----------------------------------------------------------------------------
#  .elsewhere - ONE script to get the new site onto GitHub as a preview.
#
#  Run from PowerShell:
#    cd "D:\elsewhere-main_latest\elsewhere-main"
#    powershell -ExecutionPolicy Bypass -File .\finish.ps1
#
#  Safe to run any number of times, whatever was run before. It works out the
#  current state by itself, uploads only what is missing to the "rebuild" branch
#  of elsewherepause/elsewheregit, then checks GitHub to confirm.
#  Your live site (branch main) is never touched.
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
function Info($text)     { Write-Host "      $text" }
function Fail($text)     { Write-Host "`n  STOPPED: $text`n" -ForegroundColor Red; exit 1 }
function Git-Run($what) {
  & git @args
  if ($LASTEXITCODE -ne 0) { Fail "$what failed (see the messages above)." }
}

# --- 1. Git and connection ---------------------------------------------------
Step 1 'Checking Git and the connection to GitHub'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail 'Git is not installed. Install it from https://git-scm.com/download/win, open a new PowerShell and run this again.'
}
if (-not (Test-Path .git)) {
  Git-Run 'git init' init -q
  Git-Run 'Adding the GitHub address' remote add origin $correctUrl
  Info 'This folder was not connected to Git; connected it now.'
} else {
  $current = (git remote get-url origin 2>$null)
  if (-not $current) {
    Git-Run 'Adding the GitHub address' remote add origin $correctUrl
  } elseif ($current -ne $correctUrl) {
    Info "Was connected to: $current"
    Git-Run 'Switching to the correct repo' remote set-url origin $correctUrl
  }
}
Ok "Connected to $correctUrl"

foreach ($f in '.env', '.env.local', '.env.production') {
  if (Test-Path $f) {
    git check-ignore -q $f
    if ($LASTEXITCODE -ne 0) { Fail "$f exists and is not ignored by .gitignore. It contains passwords and this repo is PUBLIC - remove it first." }
  }
}
Ok 'No password files will be uploaded (this repo is public)'

if (-not (git config user.email)) {
  Info 'Git needs a name and email for the commit (use your GitHub email).'
  $n = Read-Host '      Your name'
  $e = Read-Host '      Your email'
  Git-Run 'Setting name' config user.name $n
  Git-Run 'Setting email' config user.email $e
}

# --- 2. Tidy up the wrong repo (only if a stray branch is there) --------------
Step 2 'Checking the wrong repo for a stray branch'
$stray = git ls-remote --heads $wrongUrl $branch 2>$null
if ($LASTEXITCODE -eq 0 -and $stray) {
  $a = Read-Host "      A '$branch' branch was pushed to elsewherepause/elsewhere by mistake. Delete it? (y/n)"
  if ($a -match '^[yY]') {
    Git-Run 'Deleting the stray branch' push $wrongUrl --delete $branch
    Ok 'Stray branch removed'
  } else { Info 'Left it there (harmless).' }
} else {
  Ok 'Nothing to tidy up'
}

# --- 3. Find out what is already on GitHub ------------------------------------
Step 3 'Checking what is already on GitHub (a sign-in window may pop up)'
Git-Run 'Downloading from GitHub' fetch --prune origin
$headLine = (git ls-remote --symref origin HEAD) | Where-Object { $_ -match '^ref:' } | Select-Object -First 1
if (-not $headLine) { Fail 'Could not work out the main branch of elsewheregit.' }
$mainBranch = ($headLine -replace '^ref:\s*refs/heads/', '' -replace '\s+HEAD$', '').Trim()
git rev-parse -q --verify "refs/remotes/origin/$branch" *> $null
$rebuildExists = ($LASTEXITCODE -eq 0)
if ($rebuildExists) {
  $base = "refs/remotes/origin/$branch"
  Ok "The '$branch' branch is already on GitHub - adding only what is missing"
} else {
  $base = "refs/remotes/origin/$mainBranch"
  Ok "No '$branch' branch yet - it will be created from '$mainBranch'"
}

# --- 4. Record this folder on top of it (files here are not changed) ----------
Step 4 'Comparing this folder with GitHub'
Git-Run 'Switching to the branch' symbolic-ref HEAD "refs/heads/$branch"
Git-Run 'Lining up with GitHub' update-ref "refs/heads/$branch" $base
Git-Run 'Preparing' reset -q
# Keep editor settings that only exist on GitHub (this folder came from a ZIP without them).
$remoteVscode = git ls-tree -d --name-only $base .vscode
if ($remoteVscode -and -not (Test-Path .vscode)) { Git-Run 'Keeping .vscode' checkout $base -- .vscode }
Git-Run 'Staging files' add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Ok 'GitHub already has everything - nothing new to upload'
} else {
  git diff --cached --stat | Select-Object -Last 1
  $msg = 'Rebuild: one auto-layout story template, Open Rolls tabs, reliable publishing and uploads'
  if ($rebuildExists) { $msg = 'Update rebuild: note photo frame, menu spacing, minimal scrollbar, fixes' }
  Git-Run 'Commit' commit -q -m $msg
  Step 5 "Uploading to the '$branch' branch"
  Git-Run 'Uploading' push -u origin $branch
  Ok 'Uploaded'
}

# --- Final check, straight from GitHub ----------------------------------------
Write-Host "`n[check] Confirming on GitHub" -ForegroundColor Cyan
Git-Run 'Re-checking GitHub' fetch -q origin
$problems = @()
git rev-parse -q --verify "refs/remotes/origin/$branch" *> $null
if ($LASTEXITCODE -ne 0) { $problems += "No '$branch' branch on GitHub." }
else {
  $build = (git show "refs/remotes/origin/${branch}:scripts/build.js" 2>$null) -join "`n"
  if ($build -notmatch 'Updating the database') { $problems += 'The automatic database update is missing from scripts/build.js on GitHub.' }
  $editor = git ls-tree --name-only "refs/remotes/origin/$branch" src/components/admin/story-editor/StoryEditor.tsx
  if (-not $editor) { $problems += 'The new story editor is missing on GitHub.' }
  $frame = git ls-tree --name-only "refs/remotes/origin/$branch" src/components/public/notes/PhotoFrame.tsx
  if (-not $frame) { $problems += 'The note photo frame is missing on GitHub.' }
  $old = git ls-tree -d --name-only "refs/remotes/origin/$branch" src/components/templates
  if ($old) { $problems += 'The old template folder is still on GitHub.' }
  $diff = git diff --name-only "refs/remotes/origin/$branch" -- . ':(exclude).vscode'
  if ($diff) { $problems += "Some files here differ from GitHub: $(@($diff)[0..4] -join ', ')" }
}
$mainNow = git rev-parse "refs/remotes/origin/$mainBranch"

if ($problems.Count) {
  Write-Host ''
  $problems | ForEach-Object { Write-Host "  PROBLEM: $_" -ForegroundColor Red }
  Fail 'GitHub does not match this folder yet. Copy everything above and send it to Claude.'
}
Ok "GitHub '$branch' matches this folder exactly, including the automatic database update"
Ok "Live branch '$mainBranch' was not touched"

Write-Host ''
Write-Host '----------------------------------------------------------------------' -ForegroundColor Green
Write-Host ' ALL GOOD. Your live site has NOT changed yet. Next:' -ForegroundColor Green
Write-Host "  1. Vercel > Deployments: wait for the newest '$branch' build to say Ready."
Write-Host '     In its Build Logs look for: "Database is up to date".'
Write-Host '  2. Click Visit and check: home, a story, Open Rolls, a note, /admin.'
Write-Host '  3. Go live: https://github.com/elsewherepause/elsewheregit/compare/main...rebuild'
Write-Host '     "Create pull request", then "Merge pull request".'
Write-Host '  Undo after going live: Vercel > Deployments > previous production > Instant Rollback.'
Write-Host '----------------------------------------------------------------------' -ForegroundColor Green
