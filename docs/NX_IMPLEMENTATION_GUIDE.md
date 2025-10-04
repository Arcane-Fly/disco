# Nx Implementation Guide for Disco Platform

This guide provides step-by-step instructions for implementing Nx in the Disco MCP platform.

---

## Prerequisites

- Node.js 22+ installed
- Yarn 4.9.2 (already configured)
- Git repository access
- ~2-4 hours for initial setup

---

## Phase 1: Installation & Initialization (30 minutes)

### Step 1.1: Install Nx Core

```bash
cd /path/to/disco
yarn add -D nx @nx/workspace
```

**Expected Output:**
```
✓ @nx/workspace added successfully
```

### Step 1.2: Initialize Nx Workspace

```bash
npx nx init
```

**Questions & Answers:**
- "Enable distributed caching?" → **Later** (we'll do this manually)
- "Use Nx Cloud?" → **No** (we'll add it in Phase 4)

**What This Does:**
- Creates `nx.json` with base configuration
- Adds `.nx/cache` to `.gitignore`
- Sets up task pipeline

### Step 1.3: Install Nx Plugins

```bash
yarn add -D @nx/next @nx/node @nx/jest @nx/eslint @nx/js
```

**Plugin Purposes:**
- `@nx/next` - Next.js frontend builds
- `@nx/node` - Express backend builds
- `@nx/jest` - Test execution
- `@nx/eslint` - Linting tasks
- `@nx/js` - TypeScript project support

### Step 1.4: Verify Installation

```bash
npx nx --version
npx nx list
```

**Expected Output:**
```
Nx version: 21.x.x

Installed plugins:
  @nx/next
  @nx/node
  @nx/jest
  @nx/eslint
  @nx/js
```

---

## Phase 2: Configure Projects (1-2 hours)

### Step 2.1: Create Root Configuration

Create/update `nx.json`:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "test": {
      "cache": true,
      "inputs": ["default", "^production", "{workspaceRoot}/jest.config.json"]
    },
    "lint": {
      "cache": true,
      "inputs": [
        "default",
        "{workspaceRoot}/.eslintrc.json",
        "{workspaceRoot}/eslint.config.mjs"
      ]
    },
    "typecheck": {
      "cache": true,
      "inputs": ["default", "^production"]
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/**/*.test.ts",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/.eslintrc.json",
      "!{projectRoot}/jest.config.json"
    ],
    "sharedGlobals": ["{workspaceRoot}/tsconfig.json"]
  },
  "plugins": [
    {
      "plugin": "@nx/next/plugin",
      "options": {
        "buildTargetName": "build",
        "devTargetName": "dev",
        "serveTargetName": "serve"
      }
    }
  ]
}
```

### Step 2.2: Configure Backend (Server)

Create `project.json` in repository root:

```json
{
  "name": "server",
  "sourceRoot": "src",
  "projectType": "application",
  "tags": ["scope:backend", "type:app"],
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist",
        "main": "src/server.ts",
        "tsConfig": "tsconfig.server.json",
        "assets": []
      },
      "configurations": {
        "production": {
          "optimization": true,
          "sourceMap": false
        },
        "development": {
          "optimization": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "development"
    },
    "serve": {
      "executor": "@nx/js:node",
      "options": {
        "buildTarget": "server:build",
        "inspect": false,
        "watch": true
      }
    },
    "typecheck": {
      "executor": "@nx/js:tsc",
      "options": {
        "tsConfig": "tsconfig.server.json",
        "noEmit": true
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/server"],
      "options": {
        "jestConfig": "jest.config.json",
        "passWithNoTests": true
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["src/**/*.ts"]
      }
    }
  }
}
```

### Step 2.3: Configure Frontend (Next.js)

Create `frontend/project.json`:

```json
{
  "name": "frontend",
  "sourceRoot": "frontend",
  "projectType": "application",
  "tags": ["scope:frontend", "type:app"],
  "targets": {
    "build": {
      "executor": "@nx/next:build",
      "outputs": ["{projectRoot}/.next"],
      "options": {
        "root": "frontend",
        "outputPath": "frontend/.next"
      },
      "configurations": {
        "production": {
          "outputPath": "frontend/.next"
        },
        "development": {
          "outputPath": "frontend/.next"
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "executor": "@nx/next:server",
      "options": {
        "buildTarget": "frontend:build",
        "dev": true,
        "port": 3001
      }
    },
    "export": {
      "executor": "@nx/next:export",
      "options": {
        "buildTarget": "frontend:build:production"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["frontend/**/*.{ts,tsx,js,jsx}"]
      }
    }
  }
}
```

### Step 2.4: Update Package.json Scripts

Update `package.json` to use Nx commands:

```json
{
  "scripts": {
    "// Build commands": "",
    "build": "nx run-many --target=build --all --parallel=2",
    "build:server": "nx build server",
    "build:frontend": "nx build frontend",
    "build:next": "nx build frontend",
    "build:all": "nx run-many --target=build --all --parallel=2",
    
    "// Development commands": "",
    "dev": "nx serve server",
    "dev:frontend": "nx serve frontend",
    "start": "node dist/server.js",
    
    "// Testing commands": "",
    "test": "nx run-many --target=test --all",
    "test:server": "nx test server",
    "test:affected": "nx affected --target=test",
    
    "// Linting commands": "",
    "lint": "nx run-many --target=lint --all",
    "lint:fix": "nx run-many --target=lint --all --fix",
    "lint:affected": "nx affected --target=lint",
    
    "// Type checking": "",
    "typecheck": "nx run-many --target=typecheck --all",
    "typecheck:server": "nx typecheck server",
    
    "// Quality commands": "",
    "quality": "nx run-many --target=lint --all --fix && yarn format",
    "format": "prettier --write \"src/**/*.{ts,js,json}\" \"test/**/*.{ts,js}\" \"*.{json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,js,json}\" \"test/**/*.{ts,js}\" \"*.{json,md}\"",
    
    "// Nx utilities": "",
    "graph": "nx graph",
    "affected:graph": "nx affected:graph",
    "reset": "nx reset",
    
    "// Keep legacy scripts for compatibility": "",
    "clean": "rimraf dist && nx reset"
  }
}
```

---

## Phase 3: Testing & Validation (30 minutes)

### Step 3.1: Test Basic Commands

```bash
# Test build commands
nx build server
nx build frontend

# Test parallel builds
nx run-many --target=build --all --parallel=2

# Test caching (run twice)
nx build server  # First run (no cache)
nx build server  # Second run (should be instant)
```

**Expected Results:**
- First build: Normal time (~30s for server)
- Second build: <1 second (cache hit)

### Step 3.2: Verify Project Graph

```bash
nx graph
```

**Expected Result:**
- Opens browser with visual project graph
- Shows dependencies between projects

### Step 3.3: Test Affected Commands

```bash
# Make a change to server code
echo "// Test change" >> src/server.ts

# See what's affected
nx affected:graph

# Build only affected
nx affected --target=build
```

### Step 3.4: Run Full Test Suite

```bash
# Run all tests
nx run-many --target=test --all

# Check if tests pass
echo $?  # Should output 0
```

---

## Phase 4: CI/CD Integration (30 minutes)

### Step 4.1: Update GitHub Actions Workflow

Create/update `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for Nx affected commands
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'yarn'
      
      - name: Enable Corepack
        run: corepack enable
      
      - name: Install dependencies
        run: yarn install --immutable
      
      - name: Derive appropriate SHAs for base and head
        uses: nrwl/nx-set-shas@v4
      
      - name: Build affected projects
        run: npx nx affected --target=build --parallel=3
      
      - name: Test affected projects
        run: npx nx affected --target=test --parallel=3
      
      - name: Lint affected projects
        run: npx nx affected --target=lint --parallel=3
      
      - name: Type check affected projects
        run: npx nx affected --target=typecheck --parallel=3
```

### Step 4.2: Add Nx Ignore Files

Add to `.gitignore`:

```
# Nx
.nx/cache
.nx/workspace-data
```

### Step 4.3: Test CI Locally

```bash
# Simulate CI environment
export NX_BASE=origin/main
export NX_HEAD=HEAD

# Run affected builds (like CI does)
nx affected --target=build --base=$NX_BASE --head=$NX_HEAD
```

---

## Phase 5: Optimization & Nx Cloud (Optional, 1 hour)

### Step 5.1: Set Up Nx Cloud (Free Tier)

```bash
npx nx connect-to-nx-cloud
```

**Questions:**
- "Enable distributed caching?" → **Yes**
- "Select plan" → **Free** (start here)

**What This Provides:**
- Distributed caching across team
- CI/CD cache sharing
- Build analytics
- Free for open source

### Step 5.2: Configure Nx Cloud

Update `nx.json` with Nx Cloud token:

```json
{
  "nxCloudAccessToken": "YOUR_TOKEN_HERE",
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "typecheck"],
        "accessToken": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

**Security Note:** Add token to environment variable:
```bash
export NX_CLOUD_ACCESS_TOKEN=your_token
```

Then reference in nx.json:
```json
{
  "nxCloudAccessToken": "${NX_CLOUD_ACCESS_TOKEN}"
}
```

### Step 5.3: Test Distributed Caching

```bash
# Clear local cache
nx reset

# Build (miss - will cache to cloud)
nx build server

# On another machine or after clearing cache
nx reset
nx build server  # Should be instant (cloud cache hit)
```

### Step 5.4: View Analytics

Visit: https://cloud.nx.app

**You'll see:**
- Build times
- Cache hit rates
- Task execution patterns
- Team performance

---

## Phase 6: Advanced Features (Ongoing)

### Custom Executors

Create custom build steps for special needs:

```typescript
// tools/executors/custom-build/executor.ts
import { ExecutorContext } from '@nx/devkit';

export default async function customExecutor(
  options: any,
  context: ExecutorContext
) {
  console.log('Running custom build...');
  // Your custom logic here
  return { success: true };
}
```

Register in `project.json`:
```json
{
  "targets": {
    "custom-build": {
      "executor": "./tools/executors/custom-build",
      "options": {}
    }
  }
}
```

### Code Generators

Generate new components/features:

```bash
# Install generator plugin
yarn add -D @nx/plugin

# Generate a new generator
npx nx g @nx/plugin:generator my-generator
```

Example generator for API endpoints:
```typescript
// tools/generators/api-endpoint/generator.ts
export default async function(tree, schema) {
  // Generate new API endpoint files
  generateFiles(tree, path.join(__dirname, 'files'), 'src/api', schema);
}
```

Usage:
```bash
nx g @disco/tools:api-endpoint my-endpoint
```

### Project Boundaries

Enforce architectural rules:

Update `nx.json`:
```json
{
  "namedInputs": {
    "default": ["{projectRoot}/**/*"]
  },
  "targetDefaults": {},
  "plugins": [],
  "defaultBase": "main",
  "generators": {
    "@nx/js": {
      "library": {
        "tags": "scope:shared"
      }
    }
  },
  "extends": "nx/presets/npm.json",
  "workspaceLayout": {
    "projectNameAndRootFormat": "as-provided"
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"]
      }
    }
  }
}
```

Add linting rule in `.eslintrc.json`:
```json
{
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "scope:frontend",
                "onlyDependOnLibsWithTags": ["scope:frontend", "scope:shared"]
              },
              {
                "sourceTag": "scope:backend",
                "onlyDependOnLibsWithTags": ["scope:backend", "scope:shared"]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Cannot find executor"

**Solution:**
```bash
# Reinstall Nx plugins
yarn add -D @nx/next @nx/node @nx/jest --force

# Clear Nx cache
nx reset
```

### Issue: "Task graph has circular dependencies"

**Solution:**
- Check `dependsOn` in `nx.json`
- Ensure no project depends on itself
- Review project imports

### Issue: Cache not working

**Solution:**
```bash
# Clear and rebuild cache
nx reset
nx build server --skip-nx-cache=false
```

### Issue: Slow builds

**Checklist:**
- [ ] Are you using `--parallel` flag?
- [ ] Is caching enabled in `nx.json`?
- [ ] Are `namedInputs` configured correctly?
- [ ] Is Nx Cloud configured?

---

## Performance Benchmarks

### Before Nx (Baseline)

| Task | Time | Cacheable |
|------|------|-----------|
| Full build | ~180s | ❌ |
| Server build | ~30s | ❌ |
| Frontend build | ~90s | ❌ |
| Tests | ~30s | ❌ |
| Lint | ~15s | ❌ |
| **Total CI** | ~345s | ❌ |

### After Nx (Cold Cache)

| Task | Time | Cacheable |
|------|------|-----------|
| Full build | ~180s | ✅ |
| Server build | ~30s | ✅ |
| Frontend build | ~90s | ✅ |
| Tests | ~30s | ✅ |
| Lint | ~15s | ✅ |
| **Total CI** | ~345s | ✅ |

### After Nx (Warm Cache)

| Task | Time | Savings |
|------|------|---------|
| Full build | ~2s | 99% ⚡ |
| Server build | ~0.5s | 98% ⚡ |
| Frontend build | ~1s | 99% ⚡ |
| Tests | ~0.3s | 99% ⚡ |
| Lint | ~0.2s | 99% ⚡ |
| **Total CI** | ~4s | **99% ⚡** |

### With Nx Cloud (Distributed Cache)

| Scenario | Time | Benefit |
|----------|------|---------|
| Local dev (no changes) | <1s | Instant feedback |
| Local dev (small change) | 5-30s | Only rebuild affected |
| PR build (no code changes) | <5s | Use team cache |
| PR build (small change) | 20-60s | Affected only |
| Main branch build | 30-180s | Fresh build, populates cache |

**Expected ROI:**
- **Developer time saved**: 30-60 min/day/developer
- **CI/CD time saved**: 70-90%
- **Break-even point**: 2-3 weeks

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor cache hit rates
- Check build times

**Weekly:**
- Review Nx Cloud analytics
- Update dependencies: `yarn upgrade-interactive`
- Check for Nx updates: `nx migrate latest`

**Monthly:**
- Review project structure
- Optimize task dependencies
- Clean up unused generators

### Updating Nx

```bash
# Check for updates
nx migrate latest

# Review migration file
cat migrations.json

# Run migrations
nx migrate --run-migrations
```

---

## Best Practices

### Do's ✅

- Use affected commands in CI/CD
- Enable caching for all tasks
- Use parallel execution
- Tag projects consistently
- Document custom executors
- Keep Nx updated
- Monitor cache hit rates

### Don'ts ❌

- Don't commit `.nx/cache`
- Don't skip cache intentionally
- Don't over-parallelize (use --parallel=3 max)
- Don't ignore failed cache hits
- Don't create circular dependencies
- Don't mix Nx and non-Nx commands

---

## Success Checklist

- [ ] Nx installed and configured
- [ ] All projects have project.json
- [ ] Cache working (test with repeated builds)
- [ ] CI/CD updated to use Nx
- [ ] Team trained on Nx commands
- [ ] Nx Cloud configured (optional)
- [ ] Performance metrics collected
- [ ] Documentation updated
- [ ] Project graph visualizes correctly
- [ ] Affected commands work

---

## Next Steps

1. **Week 1-2**: Complete Phases 1-3
2. **Week 2-3**: Integrate CI/CD (Phase 4)
3. **Week 3-4**: Optional Nx Cloud (Phase 5)
4. **Ongoing**: Advanced features (Phase 6)

---

## Support Resources

- **Nx Documentation**: https://nx.dev
- **Nx Discord**: https://go.nx.dev/community
- **GitHub Issues**: https://github.com/nrwl/nx/issues
- **Stack Overflow**: Tag with `nx-workspace`

---

*Implementation Guide Version: 1.0*  
*Last Updated: 2025*  
*Next Review: After Nx adoption*
