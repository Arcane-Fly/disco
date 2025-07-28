#!/usr/bin/env node
/**
 * Railway Configuration Validation Agent
 * Validates railway.toml, railway.json, railpack.json, Dockerfile, and application configs
 */

const fs = require('fs');
const path = require('path');

class RailwayConfigValidator {
  constructor(projectPath = '.') {
    this.projectPath = projectPath;
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
    this.config = null;
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log('🔍 Starting Railway Configuration Validation...\n');
    
    try {
      await this.loadRailwayConfig();
      await this.validatePortConfiguration();
      await this.validateBuildConfiguration();
      await this.validateDeploymentConfiguration();
      await this.validateDockerConfiguration();
      await this.validatePackageJson();
      
      this.generateSummary();
      
      if (this.errors.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load Railway configuration files
   */
  async loadRailwayConfig() {
    const railpackPath = path.join(this.projectPath, 'railpack.json');
    const railwayTomlPath = path.join(this.projectPath, 'railway.toml');
    const railwayJsonPath = path.join(this.projectPath, 'railway.json');

    // Check for railpack.json (primary)
    if (fs.existsSync(railpackPath)) {
      try {
        const content = fs.readFileSync(railpackPath, 'utf8');
        this.config = JSON.parse(content);
        console.log('✅ Found and loaded railpack.json');
        return;
      } catch (error) {
        this.errors.push(`Invalid railpack.json: ${error.message}`);
      }
    }

    // Check for railway.json
    if (fs.existsSync(railwayJsonPath)) {
      try {
        const content = fs.readFileSync(railwayJsonPath, 'utf8');
        this.config = JSON.parse(content);
        console.log('✅ Found and loaded railway.json');
        return;
      } catch (error) {
        this.errors.push(`Invalid railway.json: ${error.message}`);
      }
    }

    // Check for railway.toml
    if (fs.existsSync(railwayTomlPath)) {
      this.warnings.push('Found railway.toml but JSON format is recommended for validation');
      console.log('⚠️  Found railway.toml (TOML parsing not implemented in this validator)');
      return;
    }

    this.errors.push('No Railway configuration file found (railpack.json, railway.json, or railway.toml)');
  }

  /**
   * Validate PORT environment variable usage
   */
  async validatePortConfiguration() {
    console.log('🔍 Validating PORT configuration...');
    
    if (!this.config) {
      this.warnings.push('Cannot validate PORT configuration without Railway config');
      return;
    }

    // Check if startCommand uses PORT
    const startCommand = this.config.deploy?.startCommand;
    if (startCommand && !startCommand.includes('$PORT') && !this.checkSourceFilesForPort()) {
      this.warnings.push('startCommand should use $PORT environment variable for Railway compatibility');
      this.fixes.push('Update startCommand to use $PORT or ensure server listens on process.env.PORT');
    }

    // Check server.ts for proper PORT usage
    const serverPath = path.join(this.projectPath, 'src/server.ts');
    if (fs.existsSync(serverPath)) {
      const serverContent = fs.readFileSync(serverPath, 'utf8');
      if (!serverContent.includes('process.env.PORT')) {
        this.errors.push('server.ts must listen on process.env.PORT for Railway deployment');
        this.fixes.push('Add: const PORT = process.env.PORT || 3000; app.listen(PORT)');
      } else {
        console.log('✅ PORT configuration looks good');
      }
    }
  }

  /**
   * Check source files for PORT usage
   */
  checkSourceFilesForPort() {
    const srcPath = path.join(this.projectPath, 'src');
    if (!fs.existsSync(srcPath)) return false;

    try {
      const files = fs.readdirSync(srcPath, { recursive: true });
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = path.join(srcPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('process.env.PORT')) {
            return true;
          }
        }
      }
    } catch (error) {
      // Fallback for older Node.js versions
      return this.checkDirectoryForPort(srcPath);
    }
    return false;
  }

  checkDirectoryForPort(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (this.checkDirectoryForPort(filePath)) return true;
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('process.env.PORT')) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Validate build configuration
   */
  async validateBuildConfiguration() {
    console.log('🔍 Validating build configuration...');
    
    if (!this.config) return;

    // Check for build steps
    if (!this.config.steps?.build) {
      this.warnings.push('No build step defined in Railway config');
      this.fixes.push('Add build step: { "commands": ["npm run build"] }');
    } else {
      const buildCommands = this.config.steps.build.commands || [];
      if (!buildCommands.includes('npm run build') && !buildCommands.includes('yarn build')) {
        this.warnings.push('Build step should include npm run build or yarn build');
      } else {
        console.log('✅ Build configuration looks good');
      }
    }

    // Check package.json for build script
    const packagePath = path.join(this.projectPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      if (!packageJson.scripts?.build) {
        this.errors.push('package.json missing build script');
        this.fixes.push('Add "build": "tsc" to package.json scripts');
      }
    }
  }

  /**
   * Validate deployment configuration
   */
  async validateDeploymentConfiguration() {
    console.log('🔍 Validating deployment configuration...');
    
    if (!this.config) return;

    const deploy = this.config.deploy;
    if (!deploy) {
      this.errors.push('Missing deploy configuration in Railway config');
      return;
    }

    // Validate startCommand
    if (!deploy.startCommand) {
      this.errors.push('Missing startCommand in deploy configuration');
      this.fixes.push('Add startCommand: "node dist/server.js"');
    } else {
      console.log('✅ Start command configured');
    }

    // Check for proper Node.js runtime
    if (this.config.provider !== 'node' && !deploy.base?.image?.includes('node')) {
      this.warnings.push('Consider using Node.js runtime for better Railway integration');
    }
  }

  /**
   * Validate Docker configuration if present
   */
  async validateDockerConfiguration() {
    const dockerfilePath = path.join(this.projectPath, 'Dockerfile');
    if (!fs.existsSync(dockerfilePath)) {
      console.log('ℹ️  No Dockerfile found (using Railway buildpacks)');
      return;
    }

    console.log('🔍 Validating Dockerfile...');
    const dockerContent = fs.readFileSync(dockerfilePath, 'utf8');

    // Check for EXPOSE directive
    if (!dockerContent.includes('EXPOSE')) {
      this.warnings.push('Dockerfile should include EXPOSE directive for port documentation');
      this.fixes.push('Add: EXPOSE $PORT');
    }

    // Check for proper CMD or ENTRYPOINT
    if (!dockerContent.includes('CMD') && !dockerContent.includes('ENTRYPOINT')) {
      this.errors.push('Dockerfile missing CMD or ENTRYPOINT directive');
    } else {
      console.log('✅ Dockerfile configuration looks good');
    }
  }

  /**
   * Validate package.json configuration
   */
  async validatePackageJson() {
    console.log('🔍 Validating package.json...');
    
    const packagePath = path.join(this.projectPath, 'package.json');
    if (!fs.existsSync(packagePath)) {
      this.errors.push('Missing package.json file');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Check for required scripts
    const requiredScripts = ['build', 'start'];
    for (const script of requiredScripts) {
      if (!packageJson.scripts?.[script]) {
        this.errors.push(`Missing ${script} script in package.json`);
        this.fixes.push(`Add "${script}" script to package.json`);
      }
    }

    // Check Node.js version compatibility
    if (packageJson.engines?.node) {
      console.log(`✅ Node.js version constraint: ${packageJson.engines.node}`);
    } else {
      this.warnings.push('Consider adding Node.js version constraint in engines field');
      this.fixes.push('Add "engines": { "node": ">=20.0.0" } to package.json');
    }
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    console.log('\n📊 Railway Configuration Validation Summary');
    console.log('='.repeat(50));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All validations passed! Configuration looks good.');
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
      success: this.errors.length === 0
    };
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new RailwayConfigValidator();
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = RailwayConfigValidator;