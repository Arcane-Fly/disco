# CodeQL Configuration Fix - GitHub Actions Failure Resolution

**Date**: 2025-10-07  
**Issue**: CodeQL workflow failing due to default setup conflict  
**Priority**: HIGH - Blocking security scanning  
**Status**: REQUIRES MANUAL INTERVENTION

---

## Problem Statement

The CodeQL Analysis workflow is failing with the following error:

```
Code Scanning could not process the submitted SARIF file:
CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled
```

**Failed Run**: https://github.com/Arcane-Fly/disco/actions/runs/18299375997  
**Conclusion**: failure  
**Branch**: master  
**Date**: 2025-10-07T01:36:22Z

---

## Root Cause

GitHub has **two CodeQL setup options**:

1. **Default Setup** (Managed by GitHub) - Currently ENABLED
2. **Advanced Setup** (Custom workflow file) - `.github/workflows/codeql.yml` exists

These two setups **cannot coexist**. When default setup is enabled, GitHub automatically manages CodeQL scanning and rejects custom SARIF uploads from workflow files.

---

## Solution Options

### Option 1: Disable Default Setup (RECOMMENDED)

**Requires**: Repository admin access

**Steps**:
1. Navigate to repository Settings → Security → Code security and analysis
2. Find "Code scanning" section
3. Click "Set up" dropdown next to CodeQL analysis
4. Select "Disable" or "Switch to advanced"
5. Rerun failed workflow

**Pros**:
- Keeps custom configuration (`.github/codeql/codeql-config.yml`)
- Maintains security-extended queries
- Full control over CodeQL analysis
- Consistent with other custom workflows

**Cons**:
- Requires admin access to repository settings

---

### Option 2: Remove Custom Workflow (NOT RECOMMENDED)

**Steps**:
1. Delete or rename `.github/workflows/codeql.yml`
2. Delete `.github/codeql/codeql-config.yml`  
3. Rely on GitHub's default CodeQL setup

**Pros**:
- No configuration needed
- Managed by GitHub

**Cons**:
- Loses custom security-extended queries
- Less control over scan schedule
- Inconsistent with project's advanced configuration approach
- Cannot customize query packs

---

### Option 3: Temporarily Disable Workflow (WORKAROUND)

**Steps**:
1. Rename `.github/workflows/codeql.yml` to `.github/workflows/codeql.yml.disabled`
2. Document need to re-enable after admin fixes default setup
3. Add issue/TODO to track

**Pros**:
- Quick workaround
- Preserves configuration for future use

**Cons**:
- Temporarily disables security scanning
- Easy to forget to re-enable

---

## Recommended Action

**Step 1**: Repository admin must disable GitHub's default CodeQL setup

**Step 2**: Verify the custom workflow configuration:

```bash
# Check workflow file exists
ls -la .github/workflows/codeql.yml

# Check config file exists  
ls -la .github/codeql/codeql-config.yml

# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/codeql.yml'))"
```

**Step 3**: Rerun the workflow:

```bash
# Via GitHub CLI (if available)
gh workflow run codeql.yml

# Or via GitHub UI
# Navigate to Actions → CodeQL Analysis → Run workflow
```

---

## Current Workflow Configuration

**File**: `.github/workflows/codeql.yml`

**Key Settings**:
- Languages: `javascript-typescript`
- Build mode: `none` (no compilation needed)
- Queries: `security-extended,security-and-quality`
- Config: `./.github/codeql/codeql-config.yml`
- Node.js: 22
- Yarn: 4.9.2 via Corepack

**Triggers**:
- Push to master/main
- Pull requests to master/main  
- Weekly schedule (Mondays 2 AM)

**Permissions**:
- `security-events: write` (upload SARIF)
- `contents: read` (checkout code)
- `actions: read` (workflow access)

---

## Verification Steps

After disabling default setup, verify the workflow succeeds:

1. **Check workflow run status**:
   - Navigate to Actions → CodeQL Analysis
   - Latest run should show ✅ success

2. **Verify SARIF upload**:
   - Check Security → Code scanning alerts
   - Should see alerts (if any) from custom queries

3. **Confirm query coverage**:
   ```bash
   # Expected queries should include:
   # - security-extended (from config)
   # - security-and-quality (from config)
   # - Custom config rules from codeql-config.yml
   ```

---

## Impact Assessment

### Current Impact
- ❌ **Security scanning blocked** on master branch
- ❌ **PR checks failing** for CodeQL analysis
- ✅ Other workflows unaffected (contract-validation, nx-ci, etc.)

### After Fix
- ✅ Security scanning operational
- ✅ CodeQL alerts visible in Security tab
- ✅ PR checks passing for CodeQL

---

## Related Documentation

- [GitHub CodeQL Documentation](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors)
- [CodeQL Action README](https://github.com/github/codeql-action)
- [Switching Between Default and Advanced Setup](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning-for-a-repository#switching-between-default-and-advanced-setup)

---

## Contact

**For Questions**:
- Review this document first
- Check GitHub Actions workflow run logs
- Review `.github/workflows/codeql.yml` configuration

**For Implementation**:
- Repository admin must disable default CodeQL setup in Settings
- Then rerun workflow to verify fix

---

**Status**: ⚠️ PENDING - Awaiting admin action to disable default CodeQL setup

**Next Review**: After admin disables default setup and workflow runs successfully
