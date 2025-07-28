#!/usr/bin/env node
/**
 * Environment Variables Configuration Validator
 * Validates .env.example and checks for required environment variables
 */

const fs = require('fs');
const path = require('path');

class EnvValidator {
  constructor(projectPath = '.') {
    this.projectPath = projectPath;
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
    this.envVars = new Map();
    this.requiredVars = new Set();
    this.optionalVars = new Set();
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log('🔍 Starting Environment Variables Validation...\n');
    
    try {
      await this.loadEnvExample();
      await this.analyzeSourceCode();
      await this.validateRequiredVars();
      await this.validateSecurityVars();
      await this.validateDatabaseVars();
      await this.validateAuthVars();
      
      this.generateSummary();
      
      if (this.errors.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Environment validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load and parse .env.example file
   */
  async loadEnvExample() {
    const envExamplePath = path.join(this.projectPath, '.env.example');
    
    if (!fs.existsSync(envExamplePath)) {
      this.errors.push('Missing .env.example file');
      this.fixes.push('Create .env.example file with all required environment variables');
      return;
    }

    console.log('✅ Found .env.example file');
    
    const content = fs.readFileSync(envExamplePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        this.envVars.set(key.trim(), value.trim());
      }
    }
    
    console.log(`📊 Found ${this.envVars.size} environment variables in .env.example`);
  }

  /**
   * Analyze source code to find environment variable usage
   */
  async analyzeSourceCode() {
    console.log('🔍 Analyzing source code for environment variable usage...');
    
    const srcPath = path.join(this.projectPath, 'src');
    if (!fs.existsSync(srcPath)) {
      this.warnings.push('No src directory found');
      return;
    }

    this.analyzeDirectory(srcPath);
    
    console.log(`📊 Found ${this.requiredVars.size} required and ${this.optionalVars.size} optional variables in source code`);
  }

  /**
   * Recursively analyze directory for environment variable usage
   */
  analyzeDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.analyzeDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        this.analyzeFile(filePath);
      }
    }
  }

  /**
   * Analyze individual file for environment variable usage
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for process.env.VARIABLE_NAME patterns
    const envRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
    let match;
    
    while ((match = envRegex.exec(content)) !== null) {
      const varName = match[1];
      
      // Determine if variable is required or optional based on usage context
      const line = this.getLineContaining(content, match.index);
      
      if (this.isRequired(line, varName)) {
        this.requiredVars.add(varName);
      } else {
        this.optionalVars.add(varName);
      }
    }
  }

  /**
   * Get the line containing a specific index
   */
  getLineContaining(content, index) {
    const beforeIndex = content.lastIndexOf('\n', index);
    const afterIndex = content.indexOf('\n', index);
    return content.slice(beforeIndex + 1, afterIndex === -1 ? content.length : afterIndex);
  }

  /**
   * Determine if environment variable is required based on usage context
   */
  isRequired(line, varName) {
    // Check for patterns that indicate required variables
    const requiredPatterns = [
      /!.*process\.env\./,  // !process.env.VAR
      /process\.env\.\w+!/,  // process.env.VAR!
      /throw.*process\.env\./,  // throw new Error if not found
      /required/i,  // comments or text indicating required
    ];
    
    // Check for patterns that indicate optional variables
    const optionalPatterns = [
      /\|\|/,  // process.env.VAR || default
      /\?\./, // optional chaining
      /defaultValue/i,
    ];
    
    for (const pattern of requiredPatterns) {
      if (pattern.test(line)) return true;
    }
    
    for (const pattern of optionalPatterns) {
      if (pattern.test(line)) return false;
    }
    
    // Default to required for critical variables
    const criticalVars = ['PORT', 'JWT_SECRET', 'DATABASE_URL', 'ALLOWED_ORIGINS'];
    return criticalVars.includes(varName);
  }

  /**
   * Validate required environment variables
   */
  async validateRequiredVars() {
    console.log('🔍 Validating required environment variables...');
    
    const missingRequired = [];
    
    for (const varName of this.requiredVars) {
      if (!this.envVars.has(varName)) {
        missingRequired.push(varName);
      }
    }
    
    if (missingRequired.length > 0) {
      this.errors.push(`Missing required environment variables: ${missingRequired.join(', ')}`);
      this.fixes.push(`Add these variables to .env.example: ${missingRequired.join(', ')}`);
    } else {
      console.log('✅ All required environment variables are documented');
    }
  }

  /**
   * Validate security-related environment variables
   */
  async validateSecurityVars() {
    console.log('🔍 Validating security environment variables...');
    
    const securityVars = {
      'JWT_SECRET': {
        required: true,
        pattern: /.{32,}/,
        message: 'JWT_SECRET should be at least 32 characters long'
      },
      'ALLOWED_ORIGINS': {
        required: true,
        pattern: /^https?:\/\//,
        message: 'ALLOWED_ORIGINS should contain valid URLs'
      }
    };
    
    for (const [varName, config] of Object.entries(securityVars)) {
      if (config.required && !this.envVars.has(varName)) {
        this.errors.push(`Missing critical security variable: ${varName}`);
        continue;
      }
      
      const value = this.envVars.get(varName);
      if (value && config.pattern && !config.pattern.test(value)) {
        this.warnings.push(`${varName}: ${config.message}`);
        this.fixes.push(`Update ${varName} to meet security requirements`);
      }
    }
    
    // Check for development values in example
    const devPatterns = [
      { pattern: /localhost/, message: 'Contains localhost references' },
      { pattern: /password/, message: 'Contains default password' },
      { pattern: /secret/, message: 'Contains example secret' },
      { pattern: /your-/, message: 'Contains placeholder values' }
    ];
    
    for (const [varName, value] of this.envVars) {
      for (const { pattern, message } of devPatterns) {
        if (pattern.test(value.toLowerCase())) {
          this.warnings.push(`${varName}: ${message} - ensure production values are different`);
        }
      }
    }
  }

  /**
   * Validate database-related environment variables
   */
  async validateDatabaseVars() {
    console.log('🔍 Validating database environment variables...');
    
    const dbVars = ['DATABASE_URL', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
    const foundDbVars = dbVars.filter(varName => this.envVars.has(varName));
    
    if (foundDbVars.length === 0) {
      this.warnings.push('No database configuration found');
      return;
    }
    
    // Check for consistent database configuration
    if (this.envVars.has('DATABASE_URL')) {
      const dbUrl = this.envVars.get('DATABASE_URL');
      if (dbUrl.includes('postgresql://')) {
        console.log('✅ PostgreSQL database configuration found');
      } else {
        this.warnings.push('DATABASE_URL should use postgresql:// protocol for Railway compatibility');
      }
    }
    
    // Check for Railway-style variables
    const railwayDbVars = this.envVars.get('DATABASE_URL');
    if (railwayDbVars && railwayDbVars.includes('{{') && railwayDbVars.includes('}}')) {
      console.log('✅ Railway template variables detected in database config');
    }
  }

  /**
   * Validate authentication environment variables
   */
  async validateAuthVars() {
    console.log('🔍 Validating authentication environment variables...');
    
    const authVars = {
      'GITHUB_CLIENT_ID': 'GitHub OAuth client ID',
      'GITHUB_CLIENT_SECRET': 'GitHub OAuth client secret',
      'AUTH_CALLBACK_URL': 'OAuth callback URL'
    };
    
    const foundAuthVars = Object.keys(authVars).filter(varName => this.envVars.has(varName));
    
    if (foundAuthVars.length === 0) {
      this.warnings.push('No GitHub OAuth configuration found');
      return;
    }
    
    // Check for complete OAuth configuration
    const requiredOAuthVars = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'];
    const missingOAuth = requiredOAuthVars.filter(varName => !this.envVars.has(varName));
    
    if (missingOAuth.length > 0 && foundAuthVars.length > 0) {
      this.warnings.push(`Incomplete GitHub OAuth configuration, missing: ${missingOAuth.join(', ')}`);
      this.fixes.push('Add all required GitHub OAuth variables or remove OAuth configuration');
    }
    
    // Validate callback URL format
    if (this.envVars.has('AUTH_CALLBACK_URL')) {
      const callbackUrl = this.envVars.get('AUTH_CALLBACK_URL');
      if (!callbackUrl.includes('/api/v1/auth/github/callback')) {
        this.warnings.push('AUTH_CALLBACK_URL should end with /api/v1/auth/github/callback');
        this.fixes.push('Update AUTH_CALLBACK_URL to match the expected callback endpoint');
      }
      
      if (callbackUrl.includes('your-domain')) {
        this.warnings.push('AUTH_CALLBACK_URL contains placeholder domain');
        this.fixes.push('Replace placeholder domain with actual Railway app domain');
      }
    }
    
    if (foundAuthVars.length === Object.keys(authVars).length) {
      console.log('✅ Complete GitHub OAuth configuration found');
    }
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    console.log('\n📊 Environment Variables Validation Summary');
    console.log('='.repeat(50));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All environment variable validations passed!');
      return;
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    if (this.fixes.length > 0) {
      console.log(`\n🔧 Suggested fixes (${this.fixes.length}):`);
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`);
      });
    }
  }

  /**
   * Get validation results for programmatic use
   */
  getResults() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      fixes: this.fixes,
      success: this.errors.length === 0,
      envVars: Array.from(this.envVars.keys()),
      requiredVars: Array.from(this.requiredVars),
      optionalVars: Array.from(this.optionalVars)
    };
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new EnvValidator();
  validator.validate().catch(error => {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  });
}

module.exports = EnvValidator;