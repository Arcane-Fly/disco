# Build Tooling Analysis & Recommendations for Disco MCP Platform

## Executive Summary

This document provides a comprehensive analysis of build tooling options for the Disco MCP platform, evaluating **Nx** vs **Bazel/Pants** based on the project's current architecture and future scalability needs.

**Quick Recommendation**: For the current Disco project (JS/TS-heavy with minimal Python), **Nx** is the recommended choice. However, this document provides the decision matrix to re-evaluate if requirements change.

---

## Current State Analysis

### Technology Stack

**Primary Languages & Frameworks:**
- **TypeScript/JavaScript**: ~180 source files (131 backend + 49 frontend)
- **Next.js 15** with App Router (React 19)
- **Express.js** backend with REST APIs
- **Node.js 22.x** runtime
- **Yarn 4.9.2** (Berry) package manager

**Limited Secondary Languages:**
- **Python**: 1 test file only (`scripts/test_disco_mcp.py`)
- No Go, Rust, or other compiled languages

**Build Configuration:**
- TypeScript compiler (`tsc`) for server build
- Next.js bundler for frontend
- No monorepo tool currently configured
- Concurrently for parallel builds

### Project Structure

```
disco/
├── src/              # Backend TypeScript (131 files)
├── frontend/         # Next.js frontend (49 files)
├── extensions/       # VS Code/IntelliJ extensions
├── test/             # Test files
├── scripts/          # Build and validation scripts
└── package.json      # Single root package
```

**Current Build Commands:**
```json
{
  "build": "yarn build:server && yarn build:next",
  "build:server": "tsc -p tsconfig.server.json",
  "build:next": "next build frontend"
}
```

### Identified Pain Points

1. **No Incremental Builds**: Full rebuilds on every change
2. **No Task Orchestration**: Sequential builds only (no intelligent parallelization)
3. **No Dependency Graph**: Can't determine what needs rebuilding
4. **Limited Caching**: No distributed or local task caching
5. **No Code Generation**: Manual updates to generated types/contracts
6. **Manual Coordination**: Developer must know what to build and when

---

## Decision Matrix: Nx vs Bazel/Pants

| Criteria | Current State | Prefer Nx | Prefer Bazel/Pants |
|----------|---------------|-----------|-------------------|
| **Primary Language** | TypeScript/JavaScript (99%) | ✅ Nx is JS-native | ⚠️ Bazel supports but requires more config |
| **Secondary Languages** | Python (1 file only) | ✅ Nx has Python support via custom executors | ⚠️ Overkill for 1 file |
| **Monorepo Size** | Small (single root package, 2 main areas) | ✅ Nx scales well for this size | ⚠️ Bazel is overkill |
| **Developer Experience** | Need improvement | ✅ Nx has excellent DX with TUI, graph visualization | ❌ Bazel has steeper learning curve |
| **Build Speed** | Slow (no caching) | ✅ Nx Cloud provides excellent caching | ✅ Bazel has excellent caching |
| **Hermetic Builds** | Not required | ⚠️ Nx provides good isolation | ✅ Bazel provides perfect hermetic builds |
| **CI/CD Integration** | GitHub Actions | ✅ Nx has native GitHub Actions support | ⚠️ Bazel requires more setup |
| **Framework Support** | Next.js, Express, Jest | ✅ Nx has first-class Next.js support | ⚠️ Bazel requires custom rules |
| **Learning Curve** | Team is JS-focused | ✅ Nx is easier for JS developers | ❌ Bazel requires learning Starlark |
| **Future Polyglot Needs** | Low probability | ⚠️ Nx can handle with custom executors | ✅ Bazel is purpose-built for this |
| **Deployment Target** | Railway (Node.js) | ✅ Nx output works seamlessly | ⚠️ Bazel requires more config |

### Signal Analysis

| Signal | Recommendation |
|--------|----------------|
| **Shared UI/libs across apps** | **Nx** - Already have shared components between frontend/backend; Nx provides excellent graph awareness |
| **Developer experience priority** | **Nx** - Team is JS-focused; Nx 21+ has Terminal UI, better versioning, and lower cognitive overhead |
| **Mixed language requirements** | **Nx** - With only 1 Python file, Nx's custom executors are sufficient; Bazel would be overkill |
| **CI scale & remote caching** | **Nx** - Nx Cloud provides excellent caching for JS workloads without Bazel's complexity |
| **Framework ecosystem** | **Nx** - Next.js 15, React 19, Jest are all first-class citizens in Nx |
| **Migration friction** | **Nx** - Lower friction; can adopt incrementally without rewriting build configs |

