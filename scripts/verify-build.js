#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying build artifacts...');

const requiredFiles = [
  'dist/src/server.js',
  'dist/src/worker.js',
  'frontend/.next/BUILD_ID'
];

let allGood = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allGood = false;
  }
});

// Check if dist directory has server.js
if (fs.existsSync('dist/src/server.js')) {
  const stats = fs.statSync('dist/src/server.js');
  console.log(`📦 dist/src/server.js size: ${Math.round(stats.size / 1024)}KB`);
}

// Check Next.js build
if (fs.existsSync('frontend/.next')) {
  console.log('✅ Next.js build directory exists');
} else {
  console.log('❌ Next.js build directory missing');
  allGood = false;
}

if (allGood) {
  console.log('🎉 Build verification successful!');
  process.exit(0);
} else {
  console.log('💥 Build verification failed!');
  process.exit(1);
}