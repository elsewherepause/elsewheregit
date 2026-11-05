# -----------------------------------------------------------------------------
#  .elsewhere - send this folder to GitHub as a PREVIEW (not live yet)
#
#  Run from PowerShell:
#    cd "D:\elsewhere-main_latest\elsewhere-main"
#    powershell -ExecutionPolicy Bypass -File .\push.ps1
#
#  This folder was downloaded as a ZIP, so it is not connected to Git. This script:
#    1. Connects it to your existing GitHub repo (your history is kept)
#    2. Commits the new site on a NEW branch called "rebuild"
#    3. Pushes that branch. Vercel builds it as a PREVIEW with its own link.
#       Your domain keeps showing the current site until you merge on GitHub.
#
#  Plain ASCII on purpose (Windows PowerShell 5.1 misreads other characters).
# -----------------------------------------------------------------------------

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$branch = 'rebuild'

function Step($n, $text) { Write-Host "`n[$n/5] $text" -ForegroundColor Cyan }
function Ok($text)       { Write-Host "      OK  $text" -ForegroundColor Green }
function Fail($text)     { Write-Host "`n  STOPPED: $text`n" -ForegroundColor Red; exit 1 }
function Git-Run($what) {
  # usage: Git-Run 'description' ; runs the git command passed in $args
  & git @args
  if ($LASTEXITCODE -ne 0) { Fail "$what failed (see the messages above)." }
}

# --- 1. Git installed? -------------------------------------------------------
Step 1 'Checking Git'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail 'Git is not installed. Install it from https://git-scm.com/download/win (keep the default options), close this window, open a new PowerShell and run this again.'
}
Ok (git --version)


# --- 2. Connect to your GitHub repo ------------------------------------------
Step 2 'Connecting this folder to your GitHub repo'
if (Test-Path .git) {
  $url = (git remote get-url origin 2>$null)
  if (-not $url) { Fail 'This folder has a .git folder but no "origin" remote. Tell Claude what you see.' }
  Ok "Already connected to $url"
} else {
  Write-Host '      Open your repo on github.com and copy the address from the browser bar.'
  Write-Host '      It looks like: https://github.com/your-name/your-repo'
  $url = (Read-Host '      Paste the GitHub repo address').Trim().TrimEnd('/')
  if ($url -notmatch '^https://github\.com/[^/\s]+/[^/\s]+$' -and $url -notmatch '\.git$') {
    Fail 'That does not look like a GitHub repo address (https://github.com/name/repo).'
  }
  if ($url -notmatch '\.git$' -and $url -match '^https://github\.com/') { $url = "$url.git" }
  Git-Run 'git init' init -q
  Git-Run 'Adding the GitHub address' remote add origin $url
  Ok "Connected to $url"
}

# Safety: never upload secrets (checked now that Git can read .gitignore).
foreach ($f in '.env', '.env.local', '.env.production') {
  if (Test-Path $f) {
    git check-ignore -q $f
    if ($LASTEXITCODE -ne 0) { Fail "$f exists and is not ignored by .gitignore. It contains passwords - remove it or add it to .gitignore first." }
  }
}
Ok 'No password files will be uploaded'

# --- 3. Download your repo's history (a sign-in window may appear) -----------
Step 3 'Downloading your repo history from GitHub (a GitHub sign-in window may pop up)'
Git-Run 'Downloading from GitHub' fetch origin
$headLine = (git ls-remote --symref origin HEAD) | Where-Object { $_ -match '^ref:' } | Select-Object -First 1
if (-not $headLine) { Fail 'Could not work out the main branch of your repo. Is the repo empty?' }
$mainBranch = ($headLine -replace '^ref:\s*refs/heads/', '' -replace '\s+HEAD$', '').Trim()
Ok "Your live branch is '$mainBranch'"

# Put this folder on a new branch that starts from your current GitHub code, without
# touching any files here. The new site is then recorded as one change on top of it.
$exists = git ls-remote --heads origin $branch
if ($exists) { Fail "A branch called '$branch' already exists on GitHub. Delete it on GitHub (Branches page) or tell Claude, then run this again." }
Git-Run 'Creating the branch' update-ref "refs/heads/$branch" "refs/remotes/origin/$mainBranch"
Git-Run 'Switching to the branch' symbolic-ref HEAD "refs/heads/$branch"
Git-Run 'Preparing' reset -q

# --- 4. Commit ---------------------------------------------------------------
Step 4 'Saving the new site as one commit'
if (-not (git config user.email)) {
  Write-Host '      Git needs a name and email for the commit (use your GitHub email).'
  $n = Read-Host '      Your name'
  $e = Read-Host '      Your email'
  Git-Run 'Setting name' config user.name $n
  Git-Run 'Setting email' config user.email $e
}
Git-Run 'Staging files' add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Fail 'Nothing changed compared with GitHub - the new files may already be there.' }
git diff --cached --stat | Select-Object -Last 1
Git-Run 'Commit' commit -q -m 'Rebuild: one auto-layout story template, Open Rolls tabs, reliable publishing and uploads'
Ok 'Committed'

# --- 5. Push the preview branch ----------------------------------------------
Step 5 "Uploading the '$branch' branch to GitHub"
Git-Run 'Uploading' push -u origin $branch
Ok 'Uploaded'

$repoPage = $url -replace '\.git$', ''
Write-Host ''
Write-Host '----------------------------------------------------------------------' -ForegroundColor Green
Write-Host ' DONE. Your live site has NOT changed yet. Next:' -ForegroundColor Green
Write-Host '  1. Vercel is now building a PREVIEW. In the Vercel dashboard open'
Write-Host "     Deployments, find the one for branch '$branch', and click Visit."
Write-Host '  2. Check the preview: home, a story, Open Rolls, a note, and /admin.'
Write-Host '  3. Happy? Go live by merging on GitHub:'
Write-Host "     $repoPage/compare/$mainBranch...$branch"
Write-Host '     Click "Create pull request", then "Merge pull request".'
Write-Host '     Vercel then deploys it to your domain in a minute or two.'
Write-Host '  Something wrong after going live? Vercel > Deployments > the previous'
Write-Host '  production deployment > "Instant Rollback". Your old site is back in seconds.'
Write-Host '----------------------------------------------------------------------' -ForegroundColor Green