---

## Recommendation: Nx for Disco Platform

### Why Nx Wins for This Project

1. **JavaScript-First Optimization**
   - Disco is 99% TypeScript/JavaScript
   - Nx is built specifically for JS/TS monorepos
   - First-class Next.js, React, and Express support

2. **Superior Developer Experience**
   - Nx 21+ Terminal UI for continuous tasks
   - Visual project graph (`nx graph`)
   - Better error messages and debugging
   - Extensive documentation for JS developers

3. **Framework Integration**
   - Native Next.js plugin (`@nx/next`)
   - Native Express plugin (`@nx/express`)
   - Jest integration out of the box
   - TypeScript path mapping support

4. **Incremental Adoption**
   - Can add Nx without restructuring existing code
   - Gradual migration from existing build scripts
   - Minimal disruption to current workflow

5. **Modern Features (Nx 21)**
   - Custom version actions for non-JS languages
   - Improved versioning support
   - Continuous task runners
   - Better monorepo dependency management

6. **Excellent Caching**
   - Local computation caching
   - Nx Cloud for distributed caching
   - Intelligent change detection
   - Faster CI/CD pipelines

### When to Reconsider Bazel/Pants

You should re-evaluate and consider Bazel/Pants if:

1. **Heavy Python/ML Workloads Added**
   - If you add substantial Python services (not just 1 test file)
   - If you need to build/cache Python packages hermetically
   - If you integrate data pipelines or ML models

2. **Multi-Language Services**
   - Adding Go microservices
   - Adding Rust performance-critical code
   - Need C++/native compilation

3. **Hermetic Build Requirements**
   - Regulatory compliance requiring deterministic builds
   - Need to reproduce builds byte-for-byte
   - Complex supply chain security requirements

4. **Massive Scale**
   - Repository grows to 1000+ packages
   - Build times exceed hours even with Nx Cloud
   - Need remote execution at scale

5. **Complex Build Graph**
   - Deep cross-language dependency chains
   - Custom compilation steps for multiple languages
   - Complex code generation pipelines

### Bazel Considerations (If Needed Later)

**Important Bazel Roadmap Notes:**
- **WORKSPACE is deprecated**: Bazel 9 will remove WORKSPACE entirely
- **Bzlmod is the future**: Must use MODULE.bazel for dependencies
- **rules_python evolution**: Integration with `uv` is being discussed
- **Migration cost**: Requires rewriting all build configurations

**Bazel 7+ Features:**
- Build-without-the-Bytes (BwoB) reduces downloads
- Skymeld interleaves analysis and execution
- Better caching and parallelism

**Python Tooling Alternative:**
If Python becomes significant, consider **uv** for Python-specific needs:
- Global cache for dependency deduplication
- Workspace semantics for multiple Python packages
- Can integrate with Bazel later via `uv.lock`

---

## Implementation Roadmap: Adopting Nx

### Phase 1: Foundation (Week 1)

**1.1 Install Nx**
```bash
yarn add -D nx @nx/workspace
```

**1.2 Initialize Nx Workspace**
```bash
npx nx init
```

**1.3 Add Nx Plugins**
```bash
yarn add -D @nx/next @nx/node @nx/jest @nx/eslint
```

### Phase 2: Project Configuration (Week 1-2)

**2.1 Define Projects**

Create `nx.json`:
```json
{
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"]
    },
    "test": {
      "cache": true
    },
    "lint": {
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["!{projectRoot}/**/*.spec.ts"]
  }
}
```

**2.2 Configure Backend Project**

Create `project.json` in root:
```json
{
  "name": "server",
  "sourceRoot": "src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/node:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist",
        "main": "src/server.ts",
        "tsConfig": "tsconfig.server.json"
      }
    },
    "serve": {
      "executor": "@nx/node:execute",
      "options": {
        "buildTarget": "server:build"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "options": {
        "jestConfig": "jest.config.json"
      }
    }
  }
}
```

**2.3 Configure Frontend Project**

Create `frontend/project.json`:
```json
{
  "name": "frontend",
  "sourceRoot": "frontend",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/next:build",
      "outputs": ["{projectRoot}/.next"],
      "options": {
        "root": "frontend",
        "outputPath": "frontend/.next"
      }
    },
    "serve": {
      "executor": "@nx/next:server",
      "options": {
        "buildTarget": "frontend:build",
        "dev": true
      }
    }
  }
}
```

