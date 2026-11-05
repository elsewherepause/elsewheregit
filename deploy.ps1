# -----------------------------------------------------------------------------
#  .elsewhere - update and deploy
#
#  Run from PowerShell:
#    cd "D:\elsewhere-main_latest\elsewhere-main"
#    powershell -ExecutionPolicy Bypass -File .\deploy.ps1
#
#  What it does (stops at the first problem and says what went wrong):
#    1. Checks Node.js
#    2. Installs packages
#    3. Gets your database connection (from .env, or asks you)
#    4. Updates the database - only ADDS columns/tables, never deletes anything
#    5. Builds the site to prove it compiles
#    6. Optionally commits and pushes to Git so Vercel deploys it
#
#  NOTE: this file is plain ASCII on purpose. Windows PowerShell 5.1 misreads
#  characters like long dashes or curly quotes and then fails to parse.
# -----------------------------------------------------------------------------

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Step($n, $text) { Write-Host "`n[$n/6] $text" -ForegroundColor Cyan }
function Ok($text)       { Write-Host "      OK  $text" -ForegroundColor Green }
function Fail($text)     { Write-Host "`n  STOPPED: $text`n" -ForegroundColor Red; exit 1 }
function Run($what, [scriptblock]$cmd) {
  & $cmd
  if ($LASTEXITCODE -ne 0) { Fail "$what failed (see the messages above)." }
}

# --- 1. Node.js --------------------------------------------------------------
Step 1 'Checking Node.js'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail 'Node.js is not installed. Install the LTS version from https://nodejs.org and run this again.'
}
$nodeVersion = (node -v).TrimStart('v')
$parts = $nodeVersion.Split('.')
$major = [int]$parts[0]
$minor = [int]$parts[1]
if ($major -lt 20 -or ($major -eq 20 -and $minor -lt 9)) {
  Fail "Node.js $nodeVersion is too old. Next.js 16 needs 20.9 or newer. Install the LTS from https://nodejs.org."
}
Ok "Node.js $nodeVersion"

# --- 2. Packages -------------------------------------------------------------
Step 2 'Installing packages (this can take a few minutes the first time)'
Run 'npm install' { npm install --no-audit --no-fund }
Ok 'Packages installed'

