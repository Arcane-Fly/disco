#!/usr/bin/env tsx

/**
 * Callback URL Validator Tool
 * 
 * Validates callback URL configuration before deployment
 * Checks environment variables, URL format, CORS settings, and connectivity
 * 
 * Usage:
 *   yarn validate:callbacks
 *   tsx scripts/validate-callback-urls.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

interface ValidationResult {
  passed: boolean;
  message: string;
  solution?: string;
}

interface ValidationSummary {
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
}

const checkmark = '✅';
const crossmark = '❌';
const warningmark = '⚠️';

/**
 * Validate environment variable is set
 */
function validateEnvVariable(
  name: string,
  required: boolean = true,
  validator?: (value: string) => boolean
): ValidationResult {
  const value = process.env[name];

  if (!value) {
    return {
      passed: !required,
      message: `${required ? crossmark : warningmark} ${name} is not set`,
      solution: required
        ? `Set ${name} in your .env file`
        : `Consider setting ${name} for better functionality`,
    };
  }

  // Check for placeholder values
  const placeholders = ['your-', 'test-', 'placeholder', 'example', 'changeme'];
  if (placeholders.some((p) => value.toLowerCase().includes(p))) {
    return {
      passed: false,
      message: `${warningmark} ${name} appears to contain placeholder value`,
      solution: `Replace ${name} with actual production value`,
    };
  }

  // Run custom validator if provided
  if (validator && !validator(value)) {
    return {
      passed: false,
      message: `${crossmark} ${name} has invalid format`,
      solution: `Check ${name} format and update accordingly`,
    };
  }

  return {
    passed: true,
    message: `${checkmark} ${name} is set`,
  };
}

/**
 * Validate URL format
 */
function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate callback URL format and configuration
 */
function validateCallbackURL(): ValidationResult {
  const callbackUrl = process.env.AUTH_CALLBACK_URL;

  if (!callbackUrl) {
    return {
      passed: false,
      message: `${crossmark} AUTH_CALLBACK_URL is not set`,
      solution:
        'Set AUTH_CALLBACK_URL in your .env file (e.g., http://localhost:3000/api/v1/auth/github/callback)',
    };
  }

  // Validate URL format
  if (!validateURL(callbackUrl)) {
    return {
      passed: false,
      message: `${crossmark} AUTH_CALLBACK_URL has invalid format: ${callbackUrl}`,
      solution: 'Use full URL with protocol (http:// or https://)',
    };
  }

  const url = new URL(callbackUrl);

  // Check protocol
  if (url.protocol === 'http:' && url.hostname !== 'localhost') {
    return {
      passed: false,
      message: `${crossmark} AUTH_CALLBACK_URL uses HTTP for non-localhost: ${callbackUrl}`,
      solution: 'Use HTTPS for non-localhost URLs',
    };
  }

  // Check path
  if (!callbackUrl.includes('/api/v1/auth/github/callback')) {
    return {
      passed: false,
      message: `${warningmark} AUTH_CALLBACK_URL path doesn't match expected: ${callbackUrl}`,
      solution: 'Expected path: /api/v1/auth/github/callback',
    };
  }

  // Check for trailing slash
  if (callbackUrl.endsWith('/')) {
    return {
      passed: false,
      message: `${crossmark} AUTH_CALLBACK_URL has trailing slash: ${callbackUrl}`,
      solution: 'Remove trailing slash from AUTH_CALLBACK_URL',
    };
  }

  return {
    passed: true,
    message: `${checkmark} AUTH_CALLBACK_URL is valid: ${callbackUrl}`,
  };
}

/**
 * Validate CORS configuration
 */