### Phase 3: Task Orchestration (Week 2)

**3.1 Update Build Scripts**

Replace in `package.json`:
```json
{
  "scripts": {
    "build": "nx run-many --target=build --all",
    "build:server": "nx build server",
    "build:frontend": "nx build frontend",
    "test": "nx run-many --target=test --all",
    "lint": "nx run-many --target=lint --all",
    "graph": "nx graph"
  }
}
```

**3.2 Enable Parallel Execution**

Nx automatically parallelizes independent tasks based on the project graph.

**3.3 Visualize Dependencies**
```bash
nx graph
```

### Phase 4: Caching & Optimization (Week 3)

**4.1 Configure Local Caching**

Already enabled by default in `nx.json` targetDefaults.

**4.2 Set Up Nx Cloud (Optional)**
```bash
npx nx connect-to-nx-cloud
```

Benefits:
- Distributed caching across CI and local machines
- Remote cache hits for unchanged code
- Build analytics and insights

**4.3 Optimize CI/CD**

Update `.github/workflows`:
```yaml
- name: Setup Nx
  uses: nrwl/nx-set-shas@v3

- name: Build with Nx
  run: npx nx affected --target=build --parallel=3

- name: Test with Nx
  run: npx nx affected --target=test --parallel=3
```

### Phase 5: Advanced Features (Week 4+)

**5.1 Code Generators**

Create custom generators for:
- New API endpoints
- New React components
- New test files

**5.2 Project Boundaries**

Enforce architectural constraints:
```json
{
  "nx": {
    "enforce": {
      "constraints": [
        {
          "sourceTag": "scope:frontend",
          "onlyDependOnLibsWithTags": ["scope:frontend", "scope:shared"]
        }
      ]
    }
  }
}
```

**5.3 Module Federation (Future)**

If you split frontend into micro-frontends:
```bash
yarn add -D @nx/react
nx g @nx/react:host shell
nx g @nx/react:remote mfe
```

---

## Migration Strategy: Minimal Disruption

### Incremental Adoption Path

1. **Keep Existing Scripts Working**
   - Maintain compatibility with current `yarn build`
   - Nx can wrap existing commands initially
   - No forced restructuring

2. **Adopt Per-Project**
   - Start with backend (`server`)
   - Then frontend
   - Then extensions

3. **Gradual Optimization**
   - Start with basic task running
   - Add caching once confident
   - Enable Nx Cloud when ready

4. **Team Training**
   - Run `nx graph` to visualize structure
   - Share Nx documentation
   - Pair programming for first tasks

### Rollback Plan

If Nx doesn't work out:
1. Keep `package.json` scripts as fallback
2. Nx is non-invasive; can be removed easily
3. Only configuration files (`nx.json`, `project.json`) need cleanup

---

## Performance Expectations

### Current Build Times (Estimated)

- **Full Build**: ~2-3 minutes
- **Server Only**: ~30 seconds
- **Frontend Only**: ~1-2 minutes
- **Tests**: ~30 seconds

### With Nx (Estimated Improvements)

**First Build (Cold Cache):**
- Similar to current (~2-3 minutes)
- One-time setup cost

**Subsequent Builds (Warm Cache):**
- **No changes**: Instant (cache hit)
- **Server changes only**: ~30 seconds (frontend cached)
- **Frontend changes only**: ~1-2 minutes (server cached)
- **Small changes**: 50-70% faster due to incremental compilation

**With Nx Cloud:**
- **CI builds**: 70-90% faster (distributed cache)
- **Local builds**: 50-80% faster (team shares cache)

### ROI Calculation

**Time Investment:**
- Setup: 4-8 hours
- Learning: 8-16 hours (team)
- Optimization: 4-8 hours

**Time Savings:**
- Per developer per day: 30-60 minutes
- Team of 5: 2.5-5 hours/day
- Monthly savings: 50-100+ hours

**Break-even**: 2-4 weeks

---

## Alternative: Stay Simple (Valid Option)

### When NOT to Adopt Nx

You might skip Nx if:

1. **Project Stays Small**
   - Single developer
   - No planned expansion
   - Current build times acceptable

2. **Short-Lived Project**
   - Prototype or POC
   - Not planning long-term maintenance

