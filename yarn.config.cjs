/**
 * Yarn Constraints Configuration
 * Following Railway + Yarn 4.9.2+ Master Cheat Sheet guidelines
 */

module.exports = {
  constraints: async ({Yarn}) => {
    // Ensure Node.js version consistency
    for (const workspace of Yarn.workspaces()) {
      const pkg = workspace.manifest;
      
      // Standardize Node.js version requirement
      if (pkg.engines && pkg.engines.node) {
        workspace.set('engines.node', '>=20.0.0');
      }
      
      // Ensure consistent package manager
      if (!pkg.packageManager || !pkg.packageManager.startsWith('yarn@4.9.2')) {
        workspace.set('packageManager', 'yarn@4.9.2');
      }
      
      // License standardization
      if (pkg.license && pkg.license !== 'MIT') {
        workspace.set('license', 'MIT');
      }
      
      // Repository standardization
      if (pkg.repository && typeof pkg.repository === 'object') {
        workspace.set('repository.type', 'git');
        if (!pkg.repository.url.includes('github.com/Arcane-Fly/disco')) {
          workspace.set('repository.url', 'https://github.com/Arcane-Fly/disco.git');
        }
      }
      
      // TypeScript dependency consistency
      const typescript = pkg.dependencies?.typescript || pkg.devDependencies?.typescript;
      if (typescript && !typescript.startsWith('^5.')) {
        if (pkg.dependencies?.typescript) {
          workspace.set('dependencies.typescript', '^5.6.3');
        }
        if (pkg.devDependencies?.typescript) {
          workspace.set('devDependencies.typescript', '^5.6.3');
        }
      }
      
      // ESLint dependency consistency
      const eslint = pkg.dependencies?.eslint || pkg.devDependencies?.eslint;
      if (eslint && !eslint.startsWith('^8.')) {
        if (pkg.dependencies?.eslint) {
          workspace.set('dependencies.eslint', '^8.57.1');
        }
        if (pkg.devDependencies?.eslint) {
          workspace.set('devDependencies.eslint', '^8.57.1');
        }
      }
      
      // Express dependency consistency (for API packages)
      const express = pkg.dependencies?.express;
      if (express && !express.startsWith('^4.')) {
        workspace.set('dependencies.express', '^4.21.2');
      }
      
      // React dependency consistency (for frontend packages)
      const react = pkg.dependencies?.react || pkg.devDependencies?.react;
      if (react) {
        const reactVersion = '^18.3.1';
        if (pkg.dependencies?.react && pkg.dependencies.react !== reactVersion) {
          workspace.set('dependencies.react', reactVersion);
        }
        if (pkg.devDependencies?.react && pkg.devDependencies.react !== reactVersion) {
          workspace.set('devDependencies.react', reactVersion);
        }
        
        // Ensure React DOM version matches
        if (pkg.dependencies?.['react-dom']) {
          workspace.set('dependencies.react-dom', reactVersion);
        }
        if (pkg.devDependencies?.['react-dom']) {
          workspace.set('devDependencies.react-dom', reactVersion);
        }
      }
      
      // Next.js dependency consistency
      const next = pkg.dependencies?.next || pkg.devDependencies?.next;
      if (next && !next.startsWith('^15.')) {
        if (pkg.dependencies?.next) {
          workspace.set('dependencies.next', '^15.1.3');
        }
        if (pkg.devDependencies?.next) {
          workspace.set('devDependencies.next', '^15.1.3');
        }
      }
      
      // MCP SDK consistency
      const mcpSdk = pkg.dependencies?.['@modelcontextprotocol/sdk'];
      if (mcpSdk && !mcpSdk.startsWith('^1.')) {
        workspace.set('dependencies.@modelcontextprotocol/sdk', '^1.18.2');
      }
    }
  }
};