# --- 3. Database connection --------------------------------------------------
Step 3 'Finding your database connection'
function Read-DotEnv($name) {
  if (-not (Test-Path .env)) { return $null }
  $line = Get-Content .env | Where-Object { $_ -match "^\s*$name\s*=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -replace "^\s*$name\s*=\s*", '').Trim().Trim('"').Trim("'")
}
if (-not $env:DATABASE_URL) { $env:DATABASE_URL = Read-DotEnv 'DATABASE_URL' }
if (-not $env:DIRECT_URL)   { $env:DIRECT_URL   = Read-DotEnv 'DIRECT_URL' }
$skipDb = $false
if (-not $env:DATABASE_URL) {
  Write-Host '      No DATABASE_URL found in .env.' -ForegroundColor Yellow
  Write-Host '      Paste it if you have it (it starts with postgresql://).'
  Write-Host '      If you do not have it, just press Enter: the database step will be skipped and'
  Write-Host '      you will run the update in your database console instead (instructions after the build).'
  $env:DATABASE_URL = Read-Host '      Paste DATABASE_URL, or press Enter to skip'
  if (-not $env:DATABASE_URL) { $skipDb = $true }
}
if (-not $skipDb) {
  if (-not $env:DIRECT_URL) {
    $d = Read-Host '      Paste DIRECT_URL (press Enter to use the same as DATABASE_URL)'
    if ($d) { $env:DIRECT_URL = $d } else { $env:DIRECT_URL = $env:DATABASE_URL }
  }
  if ($env:DATABASE_URL -notmatch '^postgres(ql)?://') {
    Fail 'DATABASE_URL should start with postgresql:// - check you copied the right value.'
  }
  Ok 'Database connection set for this window only (nothing is saved to disk)'
} else {
  Write-Host '      Skipping the database step.' -ForegroundColor Yellow
  # Prisma refuses to even generate code without DATABASE_URL set, although it does
  # not connect. This placeholder exists only inside this PowerShell window, just so
  # the build can run. The live site uses the real DATABASE_URL stored in Vercel.
  $env:DATABASE_URL = 'postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder'
  $env:DIRECT_URL   = $env:DATABASE_URL
}

# --- 4. Update the database (add-only) ---------------------------------------
Step 4 'Updating the database (adds the new story column; deletes nothing)'
$migration = 'prisma\migrations\20261105000000_story_and_sync\migration.sql'
if (-not (Test-Path $migration)) { Fail "Cannot find $migration." }
if ($skipDb) {
  Write-Host '      Skipped (no connection string). You MUST run the update in your database' -ForegroundColor Yellow
  Write-Host '      console before the new site goes live - instructions appear after the build.' -ForegroundColor Yellow
} else {
  Run 'Prisma client generation' { npx prisma generate }
  # Runs the hand-written, add-only migration. Every statement uses IF NOT EXISTS,
  # so running this script twice is safe.
  Run 'Database update' { npx prisma db execute --file $migration --schema prisma\schema.prisma }
  Ok 'Database is up to date'
}

# --- 5. Build ----------------------------------------------------------------
Step 5 'Building the site to make sure everything compiles'
$env:NEXT_TELEMETRY_DISABLED = '1'
Run 'Build' { npm run build }
Ok 'Build passed'

if ($skipDb) {
  Write-Host ''
  Write-Host '----------------------------------------------------------------------' -ForegroundColor Yellow
  Write-Host ' DATABASE UPDATE STILL NEEDED (takes 1 minute, no connection string):' -ForegroundColor Yellow
  Write-Host '  1. Go to https://console.neon.tech and sign in (or in Vercel: Storage tab >'
  Write-Host '     your database > Open in Neon).'
  Write-Host '  2. Open your project, then SQL Editor in the left menu.'
  Write-Host '  3. The SQL has been copied to your clipboard. Paste it into the editor and press Run.'
  Write-Host '     (It is also in this file if you need it again:)'
  Write-Host "     $migration"
  Write-Host '  It only adds columns/tables and is safe to run more than once.'
  Write-Host '----------------------------------------------------------------------' -ForegroundColor Yellow
  try { Get-Content -Raw $migration | Set-Clipboard; Ok 'SQL copied to clipboard' } catch { }
}

# --- 6. Deploy via Git -------------------------------------------------------
Step 6 'Deploy'
$hasGit = (Test-Path .git) -and (Get-Command git -ErrorAction SilentlyContinue)
if (-not $hasGit) {
  Write-Host '      This folder is not a Git repository.' -ForegroundColor Yellow
  Write-Host '      Deploy by uploading this folder to your GitHub repo, or run: npx vercel --prod'
} else {
  git status --short
  if ($skipDb) {
    Write-Host ''
    Write-Host '      WARNING: the database has not been updated yet. If you push now, the live site' -ForegroundColor Yellow
    Write-Host '      will show errors until you run the update in your database console.' -ForegroundColor Yellow
    Write-Host '      Do the 3 steps in the yellow box above first, then answer y here.' -ForegroundColor Yellow
  }
  $answer = Read-Host "`n      Commit everything above and push so Vercel deploys? (y/n)"
  if ($answer -match '^[yY]') {
    Run 'git add' { git add -A }
    git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
      Ok 'Nothing new to commit'
    } else {
      Run 'git commit' { git commit -m 'Rebuild: one auto-layout story template, Open Rolls tabs, reliable publishing and uploads' }
    }
    Run 'git push' { git push }
    Ok 'Pushed. Vercel will deploy in a minute or two.'
  } else {
    Write-Host '      Skipped. Push when you are ready.'
  }
}

Write-Host "`nAll done." -ForegroundColor Green
Write-Host 'Next: open /admin, open each existing story, check it, and press Publish once to save it in the new format.'
Write-Host 'Then try one real photo upload (a big camera file) to confirm uploads work end to end.'
