# PR Readiness Checklist - Quick Reference

**Last Updated**: 2025-10-13  
**Based On**: Historical PR Analysis (PRs #122-133)

---

## 🎯 Pre-PR Quick Checks

Use this checklist before submitting any PR to ensure alignment with team conventions.

### ✅ Configuration Standards

- [ ] **Railway Config**: Only `railpack.json` exists (no competing configs)
- [ ] **Port Binding**: Server binds to `0.0.0.0:${PORT}` (not localhost)
- [ ] **Health Checks**: `/health` endpoint returns 200
- [ ] **Node Version**: 22.x everywhere (package.json, workflows, railpack.json)
- [ ] **Yarn Version**: 4.9.2 via Corepack everywhere
- [ ] **Immutable Installs**: Using `--immutable` flag (not `--frozen-lockfile`)

### ✅ Code Quality Gates

```bash
# Run all quality checks locally
yarn build              # Must pass
yarn lint              # Must pass (warnings acceptable)
yarn test              # 95%+ pass rate acceptable
yarn typecheck         # Must pass
```

**Expected Results**:
- ✅ Build: No compilation errors
- ✅ Lint: 0 errors (warnings OK if <50)
- ✅ Tests: >95% pass rate
- ✅ TypeScript: No blocking errors

### ✅ Code Conventions

**Naming**:
- Files: `kebab-case.ts`
- Variables/Functions: `camelCase`
- Classes/Interfaces: `PascalCase` (no `I` prefix)
- Booleans: `is`, `has`, `can`, `should` prefix
- Tests: `*.test.ts` or `*.spec.ts`

**Structure**:
```
src/
├── api/           # Route handlers
├── features/      # Feature modules  
├── lib/           # Utilities
├── middleware/    # Express middleware
└── types/         # TypeScript types
```

**TypeScript**:
- Current: Relaxed strict mode (don't change to strict)
- Incremental improvements OK
- Don't block deployment with type errors

**Testing**:
- Pattern: Arrange-Act-Assert
- Location: `test/` directory or adjacent `__tests__/`
- Coverage: Maintain existing levels

### ✅ Documentation

- [ ] **README.md**: Updated if API changes
- [ ] **Session Docs**: Created in `docs/` with `SCREAMING_SNAKE_CASE.md` naming
- [ ] **Code Comments**: Only for complex logic (not obvious things)
- [ ] **Status Indicators**: Use ✅ ❌ ⚠️ in documentation

### ✅ Railway Deployment

**10 Critical Standards** (Must all pass):

1. [ ] Always use `railpack.json` as primary build config
2. [ ] Never hardcode ports - always use `process.env.PORT`
3. [ ] Always bind to `0.0.0.0` not `localhost` or `127.0.0.1`
4. [ ] Reference domains not ports in Railway variables
5. [ ] Include health check endpoint at `/api/health` returning 200
6. [ ] Remove competing build files when using railpack.json
7. [ ] Test locally with Railway environment
8. [ ] Validate JSON syntax before committing railpack.json
9. [ ] Use inputs field only for layer references
10. [ ] Corepack enabled with Yarn 4.9.2

### ✅ GitHub Actions

All workflows must:
- [ ] Use Node.js 22.x
- [ ] Use Yarn 4.9.2 via Corepack
- [ ] Use `yarn install --immutable`
- [ ] Have valid YAML syntax
- [ ] Pass locally before pushing

**Test workflows locally**:
```bash
# Validate YAML
for file in .github/workflows/*.yml; do 
  python3 -c "import yaml; yaml.safe_load(open('$file'))" && echo "✅ $(basename $file)"
done

# Test commands that workflows will run
corepack enable && corepack prepare yarn@4.9.2 --activate
yarn install --immutable
yarn build
yarn test
yarn lint
```

---

## 🚫 Anti-Patterns to Avoid

Based on failed PRs #122-133:

### ❌ Never Do These

1. **Multiple Build Configs**
   - ❌ Having both railpack.json and package.json build commands
   - ❌ Having Railway.toml and railpack.json
   - ✅ Only use railpack.json for Railway

2. **Hardcoded Values**
   - ❌ `server.listen(3000)`
   - ❌ `bind to localhost or 127.0.0.1`
   - ✅ `server.listen(process.env.PORT, '0.0.0.0')`

3. **All-at-once TypeScript Fixes**
   - ❌ Enabling strict mode and fixing 100+ errors at once
   - ✅ Incremental fixes with relaxed mode

4. **Workflow Config Drift**
   - ❌ Updating package.json but not GitHub Actions
   - ✅ Keep Node/Yarn versions consistent everywhere

5. **Deprecated Commands**
   - ❌ `npm install --frozen-lockfile`
   - ❌ `yarn install --frozen-lockfile`
   - ✅ `yarn install --immutable`

6. **Untested Routes**
   - ❌ Deploying new routes without testing
   - ✅ Test all routes in dev before PR

---

## 📊 Quality Metrics Targets

| Metric | Minimum | Target | Current |
|--------|---------|--------|---------|
| Build Success | 100% | 100% | 100% ✅ |
| Test Pass Rate | 90% | 100% | 95.4% ✅ |
| Linting Errors | 0 | 0 | 0 ✅ |
| Linting Warnings | <100 | <50 | 45 ✅ |
| TypeScript Errors | 0 blocking | 0 blocking | 0 ✅ |
| Railway Compliance | 100% | 100% | 100% ✅ |

---

## 🔄 PR Submission Process

### 1. Pre-Submit Validation

```bash
# Local quality gate
yarn build && yarn lint && yarn test

# Railway validation
yarn railway:validate
yarn railway:validate-env
yarn railway:validate-auth
yarn railway:report

# Documentation check
yarn docs:check-links  # Optional
```

### 2. PR Description Template

```markdown
## Summary
[Brief description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Configuration change

## Changes
- Change 1: [description]
- Change 2: [description]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Railway validation passing

## PR Pattern Compliance
- [ ] Follows project architecture
- [ ] Matches naming conventions
- [ ] Railway best practices followed
- [ ] GitHub Actions aligned
- [ ] No anti-patterns introduced

## Quality Metrics
- Build: ✅ Passing
- Tests: X/Y passing (X.X%)
- Lint: ✅ Passing (X warnings)
- TypeScript: ✅ No blocking errors

## Related Issues
Closes #XXX
Related to #YYY

## Documentation
- [ ] README.md updated (if needed)
- [ ] Session docs created (if needed)
- [ ] API docs updated (if needed)

## Railway Checklist
- [ ] Port binding to 0.0.0.0:${PORT}
- [ ] Health check endpoint working
- [ ] Only railpack.json config exists
- [ ] Corepack + Yarn 4.9.2 configured
- [ ] Immutable installs used
```

### 3. Post-Submit Actions

1. **Monitor CI/CD**
   - Watch GitHub Actions workflows
   - Ensure all 5 workflows pass
   - Check for any unexpected failures

2. **Respond to Reviews**
   - Address feedback within 24 hours
   - Ask clarifying questions if needed
   - Update PR based on review comments

3. **Keep Branch Updated**
   - Rebase on master if requested
   - Resolve conflicts promptly
   - Re-run quality checks after updates

---

## 📞 Getting Help

### Common Issues

**Build Failing**:
1. Check Node version: `node --version` (should be 22.x)
2. Check Yarn version: `yarn --version` (should be 4.9.2)
3. Clear cache: `yarn cache clean --all && rm -rf node_modules && yarn install --immutable`

**Tests Failing**:
1. Run specific test: `yarn test <test-file>`
2. Check ESM issues: Known issue with uuid package (11 failures acceptable)
3. Update snapshots if needed: `yarn test -u`

**Linting Errors**:
1. Auto-fix: `yarn lint:fix`
2. Format code: `yarn format`
3. Check specific file: `yarn eslint <file>`

**Railway Validation Failing**:
1. Run individual checks:
   - `yarn railway:validate` - Config
   - `yarn railway:validate-env` - Environment
   - `yarn railway:validate-auth` - Auth setup
2. Check railpack.json syntax: `python3 -c "import json; json.load(open('railpack.json'))"`
3. Review error messages in console

### Documentation References

- Full PR Pattern Analysis: `docs/PR_PATTERN_ANALYSIS_SESSION.md`
- Railway Best Practices: `docs/RAILWAY_BEST_PRACTICES.md`
- GitHub Actions Validation: `docs/GITHUB_ACTIONS_VALIDATION_REPORT.md`
- Master Cheat Sheet: `docs/MASTER_CHEAT_SHEET_IMPLEMENTATION.md`

---

## ✅ Final Checklist

Before clicking "Create Pull Request":

- [ ] All quality gates passing locally
- [ ] Documentation updated
- [ ] PR description complete
- [ ] Railway compliance verified
- [ ] No anti-patterns introduced
- [ ] Commit messages clear
- [ ] Branch name descriptive
- [ ] Conflicts resolved (if any)

**Remember**: It's better to ask questions and ensure quality than to rush a PR that will need revisions.

---

**Quick Command Reference**:

```bash
# Quality gates (must all pass)
yarn build && yarn lint && yarn test

# Railway validation
yarn railway:check-all

# Format code
yarn format

# Run affected tests only
yarn test:affected

# Build and start locally
yarn build && yarn start
curl http://localhost:3000/health

# Check workflow YAML syntax
for f in .github/workflows/*.yml; do python3 -c "import yaml; yaml.safe_load(open('$f'))"; done
```

---

**End of PR Readiness Checklist**