3. **Simple Build Needs**
   - No shared libraries
   - No complex dependencies
   - Sequential builds are fine

### Improvements Without Nx

You can still improve current setup:

1. **Add TypeScript Project References**
```json
// tsconfig.json
{
  "references": [
    { "path": "./tsconfig.server.json" },
    { "path": "./frontend/tsconfig.json" }
  ]
}
```

2. **Use Turborepo (Lighter Alternative)**
```bash
yarn add -D turbo
```

Simpler than Nx but less features.

3. **Improve Scripts**
```json
{
  "build": "npm-run-all --parallel build:*",
  "build:server": "tsc -p tsconfig.server.json",
  "build:frontend": "next build frontend"
}
```

---

## Conclusion

### Summary

**For Disco Platform: Choose Nx**

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Primary Tool** | Nx 21+ | JS-native, great DX, modern features |
| **Timeframe** | Adopt in 4 weeks | Incremental, low-risk migration |
| **Caching** | Start local, add Cloud later | Immediate benefits, scale as needed |
| **Bazel/Pants** | Monitor, don't adopt | Revisit if polyglot needs emerge |

### Key Takeaways

1. **Nx is the right choice today** for this JS-heavy project
2. **Re-evaluate** if Python/Go/Rust become substantial (>20% codebase)
3. **Incremental adoption** minimizes risk and disruption
4. **Bazel/Pants** remain viable options for future polyglot scenarios
5. **uv for Python** if Python usage grows (integrate with Nx)

### Next Steps

1. **Review this document** with the team
2. **Run proof-of-concept** with Nx on one project
3. **Measure** build time improvements
4. **Decide** on full adoption or alternatives
5. **Document learnings** for future reference

### Resources

**Nx Resources:**
- [Nx Documentation](https://nx.dev)
- [Nx 21 Release Notes](https://nx.dev/blog/nx-21-release)
- [Next.js with Nx](https://nx.dev/recipes/next)

**Bazel Resources:**
- [Bazel Documentation](https://bazel.build)
- [Bazel Roadmap](https://bazel.build/about/roadmap)
- [rules_python](https://github.com/bazelbuild/rules_python)

**Alternative Tools:**
- [Turborepo](https://turbo.build)
- [uv Python Package Manager](https://github.com/astral-sh/uv)

---

## Appendix: Decision Matrix Expanded

### Detailed Comparison Table

| Feature | Nx | Bazel | Pants | Current (None) |
|---------|----|----|-------|----------------|
| **Setup Complexity** | Low-Medium | High | High | N/A |
| **JS/TS Support** | Excellent | Good | Good | Manual |
| **Python Support** | Good (via executors) | Excellent | Excellent | Manual |
| **Build Speed (cached)** | Very Fast | Very Fast | Very Fast | Slow |
| **Build Speed (uncached)** | Fast | Medium | Medium | Medium |
| **Developer Learning Curve** | Gentle | Steep | Steep | N/A |
| **CI/CD Integration** | Excellent | Good | Good | Manual |
| **Incremental Builds** | Yes | Yes | Yes | No |
| **Remote Caching** | Yes (Nx Cloud) | Yes (Bazel Remote) | Yes (Pants Remote) | No |
| **Code Generation** | Built-in | Custom | Custom | Manual |
| **Migration Effort** | Low | High | High | N/A |
| **Community (JS)** | Large | Medium | Small | N/A |
| **Next.js Support** | Native | Custom Rules | Custom Rules | Native |
| **TypeScript Support** | Native | Good | Good | Native |
| **Cost** | Free (Cloud is paid) | Free | Free | Free |

### Scoring Matrix (Disco Project Context)

| Criteria | Weight | Nx Score | Bazel Score | Pants Score |
|----------|--------|----------|-------------|-------------|
| JS/TS Excellence | 30% | 10 | 7 | 7 |
| Developer Experience | 20% | 9 | 6 | 6 |
| Build Performance | 15% | 8 | 9 | 9 |
| Migration Effort | 15% | 9 | 4 | 4 |
| Framework Support | 10% | 10 | 6 | 6 |
| Future Flexibility | 10% | 7 | 9 | 9 |
| **Weighted Total** | **100%** | **8.8** | **6.9** | **6.9** |

**Winner: Nx (8.8/10)** - Clear winner for current JS-focused architecture

---

*Document Version: 1.0*  
*Last Updated: 2025*  
*Next Review: When Python/Go/Rust becomes >20% of codebase*