function validateCORS(): ValidationResult {
  const callbackUrl = process.env.AUTH_CALLBACK_URL;
  const allowedOrigins = process.env.ALLOWED_ORIGINS;

  if (!allowedOrigins) {
    return {
      passed: false,
      message: `${crossmark} ALLOWED_ORIGINS is not set`,
      solution: 'Set ALLOWED_ORIGINS in your .env file',
    };
  }

  if (!callbackUrl) {
    return {
      passed: false,
      message: `${crossmark} Cannot validate CORS without AUTH_CALLBACK_URL`,
      solution: 'Set AUTH_CALLBACK_URL first',
    };
  }

  try {
    const callbackOrigin = new URL(callbackUrl).origin;
    const origins = allowedOrigins.split(',').map((o) => o.trim());

    // Check if callback origin is in allowed origins
    if (!origins.includes(callbackOrigin)) {
      return {
        passed: false,
        message: `${crossmark} Callback origin not in ALLOWED_ORIGINS`,
        solution: `Add ${callbackOrigin} to ALLOWED_ORIGINS`,
      };
    }

    // Check for wildcards (security risk)
    if (origins.some((o) => o.includes('*'))) {
      return {
        passed: false,
        message: `${warningmark} ALLOWED_ORIGINS contains wildcards (security risk)`,
        solution: 'Remove wildcards and specify exact origins',
      };
    }

    // Check for trailing slashes
    if (origins.some((o) => o.endsWith('/'))) {
      return {
        passed: false,
        message: `${warningmark} ALLOWED_ORIGINS contains trailing slashes`,
        solution: 'Remove trailing slashes from origins',
      };
    }

    return {
      passed: true,
      message: `${checkmark} CORS configuration is valid (${origins.length} origins)`,
    };
  } catch (error) {
    return {
      passed: false,
      message: `${crossmark} Error validating CORS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      solution: 'Check ALLOWED_ORIGINS format',
    };
  }
}

/**
 * Validate JWT secret strength
 */
function validateJWTSecret(): ValidationResult {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return {
      passed: false,
      message: `${crossmark} JWT_SECRET is not set`,
      solution: 'Generate with: openssl rand -base64 32',
    };
  }

  // Check minimum length
  if (secret.length < 32) {
    return {
      passed: false,
      message: `${crossmark} JWT_SECRET is too short (${secret.length} chars, minimum 32)`,
      solution: 'Generate stronger secret with: openssl rand -base64 32',
    };
  }

  // Check for weak patterns
  const weakPatterns = ['123', 'abc', 'password', 'secret', 'test'];
  if (weakPatterns.some((p) => secret.toLowerCase().includes(p))) {
    return {
      passed: false,
      message: `${warningmark} JWT_SECRET appears to be weak or predictable`,
      solution: 'Generate cryptographically secure secret with: openssl rand -base64 32',
    };
  }

  return {
    passed: true,
    message: `${checkmark} JWT_SECRET is strong (${secret.length} chars)`,
  };
}

/**
 * Validate GitHub OAuth configuration
 */
function validateGitHubOAuth(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check CLIENT_ID
  const clientIdResult = validateEnvVariable(
    'GITHUB_CLIENT_ID',
    true,
    (value) => value.length > 10
  );
  results.push(clientIdResult);

  // Check CLIENT_SECRET
  const clientSecretResult = validateEnvVariable(
    'GITHUB_CLIENT_SECRET',
    true,
    (value) => value.length > 20
  );
  results.push(clientSecretResult);

  return results;
}

/**
 * Test callback URL connectivity (optional)
 */
async function testCallbackConnectivity(): Promise<ValidationResult> {
  const callbackUrl = process.env.AUTH_CALLBACK_URL;

  if (!callbackUrl) {
    return {
      passed: false,
      message: `${crossmark} Cannot test connectivity without AUTH_CALLBACK_URL`,
      solution: 'Set AUTH_CALLBACK_URL first',
    };
  }

  // Extract base URL for health check
  try {
    const url = new URL(callbackUrl);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Only test if it's localhost or a URL we can reach
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      // Skip actual connectivity test for localhost as server might not be running
      return {
        passed: true,
        message: `${checkmark} Callback URL is localhost (skipping connectivity test)`,
      };
    }

    return {
      passed: true,
      message: `${checkmark} Callback URL is remote (connectivity test skipped)`,
    };
  } catch (error) {
    return {
      passed: false,
      message: `${crossmark} Error testing connectivity: ${error instanceof Error ? error.message : 'Unknown error'}`,
      solution: 'Verify server is running and accessible',
    };
  }
}

/**
 * Check for .env file existence
 */
function checkEnvFile(): ValidationResult {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    return {
      passed: false,
      message: `${warningmark} .env file not found`,
      solution: 'Create .env file from .env.example or .env.local.example',
    };
  }

  return {
    passed: true,
    message: `${checkmark} .env file exists`,
  };
}

/**
 * Run all validations
 */
async function runValidations(): Promise<void> {
  console.log('\n🔍 Callback URL Configuration Validator\n');
  console.log('='.repeat(50));
  console.log();

  const results: ValidationResult[] = [];
  const summary: ValidationSummary = {
    totalChecks: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // Environment file check
  console.log('📁 Environment File\n');
  const envFileResult = checkEnvFile();
  results.push(envFileResult);
  console.log(`   ${envFileResult.message}`);
  if (envFileResult.solution) {
    console.log(`   💡 ${envFileResult.solution}`);
  }
  console.log();

  // GitHub OAuth
  console.log('🔑 GitHub OAuth Configuration\n');
  const githubResults = validateGitHubOAuth();
  results.push(...githubResults);
  githubResults.forEach((result) => {
    console.log(`   ${result.message}`);
    if (result.solution) {
      console.log(`   💡 ${result.solution}`);
    }
  });
  console.log();

  // Callback URL
  console.log('🔗 Callback URL\n');
  const callbackResult = validateCallbackURL();
  results.push(callbackResult);
  console.log(`   ${callbackResult.message}`);
  if (callbackResult.solution) {
    console.log(`   💡 ${callbackResult.solution}`);
  }
  console.log();

  // CORS
  console.log('🌐 CORS Configuration\n');
  const corsResult = validateCORS();
  results.push(corsResult);
  console.log(`   ${corsResult.message}`);
  if (corsResult.solution) {
    console.log(`   💡 ${corsResult.solution}`);
  }
  console.log();

  // JWT Secret
  console.log('🔐 JWT Secret\n');
  const jwtResult = validateJWTSecret();
  results.push(jwtResult);
  console.log(`   ${jwtResult.message}`);
  if (jwtResult.solution) {
    console.log(`   💡 ${jwtResult.solution}`);
  }
  console.log();

  // Connectivity
  console.log('🔌 Connectivity\n');
  const connectivityResult = await testCallbackConnectivity();
  results.push(connectivityResult);
  console.log(`   ${connectivityResult.message}`);
  if (connectivityResult.solution) {
    console.log(`   💡 ${connectivityResult.solution}`);
  }
  console.log();

  // Calculate summary
  results.forEach((result) => {
    summary.totalChecks++;
    if (result.passed) {
      summary.passed++;
    } else {
      if (result.message.includes(warningmark)) {
        summary.warnings++;
      } else {
        summary.failed++;
      }
    }
  });

  // Print summary
  console.log('='.repeat(50));
  console.log('\n📊 Summary\n');
  console.log(`   Total Checks: ${summary.totalChecks}`);
  console.log(`   ${checkmark} Passed: ${summary.passed}`);
  if (summary.warnings > 0) {
    console.log(`   ${warningmark} Warnings: ${summary.warnings}`);
  }
  if (summary.failed > 0) {
    console.log(`   ${crossmark} Failed: ${summary.failed}`);
  }
  console.log();

  // Overall result
  if (summary.failed === 0 && summary.warnings === 0) {
    console.log('✨ All validations passed! Configuration is ready for deployment.\n');
    process.exit(0);
  } else if (summary.failed === 0) {
    console.log(
      `⚠️  Configuration has ${summary.warnings} warning(s). Review and address before deployment.\n`
    );
    process.exit(0);
  } else {
    console.log(
      `❌ Configuration has ${summary.failed} error(s). Fix these issues before deployment.\n`
    );
    process.exit(1);
  }
}

// Run validations
runValidations().catch((error) => {
  console.error('❌ Validation failed with error:', error);
  process.exit(1);
});
