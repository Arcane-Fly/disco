# Build Tooling Quick Reference Guide

**TL;DR: Use Nx for Disco. Reconsider Bazel if Python/Go/Rust becomes >20% of codebase.**

---

## Quick Decision Chart

```
Is your codebase primarily JavaScript/TypeScript?
│
├─ YES (Disco = 99% JS/TS)
│  │
│  └─ Do you have <5 secondary language files?
│     │
│     ├─ YES (Disco = 1 Python file) ──→ ✅ Use Nx
│     │
│     └─ NO (Multiple Go/Python/Rust services) ──→ Consider Bazel/Pants
│
└─ NO (Heavy Python/ML/Multi-language)
   │
   └─ Do you need hermetic/deterministic builds?
      │
      ├─ YES ──→ ✅ Use Bazel
      │
      └─ NO ──→ Consider Pants or Nx with custom executors
```

---

## When to Choose What

### Choose Nx When:

✅ Primary language is JavaScript/TypeScript  
✅ Using modern JS frameworks (Next.js, React, Express)  
✅ Team is JS-focused  
✅ Need great developer experience  
✅ Want incremental adoption  
✅ Monorepo is small-to-medium (<500 packages)  

**Disco Status: 6/6 criteria met → Nx is ideal**

### Choose Bazel When:

✅ Multiple languages (Python, Go, Rust, Java)  
✅ Need hermetic/deterministic builds  
✅ Very large monorepo (>1000 packages)  
✅ Complex build graph with code generation  
✅ Regulatory compliance for reproducible builds  
✅ Remote execution at massive scale  

**Disco Status: 0/6 criteria met → Bazel is overkill**

### Choose Pants When:

✅ Python-first codebase with some JS  
✅ Need hermetic builds but prefer Python tooling  
✅ Want Bazel-like features with better Python DX  
✅ Complex Python monorepo  

**Disco Status: 0/4 criteria met → Pants unnecessary**

---

## Nx vs Bazel: Head-to-Head

| Aspect | Nx | Bazel | Winner for Disco |
|--------|----|----|------------------|
| **JS/TS Build Speed** | ⚡⚡⚡ | ⚡⚡ | Nx |
| **Learning Curve** | Easy | Hard | Nx |
| **Next.js Support** | Native | Custom | Nx |
| **Setup Time** | 1 day | 1-2 weeks | Nx |
| **Developer UX** | Excellent | Complex | Nx |
| **Python Support** | Good | Excellent | Tie (1 file) |
| **Hermetic Builds** | Good | Perfect | Tie (not needed) |
| **Multi-language** | Good | Excellent | Tie (not needed) |
| **Caching** | Excellent | Excellent | Tie |
| **CI/CD** | Easy | Complex | Nx |

**Overall: Nx wins 7-0-3 for Disco**

---

## Nx Features Cheat Sheet

### Key Benefits for Disco

1. **Incremental Builds**
   ```bash
   # Only builds what changed
   nx build server
   ```

2. **Task Caching**
   ```bash
   # Instant on cache hit
   nx build frontend  # First run: 90s
   nx build frontend  # Cache hit: 0.1s
   ```

3. **Parallel Execution**
   ```bash
   # Builds all projects in parallel
   nx run-many --target=build --all --parallel=3
   ```

4. **Affected Commands**
   ```bash
   # Only test what changed
   nx affected --target=test
   ```

5. **Project Graph**
   ```bash
   # Visualize dependencies
   nx graph
   ```

6. **Terminal UI (Nx 21)**
   ```bash
   # Beautiful TUI for long-running tasks
   nx watch --all -- nx build
   ```

### Quick Setup

```bash
# 1. Install Nx
yarn add -D nx @nx/workspace

# 2. Initialize
npx nx init

# 3. Add plugins
yarn add -D @nx/next @nx/node @nx/jest

# 4. Run commands
nx build server
nx build frontend
nx graph
```

---

## Bazel Gotchas (If You Must Use It)

### Breaking Changes to Know

⚠️ **WORKSPACE is deprecated** - Bazel 9 removes it entirely  
⚠️ **Use Bzlmod** - MODULE.bazel is the new way  
⚠️ **rules_python evolving** - uv integration in flux  
⚠️ **Steep learning curve** - Team needs Starlark training  

### Bazel 7+ Features

✅ Build-without-the-Bytes (BwoB) - Less downloads  
✅ Skymeld - Better caching/parallelism  
✅ Remote execution - Massive scale  

### When It's Worth It

- You're Google/Facebook/Uber scale
- Multiple teams, multiple languages
- Need byte-for-byte reproducible builds
- Have dedicated build team

**Disco Status: None of these apply**

---

## Alternative: Turborepo

### Lighter Alternative to Nx

**Pros:**
- Simpler than Nx
- Good for small monorepos
- Great caching
- Zero config start

**Cons:**
- Less features than Nx
- No code generation
- No project graph visualization
- Smaller ecosystem

**When to Use:**
- Very simple monorepo
- Don't need Nx's advanced features
- Want "just caching"

