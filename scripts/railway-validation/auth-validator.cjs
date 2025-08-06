#!/usr/bin/env node
/**
 * Authentication and CORS Configuration Validator
 * Validates GitHub OAuth setup, domain names, and CORS configuration
 */

const fs = require('fs');
const path = require('path');

class AuthValidator {
  constructor(projectPath = '.') {
    this.projectPath = projectPath;
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
    this.envVars = new Map();
    this.authConfig = null;
    this.corsConfig = null;
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log('🔍 Starting Authentication & CORS Validation...\n');
    
    try {
      await this.loadEnvVars();
      await this.analyzeAuthImplementation();
      await this.validateGitHubOAuth();
      await this.validateCORSConfiguration();
      await this.validateCallbackURLs();
      await this.validateDomainConfiguration();
      await this.validateSecurityHeaders();
      
      this.generateSummary();
      
      if (this.errors.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Authentication validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load environment variables from .env.example
   */
  async loadEnvVars() {
    const envExamplePath = path.join(this.projectPath, '.env.example');
    
    if (fs.existsSync(envExamplePath)) {
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
      
      console.log('✅ Loaded environment variables from .env.example');
    }
  }

  /**
   * Analyze authentication implementation in source code
   */
  async analyzeAuthImplementation() {
    console.log('🔍 Analyzing authentication implementation...');
    
    const authPath = path.join(this.projectPath, 'src/api/auth.ts');
    if (!fs.existsSync(authPath)) {
      this.errors.push('Authentication API not found at src/api/auth.ts');
      return;
    }

    const authContent = fs.readFileSync(authPath, 'utf8');
    this.authConfig = this.parseAuthConfig(authContent);
    
    console.log('✅ Found authentication API implementation');
  }

  /**
   * Parse authentication configuration from source code
   */
  parseAuthConfig(content) {
    const config = {
      hasGitHubAuth: content.includes('github/callback'),
      hasJWTAuth: content.includes('jwt.sign') || content.includes('jsonwebtoken'),
      hasApiKeyAuth: content.includes('VALID_API_KEYS'),
      endpoints: []
    };

    // Extract authentication endpoints
    const routeRegex = /router\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      config.endpoints.push({
        method: match[1].toUpperCase(),
        path: match[2]
      });
    }

    return config;
  }

  /**
   * Validate GitHub OAuth configuration
   */
  async validateGitHubOAuth() {
    console.log('🔍 Validating GitHub OAuth configuration...');
    
    const requiredOAuthVars = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'AUTH_CALLBACK_URL'];
    const missingVars = requiredOAuthVars.filter(varName => !this.envVars.has(varName));
    
    if (missingVars.length === requiredOAuthVars.length) {
      this.warnings.push('GitHub OAuth not configured (all variables missing)');
      this.fixes.push('Set up GitHub OAuth app and configure GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_CALLBACK_URL');
      return;
    }
    
    if (missingVars.length > 0) {
      this.errors.push(`Incomplete GitHub OAuth configuration, missing: ${missingVars.join(', ')}`);
      this.fixes.push('Complete GitHub OAuth configuration by adding missing environment variables');
    }

    // Validate GitHub Client ID format
    const clientId = this.envVars.get('GITHUB_CLIENT_ID');
    if (clientId) {
      if (clientId.includes('${{')) {
        console.log('✅ GitHub Client ID configured with Railway template variable');
      } else if (clientId.includes('your-github-client-id') || clientId.includes('placeholder')) {
        this.errors.push('GITHUB_CLIENT_ID contains placeholder value');
        this.fixes.push('Replace GITHUB_CLIENT_ID with actual GitHub OAuth app client ID');
      } else if (!/^[a-f0-9]{20}$/i.test(clientId)) {
        this.warnings.push('GITHUB_CLIENT_ID format may be incorrect (expected 20 hex characters)');
      }
    }

    // Validate GitHub Client Secret
    const clientSecret = this.envVars.get('GITHUB_CLIENT_SECRET');
    if (clientSecret) {
      if (clientSecret.includes('${{')) {
        console.log('✅ GitHub Client Secret configured with Railway template variable');
      } else if (clientSecret.includes('your-github-client-secret') || clientSecret.includes('placeholder')) {
        this.errors.push('GITHUB_CLIENT_SECRET contains placeholder value');
        this.fixes.push('Replace GITHUB_CLIENT_SECRET with actual GitHub OAuth app client secret');
      }
    }

    // Check OAuth scopes in implementation
    if (this.authConfig) {
      const authPath = path.join(this.projectPath, 'src/api/auth.ts');
      const authContent = fs.readFileSync(authPath, 'utf8');
      
      if (authContent.includes('scope=user:email')) {
        console.log('✅ GitHub OAuth scope configured for user email access');
      } else {
        this.warnings.push('GitHub OAuth scope may not include user:email');
        this.fixes.push('Ensure GitHub OAuth request includes scope=user:email');
      }
    }
  }

  /**
   * Validate CORS configuration
   */
  async validateCORSConfiguration() {
    console.log('🔍 Validating CORS configuration...');
    
    const allowedOrigins = this.envVars.get('ALLOWED_ORIGINS');
    if (!allowedOrigins) {
      this.errors.push('ALLOWED_ORIGINS not configured');
      this.fixes.push('Set ALLOWED_ORIGINS environment variable with comma-separated list of allowed domains');
      return;
    }

    // Skip validation for Railway template variables
    if (allowedOrigins.includes('${{')) {
      console.log('✅ CORS configured with Railway template variables');
      return;
    }

    // Parse allowed origins
    const origins = allowedOrigins.split(',').map(origin => origin.trim());
    
    // Validate origin formats
    const invalidOrigins = [];
    const requiredOrigins = ['https://chat.openai.com', 'https://chatgpt.com'];
    const foundRequiredOrigins = [];
    
    for (const origin of origins) {
      if (!origin.match(/^https?:\/\/[a-zA-Z0-9.-]+/)) {
        invalidOrigins.push(origin);
      }
      
      if (requiredOrigins.includes(origin)) {
        foundRequiredOrigins.push(origin);
      }
    }

    if (invalidOrigins.length > 0) {
      this.errors.push(`Invalid origin formats: ${invalidOrigins.join(', ')}`);
      this.fixes.push('Ensure all origins start with http:// or https:// and have valid domain format');
    }

    // Check for required ChatGPT origins
    const missingRequired = requiredOrigins.filter(required => !foundRequiredOrigins.includes(required));
    if (missingRequired.length > 0) {
      this.warnings.push(`Missing recommended ChatGPT origins: ${missingRequired.join(', ')}`);
      this.fixes.push('Add ChatGPT domains to ALLOWED_ORIGINS for proper integration');
    }

    // Check for wildcard origins (security risk)
    if (origins.includes('*')) {
      this.errors.push('CORS configured with wildcard (*) - security risk');
      this.fixes.push('Replace wildcard with specific allowed domains');
    }

    // Check for localhost in production
    const localhostOrigins = origins.filter(origin => origin.includes('localhost'));
    if (localhostOrigins.length > 0) {
      this.warnings.push(`Localhost origins found: ${localhostOrigins.join(', ')} - ensure production config excludes these`);
    }

    // Analyze CORS implementation in server.ts
    const serverPath = path.join(this.projectPath, 'src/server.ts');
    if (fs.existsSync(serverPath)) {
      const serverContent = fs.readFileSync(serverPath, 'utf8');
      
      if (!serverContent.includes('cors')) {
        this.errors.push('CORS middleware not found in server configuration');
        this.fixes.push('Add CORS middleware to Express server');
      } else if (serverContent.includes('origin: true')) {
        this.warnings.push('CORS configured to allow all origins in development - ensure production uses ALLOWED_ORIGINS');
      } else {
        console.log('✅ CORS middleware implementation found');
      }
    }

    if (foundRequiredOrigins.length === requiredOrigins.length && invalidOrigins.length === 0) {
      console.log('✅ CORS configuration looks good');
    }
  }

  /**
   * Validate callback URLs and routing
   */
  async validateCallbackURLs() {
    console.log('🔍 Validating OAuth callback URLs...');
    
    const callbackUrl = this.envVars.get('AUTH_CALLBACK_URL');
    if (!callbackUrl) {
      this.warnings.push('AUTH_CALLBACK_URL not configured');
      this.fixes.push('Set AUTH_CALLBACK_URL to your Railway app domain + /api/v1/auth/github/callback');
      return;
    }

    // Skip validation for Railway template variables
    if (callbackUrl.includes('${{')) {
      console.log('✅ Callback URL configured with Railway template variable');
      return;
    }

    // Validate callback URL format
    if (!callbackUrl.includes('/api/v1/auth/github/callback')) {
      this.errors.push('AUTH_CALLBACK_URL should end with /api/v1/auth/github/callback');
      this.fixes.push('Update AUTH_CALLBACK_URL to match the implemented callback endpoint');
    }

    // Check for placeholder domains
    if (callbackUrl.includes('your-domain') || callbackUrl.includes('localhost')) {
      this.warnings.push('AUTH_CALLBACK_URL contains placeholder or localhost domain');
      this.fixes.push('Replace with actual Railway app domain (e.g., https://yourapp.up.railway.app)');
    }

    // Validate protocol
    if (!callbackUrl.startsWith('https://')) {
      this.errors.push('AUTH_CALLBACK_URL should use HTTPS protocol');
      this.fixes.push('Change AUTH_CALLBACK_URL to use https:// protocol');
    }

    // Check if callback endpoint exists in implementation
    if (this.authConfig && this.authConfig.endpoints) {
      const hasCallback = this.authConfig.endpoints.some(
        endpoint => endpoint.path.includes('/github/callback')
      );
      
      if (!hasCallback) {
        this.errors.push('GitHub callback endpoint not implemented in auth API');
        this.fixes.push('Implement GET /api/v1/auth/github/callback endpoint');
      } else {
        console.log('✅ GitHub callback endpoint implementation found');
      }
    }
  }

  /**
   * Validate domain configuration for Railway
   */
  async validateDomainConfiguration() {
    console.log('🔍 Validating domain configuration...');
    
    // Check for Railway domain patterns
    const callbackUrl = this.envVars.get('AUTH_CALLBACK_URL');
    const allowedOrigins = this.envVars.get('ALLOWED_ORIGINS');
    
    if (callbackUrl) {
      if (callbackUrl.includes('.up.railway.app')) {
        console.log('✅ Railway domain detected in callback URL');
      } else if (callbackUrl.includes('.railway.app')) {
        console.log('✅ Railway domain detected in callback URL');
      } else if (!callbackUrl.includes('localhost')) {
        this.warnings.push('Custom domain detected in callback URL - ensure DNS is properly configured');
      }
    }

    // Check Railway environment variable patterns
    const railwayVarPattern = /\$\{\{[^}]+\}\}/;
    let hasRailwayVars = false;
    
    for (const [key, value] of this.envVars) {
      if (railwayVarPattern.test(value)) {
        hasRailwayVars = true;
        console.log(`✅ Railway template variable found in ${key}`);
      }
    }

    if (!hasRailwayVars) {
      this.warnings.push('No Railway template variables detected - consider using Railway shared variables for production');
      this.fixes.push('Use Railway template variables like ${{shared.VARIABLE_NAME}} for production deployment');
    }
  }

