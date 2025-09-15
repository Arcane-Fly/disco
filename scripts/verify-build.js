#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build artifacts...');

const requiredFiles = [
  'dist/server.js',
  'dist/types/index.js',
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
if (fs.existsSync('dist/server.js')) {
  const stats = fs.statSync('dist/server.js');
  console.log(`📦 dist/server.js size: ${Math.round(stats.size / 1024)}KB`);
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