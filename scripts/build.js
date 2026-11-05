#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
const path = require('path');

console.log('=== Building Project ===\n');

// 1. Generate the Prisma client for the current platform
console.log('1. Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✓ Prisma client generated\n');
} catch (error) {
  console.error('✗ Prisma generate failed:', error.message);
  process.exit(1);
}

// 2. Bring the database up to date (Vercel only).
//    The SQL only ADDS columns/tables (every statement checks "if not exists"),
//    so it is safe to run on every deploy. If it fails, the build stops, so a
//    version that needs the new columns never replaces the live site.
//    Builds on your own computer skip this; deploy.ps1 handles it there.
if (process.env.VERCEL) {
  console.log('2. Updating the database (add-only, safe to repeat)...');
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('✗ DATABASE_URL is not set in Vercel, so the database cannot be updated.');
    process.exit(1);
  }
  const file = path.join('prisma', 'migrations', '20261105000000_story_and_sync', 'migration.sql');
  // spawnSync with an argument list (no shell) so the connection string, which
  // contains the database password, is never printed in the build logs.
  const result = spawnSync('npx', ['prisma', 'db', 'execute', '--file', file, '--url', url], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
  const hide = (s) => String(s || '').split(url).join('[database address hidden]');
  if (result.stdout && result.stdout.length) process.stdout.write(hide(result.stdout));
  if (result.status !== 0) {
    console.error('✗ Database update failed. The live site has NOT been changed.');
    console.error(hide(result.stderr) || (result.error ? result.error.message : ''));
    process.exit(1);
  }
  console.log('✓ Database is up to date\n');
} else {
  console.log('2. Skipping database update (only runs on Vercel)\n');
}

// 3. Build Next.js
console.log('3. Building Next.js...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('\n✓ Next.js build complete\n');
} catch (error) {
  console.error('✗ Next.js build failed:', error.message);
  process.exit(1);
}

console.log('=== Build Complete ===');