  /**
   * Validate security headers and middleware
   */
  async validateSecurityHeaders() {
    console.log('🔍 Validating security headers...');
    
    const serverPath = path.join(this.projectPath, 'src/server.ts');
    if (!fs.existsSync(serverPath)) {
      this.warnings.push('Server configuration not found');
      return;
    }

    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check for security middleware
    const securityChecks = [
      { middleware: 'helmet', name: 'Helmet (security headers)' },
      { middleware: 'rateLimit', name: 'Rate limiting' },
      { middleware: 'cors', name: 'CORS' }
    ];

    for (const check of securityChecks) {
      if (serverContent.includes(check.middleware)) {
        console.log(`✅ ${check.name} middleware found`);
      } else {
        this.warnings.push(`${check.name} middleware not found`);
        this.fixes.push(`Add ${check.middleware} middleware for security`);
      }
    }

    // Check for JWT secret configuration
    const jwtSecret = this.envVars.get('JWT_SECRET');
    if (!jwtSecret) {
      this.errors.push('JWT_SECRET not configured');
      this.fixes.push('Set JWT_SECRET environment variable with a strong secret');
    } else if (jwtSecret.includes('${{')) {
      console.log('✅ JWT Secret configured with Railway template variable');
    } else if (jwtSecret.includes('your-super-secret') || jwtSecret.length < 32) {
      this.warnings.push('JWT_SECRET appears to be weak or placeholder');
      this.fixes.push('Use a strong, unique JWT_SECRET (at least 32 characters)');
    }
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    console.log('\n📊 Authentication & CORS Validation Summary');
    console.log('='.repeat(50));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All authentication and CORS validations passed!');
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
      authConfig: this.authConfig,
      corsConfig: this.corsConfig
    };
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new AuthValidator();
  validator.validate().catch(error => {
    console.error('❌ Authentication validation failed:', error);
    process.exit(1);
  });
}

module.exports = AuthValidator;