**Disco Recommendation:** Nx still better due to Next.js integration

---

## Python Tooling: uv

### If Python Usage Grows

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create workspace
uv init

# Add dependencies
uv add fastapi uvicorn

# Run
uv run python main.py
```

### uv Benefits

✅ **Fast** - Rust-based, 10-100x faster than pip  
✅ **Workspace support** - Monorepo-friendly  
✅ **Global cache** - No duplicate downloads  
✅ **Bazel integration** - Can use uv.lock with Bazel  

### Integration Strategy

1. **Today (1 Python file):** No tool needed
2. **5-10 Python files:** Use uv standalone
3. **Python service layer:** Nx + uv (custom executor)
4. **Complex polyglot:** Consider Bazel + uv

---

## Migration Checklist

### Before Starting

- [ ] Backup current build scripts
- [ ] Document current build times
- [ ] Identify critical paths
- [ ] Get team buy-in

### Nx Migration Steps

- [ ] Install Nx dependencies
- [ ] Initialize Nx workspace (`nx init`)
- [ ] Add plugins (@nx/next, @nx/node)
- [ ] Create project.json files
- [ ] Update package.json scripts
- [ ] Test builds locally
- [ ] Update CI/CD workflows
- [ ] Enable Nx Cloud (optional)
- [ ] Train team
- [ ] Measure improvements

### Success Metrics

- [ ] Build time reduced by >30%
- [ ] Developer satisfaction improved
- [ ] CI/CD pipelines faster
- [ ] Fewer "works on my machine" issues
- [ ] Easy to add new projects

---

## Command Comparison

### Current vs Nx

| Task | Current | With Nx |
|------|---------|---------|
| Build all | `yarn build` | `nx run-many --target=build --all` |
| Build server | `yarn build:server` | `nx build server` |
| Build frontend | `yarn build:next` | `nx build frontend` |
| Test all | `yarn test` | `nx run-many --target=test --all` |
| Test changed | Manual | `nx affected --target=test` |
| Lint all | `yarn lint` | `nx run-many --target=lint --all` |
| View graph | N/A | `nx graph` |
| Clear cache | `yarn clean` | `nx reset` |

---

## Cost Analysis

### Nx Costs

**Free:**
- Local caching
- Task orchestration
- Project graph
- Basic features

**Paid (Nx Cloud):**
- Distributed caching: ~$8/dev/month
- Remote execution: Custom pricing
- Analytics: Included

**ROI:** Pays for itself in saved developer time

### Bazel Costs

**Free:**
- Everything (open source)

**Hidden Costs:**
- Training time: 40-80 hours/dev
- Setup time: 1-4 weeks
- Maintenance: Dedicated team
- Migration: Months of work

**ROI:** Only at massive scale

---

## Quick Decision Script

Answer these questions:

1. **Is your codebase >80% JS/TS?** 
   - YES → +1 Nx
   - NO → +1 Bazel

2. **Do you have <10 Python/Go/Rust files?**
   - YES → +1 Nx
   - NO → +1 Bazel

3. **Is developer experience a priority?**
   - YES → +1 Nx
   - NO → +1 Bazel

4. **Do you use Next.js/React/Express?**
   - YES → +1 Nx
   - NO → Neutral

5. **Do you need hermetic builds?**
   - YES → +1 Bazel
   - NO → +1 Nx

6. **Is your team JS-focused?**
   - YES → +1 Nx
   - NO → +1 Bazel

### Scoring

- **Nx ≥ 4 points:** Choose Nx
- **Bazel ≥ 4 points:** Choose Bazel
- **Tie:** Start with Nx (easier to adopt)

**Disco Score: Nx = 6, Bazel = 0 → Clear Nx victory**

---

## Resources

### Nx
- Docs: https://nx.dev
- GitHub: https://github.com/nrwl/nx
- Discord: https://go.nx.dev/community

### Bazel
- Docs: https://bazel.build
- GitHub: https://github.com/bazelbuild/bazel
- Slack: https://slack.bazel.build

### Turborepo
- Docs: https://turbo.build
- GitHub: https://github.com/vercel/turbo

### uv (Python)
- Docs: https://docs.astral.sh/uv
- GitHub: https://github.com/astral-sh/uv

---

## Final Recommendation

```
┌─────────────────────────────────────────────┐
│                                             │
│   Disco Platform Recommendation:           │
│                                             │
│   ✅ Use Nx                                 │
│                                             │
│   • 99% JavaScript/TypeScript               │
│   • Next.js + React + Express               │
│   • Small monorepo (2 main projects)        │
│   • Team is JS-focused                      │
│   • Need great developer experience         │
│                                             │
│   Re-evaluate if:                           │
│   • Python/Go/Rust becomes >20% codebase    │
│   • Need hermetic builds for compliance     │
│   • Monorepo grows to >500 packages         │
│                                             │
└─────────────────────────────────────────────┘
```

---

*Quick Reference Version: 1.0*  
*See BUILD_TOOLING_ANALYSIS.md for detailed analysis*
