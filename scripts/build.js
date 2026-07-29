#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('=== Building Project ===\n');

// Generate Prisma client for the current platform
console.log('1. Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✓ Prisma client generated\n');
} catch (error) {
  console.error('✗ Prisma generate failed:', error.message);
  process.exit(1);
}

// Build Next.js
console.log('2. Building Next.js...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('\n✓ Next.js build complete\n');
} catch (error) {
  console.error('✗ Next.js build failed:', error.message);
  process.exit(1);
}

console.log('=== Build Complete ===');
