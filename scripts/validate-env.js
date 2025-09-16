#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * Validates NODE_OPTIONS at build time to prevent invalid flags
 * that could cause deployment failures on Railway and other platforms.
 */

const nodeOptions = process.env.NODE_OPTIONS || '';

// List of invalid flags that are not supported by Node.js runtime
const invalidFlags = [
  '--optimize-for-size',        // V8 compile flag, not Node.js runtime flag
  '--max-inlined-bytecode-size', // V8 compile flag, not runtime
  '--no-lazy',                   // V8 compile flag, not runtime
  '--max-heap-size',             // Deprecated in favor of --max-old-space-size
  '--max-gc-pause',              // Not a valid Node.js flag
];

// List of valid Node.js memory management flags for reference
const validFlags = [
  '--max-old-space-size',        // Heap memory limit in MB
  '--max-semi-space-size',       // Semi-space size in MB  
  '--expose-gc',                 // Allow manual garbage collection
  '--gc-interval',               // Force GC every N allocations
  '--stack-size',                // Stack size in KB
  '--stack-trace-limit',         // Number of stack frames
];

console.log('🔍 Validating NODE_OPTIONS environment variable...');

if (!nodeOptions) {
  console.log('✅ NODE_OPTIONS not set (using Node.js defaults)');
  process.exit(0);
}

console.log(`📋 Current NODE_OPTIONS: ${nodeOptions}`);

// Check for invalid flags
const hasInvalidFlag = invalidFlags.some(flag => nodeOptions.includes(flag));

if (hasInvalidFlag) {
  console.error('❌ Invalid NODE_OPTIONS detected!');
  console.error('');
  console.error('❌ INVALID FLAGS FOUND:');
  
  invalidFlags.forEach(flag => {
    if (nodeOptions.includes(flag)) {
      console.error(`   • ${flag} (not supported by Node.js runtime)`);
    }
  });
  
  console.error('');
  console.error('✅ VALID ALTERNATIVES:');
  console.error('   Memory Management:');
  console.error('   • --max-old-space-size=1536    (heap limit in MB)');
  console.error('   • --max-semi-space-size=64     (semi-space in MB)');
  console.error('   • --expose-gc                   (enable manual GC)');
  console.error('   • --gc-interval=100            (force GC frequency)');
  console.error('');
  console.error('   Stack Management:');
  console.error('   • --stack-size=2048            (stack size in KB)');
  console.error('   • --stack-trace-limit=50       (error stack frames)');
  console.error('');
  console.error('💡 RECOMMENDED NODE_OPTIONS FOR PRODUCTION:');
  console.error('   NODE_OPTIONS="--max-old-space-size=1536"');
  console.error('');
  console.error('🔧 TO FIX THIS ISSUE:');
  console.error('   1. Remove invalid flags from NODE_OPTIONS');
  console.error('   2. Use only valid Node.js runtime flags');
  console.error('   3. Test locally before deploying');
  console.error('');
  
  process.exit(1);
}

// Additional validation for common mistakes
if (nodeOptions.includes('--max-old-space-size=') && !nodeOptions.match(/--max-old-space-size=\d+/)) {
  console.error('❌ Invalid --max-old-space-size format!');
  console.error('   Expected: --max-old-space-size=1536 (number in MB)');
  console.error(`   Got: ${nodeOptions}`);
  process.exit(1);
}

console.log('✅ NODE_OPTIONS validation passed');
console.log('');
console.log('📊 CONFIGURATION SUMMARY:');

// Parse and display configured flags
const flags = nodeOptions.split(/\s+/).filter(flag => flag.startsWith('--'));
flags.forEach(flag => {
  const [name, value] = flag.split('=');
  if (validFlags.some(valid => flag.startsWith(valid))) {
    console.log(`   ✅ ${name}${value ? `=${value}` : ''}`);
  } else {
    console.log(`   ⚠️  ${name}${value ? `=${value}` : ''} (unknown flag)`);
  }
});

console.log('');
console.log('🚀 Environment validation completed successfully!');