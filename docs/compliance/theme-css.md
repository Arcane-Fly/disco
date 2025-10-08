# Agent Directive: Universal Theme System Implementation & Enforcement

## Mission Brief

You are tasked with implementing and enforcing a **production-grade, eye-comfort optimized design system** across this codebase. This theme system eliminates common UX pain points (harsh whites, poor contrast, inconsistent elevation) while maintaining WCAG AAA accessibility compliance and modern design standards.

---

## 🎯 Your Role & Authority

**Primary Function**: Design System Architect & Enforcement Agent

**Scope of Authority**:

- ✅ Refactor any component to match theme specifications
- ✅ Replace hardcoded colors with CSS custom properties
- ✅ Update Tailwind configurations
- ✅ Modify global stylesheets
- ✅ Reject PRs that violate theme standards
- ✅ Flag accessibility violations immediately

**Non-Negotiables**:

- Never use pure `#ffffff` or `#000000`
- All text must pass WCAG AA minimum (AAA preferred)
- Respect `prefers-reduced-motion`
- Use semantic tokens, not arbitrary values
- Follow elevation scale (0-4) strictly

---

## 📋 Execution Modes

### Mode 1: Fresh Implementation (New Projects)

**Context**: Starting from scratch or adding design system to existing project without one.

**Your Tasks**:

```markdown
1. FOUNDATION SETUP (30 min)
   → Create `styles/theme.css` with full CSS variable set
   → Update `tailwind.config.js` with extended theme
   → Add theme CSS to root layout/entry point
   → Verify dark mode toggle works (if applicable)
   → Run build - ensure no TypeScript/ESLint errors

2. COMPONENT MIGRATION (2-3 hours)
   → Audit all components for hardcoded colors
   → Replace inline styles with theme classes
   → Apply elevation scale to surfaces
   → Update button components to use new variants
   → Ensure all text uses semantic color tokens

3. QUALITY GATES (1 hour)
   → Run contrast checker on all text combinations
   → Test with screen reader (if available)
   → Verify focus indicators on all interactive elements
   → Test both light/dark themes
   → Check mobile responsiveness

4. DOCUMENTATION (30 min)
   → Update README with theme toggle instructions
   → Document any custom color additions
   → Add theme guide to Storybook (if used)
   → Create before/after screenshots
```

**Success Criteria**:

- [ ] Zero hardcoded hex colors in components
- [ ] 100% WCAG AA compliance (verified)
- [ ] Theme toggle works without flash/flicker
- [ ] All interactive elements have proper focus states
- [ ] Build passes with 0 errors/warnings

---

### Mode 2: Codebase Audit & Enforcement (Existing Projects)

**Context**: Review existing codebase and bring it into compliance with theme standards.

**Your Tasks**:

```
1. DISCOVERY PHASE (15 min)
   → Scan for hardcoded colors: grep -r "#[0-9a-fA-F]{6}" src/
   → Identify inline style usage: grep -r "style={{" src/
   → Find legacy class names: grep -r "bg-white\|bg-black\|text-black" src/
   → Check if theme system exists (globals.css, tailwind.config)
   → Generate violation report with file paths + line numbers

2. PRIORITIZED REMEDIATION (variable timeline)

   CRITICAL (Fix immediately):
   → Pure white (#ffffff) / pure black (#000000) usage
   → WCAG contrast failures
   → Missing focus indicators
   → Broken dark mode styles

   HIGH (Fix within sprint):
   → Inconsistent elevation/shadows
   → Hardcoded colors in components
   → Inline styles that should use classes
   → Missing reduced-motion support

   MEDIUM (Schedule for next sprint):
   → Legacy class names (migrate to new system)
   → Component variants standardization
   → Animation timing inconsistencies

3. SYSTEMATIC REFACTORING
   For each violation:
   → Identify the semantic intent (is this a card? button? text?)
   → Replace with appropriate theme token/class
   → Test in both light/dark modes
   → Verify no visual regression
   → Document the change if non-obvious

4. VALIDATION & PREVENTION
   → Add ESLint rule to block hardcoded colors
   → Create pre-commit hook for contrast checks
   → Update CI to fail on theme violations
   → Add theme compliance to PR checklist
```

**Audit Report Template**:

```markdown
## Theme Compliance Audit Report
**Date**: [Current Date]
**Auditor**: [Agent Name]
**Codebase**: [Project Name]

## Executive Summary
- Total files scanned: X
- Violations found: Y
- WCAG failures: Z
- Estimated remediation time: N hours

## Critical Violations (Fix Now)
1. [File path] Line X: Pure white background - WCAG fail
2. [File path] Line Y: Hardcoded #000000 text color
...

## Remediation Plan
| Priority | Issue | Files Affected | Est. Time | Assignee |
|----------|-------|----------------|-----------|----------|
| CRITICAL | Pure white/black | 12 files | 2h | [Agent] |
| HIGH | Missing focus rings | 8 components | 1h | [Agent] |
...

## Post-Fix Verification
- [ ] All critical issues resolved
- [ ] WCAG compliance verified
- [ ] Both themes tested
- [ ] Build passes
- [ ] PR ready for review
```

---

## 🔍 Code Review Checklist

When reviewing PRs or new code, verify:

### Colors & Theming

```typescript
// ❌ REJECT - Hardcoded colors
<div style={{ backgroundColor: '#ffffff', color: '#000000' }}>

// ❌ REJECT - Direct Tailwind colors
<div className="bg-white text-black">

// ✅ APPROVE - Theme tokens
<div className="bg-bg-secondary text-text-primary">
<div style={{
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)'
}}>
```

### Elevation & Shadows

```typescript
// ❌ REJECT - Arbitrary shadow
<div className="shadow-lg">

// ✅ APPROVE - Semantic elevation
<div className="shadow-elev-2"> // Cards use elevation 2
<div className="shadow-elev-4"> // Modals use elevation 4
```

### Interactive States

```typescript
// ❌ REJECT - Missing focus state
<button onClick={handler}>Click</button>

// ✅ APPROVE - Proper focus handling
<button
  onClick={handler}
  className="btn-primary focus-visible:outline-none"
>
  Click
</button>
```

### Accessibility

```typescript
// ❌ REJECT - Low contrast
<p className="text-gray-400 text-xs">Muted text</p> // May fail WCAG

// ✅ APPROVE - High contrast with semantic token
<p className="text-text-muted text-base">Muted text</p> // WCAG AAA
```

---

## 🛠️ Common Refactoring Patterns

### Pattern 1: Inline Styles → Theme Classes

**Before**:

```tsx
<div style={{
  backgroundColor: '#f5f5f5',
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
}}>
```

**After**:

```tsx
<div className="bg-bg-tertiary p-6 rounded-xl shadow-elev-2">
```

---

### Pattern 2: Arbitrary Colors → Semantic Tokens

**Before**:

```tsx
<h1 style={{ color: '#1a1a1a' }}>Title</h1>
<p style={{ color: '#666666' }}>Description</p>
<span style={{ color: '#999999' }}>Metadata</span>
```

**After**:

```tsx
<h1 className="text-text-primary">Title</h1>
<p className="text-text-secondary">Description</p>
<span className="text-text-muted">Metadata</span>
```

---

### Pattern 3: Hardcoded Button → Theme Button

**Before**:

```tsx
<button style={{
  background: 'linear-gradient(180deg, #00d9ff, #0099cc)',
  color: '#000',
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none'
}}>
  Submit
</button>
```

**After**:

```tsx
<button className="btn-primary">
  Submit
</button>
```

---

### Pattern 4: Card with Mixed Styles → Standardized Card

**Before**:

```tsx
<div style={{
  background: 'white',
  border: '1px solid #e0e0e0',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}}>
  <h2 style={{ color: '#000', marginBottom: '16px' }}>Card Title</h2>
  <p style={{ color: '#666' }}>Card content here</p>
</div>
```

**After**:

```tsx
<div className="card card--interactive p-8 rounded-xl">
  <h2 className="text-text-primary text-xl font-semibold mb-4">Card Title</h2>
  <p className="text-text-secondary">Card content here</p>
</div>
```

---

## 📊 Validation Commands

Run these before marking work complete:

```bash
# 1. Check for hardcoded colors
grep -r "#[0-9a-fA-F]{6}" src/ --exclude-dir=node_modules

# 2. Find inline styles (React/JSX)
grep -r "style={{" src/ --exclude-dir=node_modules | wc -l

# 3. Check for pure white/black usage
grep -r "bg-white\|bg-black\|text-white\|text-black\|#ffffff\|#000000" src/ --exclude-dir=node_modules

# 4. Verify theme CSS is imported
grep -r "import.*theme.css\|import.*globals.css" src/

# 5. Build check
pnpm/yarn (as project defined) build # yarn 4.9.2+ or pnpm 10.17+

# 6. Type check
pnpm/yarn (as project defined) type-check # or tsc --noEmit

# 7. Lint check
pnpm/yarn (as project defined) lint
```

**Success Thresholds**:

- Hardcoded colors: **0 occurrences**
- Inline styles: **<5 occurrences** (exception: dynamic positioning)
- Build errors: **0**
- Lint warnings: **0 theme-related**

---

## 🚨 Error Handling & Edge Cases

### Edge Case 1: Third-Party Components

**Problem**: Library components don't respect your theme.

**Solution**:

```css
/* Create wrapper with CSS variable override */
.third-party-wrapper {
  --library-bg: var(--bg-secondary);
  --library-text: var(--text-primary);
  --library-border: var(--border-moderate);
}
```

```tsx
<div className="third-party-wrapper">
  <ThirdPartyComponent />
</div>
```

---

### Edge Case 2: Dynamic Brand Colors

**Problem**: Client wants configurable brand colors.

**Solution**:

```typescript
// config/theme-overrides.ts
export const applyBrandOverrides = (primaryColor: string, secondaryColor: string) => {
  document.documentElement.style.setProperty('--brand-cyan', primaryColor);
  document.documentElement.style.setProperty('--brand-purple', secondaryColor);

  // Regenerate dependent colors
  const glowCyan = `0 0 12px ${primaryColor}40, 0 0 24px ${primaryColor}20`;
  document.documentElement.style.setProperty('--glow-cyan', glowCyan);
};
```

---

### Edge Case 3: Conditional Dark/Light Styles

**Problem**: Need different values beyond what CSS variables provide.

**Solution**:

```tsx
// Use data attributes for complex conditionals
<div
  className="card"
  data-theme-variant="premium"
  data-elevation="high"
>
  Content
</div>
```

```css
/* Theme-aware variants */
[data-theme-variant="premium"] {
  background: linear-gradient(135deg,
    var(--brand-cyan),
    var(--brand-purple));
}

.dark [data-theme-variant="premium"] {
  opacity: 0.9; /* Tone down in dark mode */
}
```

---

## 📈 Progress Tracking

### Daily Standup Template

```markdown
## Theme Migration Progress - [Date]

### Completed Today
- [ ] Migrated dashboard components (12 files)
- [ ] Fixed 8 WCAG contrast violations
- [ ] Updated button variants across app

### In Progress
- [ ] Refactoring settings page (60% done)
- [ ] Adding focus indicators to form inputs

### Blockers
- Waiting on design approval for error state colors

### Metrics (e.g.)
- Hardcoded colors: 47 → 12 (-74%)
- WCAG compliance: 68% → 91% (+23%)
- Files migrated: 45/78 (58%)

### Tomorrow's Plan
- Complete settings page refactor
- Audit modal components
- Update theme documentation
```

---

## 🎓 Learning Resources

If you encounter unfamiliar concepts:

1. **CSS Custom Properties**: [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
1. **WCAG Contrast**: Use `web_search` to find "WCAG contrast calculator"
1. **OKLab Color Mixing**: Use `web_search` for "oklch color space explanation"
1. **Tailwind Theming**: Search docs at tailwindcss.com
1. **React Styling Best Practices**: Use `web_search` for current 2025 standards

**Always verify against official documentation** - use available tools like `web_search` or `web_fetch` to pull authoritative sources.

---

## ✅ Definition of Done

A file/component is **theme-compliant** when:

1. ✅ **Zero hardcoded colors** (no hex values in code)
2. ✅ **All text passes WCAG AA** (verified with contrast checker)
3. ✅ **Uses semantic tokens** (`var(--text-primary)` not `#1a202c`)
4. ✅ **Respects elevation scale** (cards = 2, modals = 4)
5. ✅ **Has proper focus states** (keyboard navigation works)
6. ✅ **Tested in both themes** (light and dark mode)
7. ✅ **Respects reduced motion** (animations honor preference)
8. ✅ **No console errors** (build completes successfully)
9. ✅ **Documented exceptions** (if any deviations, explain why)

---

## 🚀 Quick Start for Agents

**First-Time Setup** (copy-paste this sequence):

```bash
# 1. Create theme file
cat > src/styles/theme.css << 'EOF'
[Paste full CSS from theme document]
EOF

# 2. Update Tailwind config
cat > tailwind.config.js << 'EOF'
[Paste full Tailwind config from theme document]
EOF

# 3. Import in root layout
echo "import './styles/theme.css';" >> src/app/layout.tsx

# 4. Verify
pnpm/yarn (as project defined) build && echo "✅ Theme setup complete!"
```

**Audit Existing Project**:

```bash
# Generate violation report
echo "# Theme Violations Report" > theme-audit.md
echo "\n## Hardcoded Colors:" >> theme-audit.md
grep -rn "#[0-9a-fA-F]{6}" src/ --exclude-dir=node_modules >> theme-audit.md
echo "\n## Inline Styles:" >> theme-audit.md
grep -rn "style={{" src/ --exclude-dir=node_modules >> theme-audit.md
echo "\n✅ Audit complete! Review theme-audit.md"
```

---

## 💬 Communication Guidelines

When reporting to developers:

**DO**:

- "Found 12 hardcoded colors in `components/dashboard/` - replacing with `var(--bg-secondary)`"
- "Card component fails WCAG AA (3.2:1 contrast) - updating to `text-text-primary` (13.2:1)"
- "Added focus indicators to all buttons per accessibility guidelines"

**DON'T**:

- "Fixed some styling issues"
- "Made it look better"
- "Updated colors"

**Be specific, cite standards, show before/after**.

---

## 🎯 Success Metrics

After full implementation, the codebase should achieve:

| Metric | Target | Verification Method |
|--------|--------|---------------------|
| Hardcoded colors | **0** | `grep` command returns empty |
| WCAG AA compliance | **100%** | Contrast checker on all text |
| Theme token usage | **≥95%** | Code review |
| Build errors | **0** | CI pipeline passes |
| Focus indicators | **100%** | Keyboard navigation test |
| Reduced motion support | **Yes** | Test with system setting enabled |
| Dark mode parity | **100%** | Visual comparison |
| Load time impact | **<50ms** | Lighthouse performance |

---

## 🔄 Continuous Enforcement

**Post-Implementation Maintenance**:

1. **Add to PR Template**:

```markdown
## Theme Compliance Checklist
- [ ] No hardcoded colors used
- [ ] All text passes WCAG AA
- [ ] Focus states tested
- [ ] Both themes verified
- [ ] No inline styles added
```

2. **Create ESLint Rule** (if capable):

```javascript
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: "Literal[value=/#[0-9a-fA-F]{6}/]",
      message: 'Use CSS custom properties instead of hardcoded hex colors',
    },
  ],
}
```

3. **Git Pre-Commit Hook**:

```bash
#!/bin/sh
# .git/hooks/pre-commit
if git diff --cached --name-only | grep -E '\.(tsx?|jsx?|css)$' | xargs grep -E '#[0-9a-fA-F]{6}'; then
  echo "❌ Error: Hardcoded hex colors detected. Use theme tokens."
  exit 1
fi
```markdown
## Theme Compliance Audit Report (Example)
**Date**: [Current Date]
**Auditor**: [Agent Name]
**Codebase**: [Project Name]

## Executive Summary
- Total files scanned: X
- Violations found: Y
- WCAG failures: Z
- Estimated remediation time: N hours

## Critical Violations (Fix Now)
1. [File path] Line X: Pure white background - WCAG fail
2. [File path] Line Y: Hardcoded #000000 text color
...

## Remediation Plan
| Priority | Issue | Files Affected | Est. Time | Assignee |
|----------|-------|----------------|-----------|----------|
| CRITICAL | Pure white/black | 12 files | 2h | [Agent] |
| HIGH | Missing focus rings | 8 components | 1h | [Agent] |
...

## Post-Fix Verification
- [ ] All critical issues resolved
- [ ] WCAG compliance verified
- [ ] Both themes tested
- [ ] Build passes
- [ ] PR ready for review
```

---

## 🌓 Theme Specifications

### Light Theme (Eye-Comfort Optimized)

**Key Principle**: Eliminate pure white (#ffffff) and pure black (#000000) to reduce eye strain while maintaining WCAG AAA compliance.

```css
:root,
[data-theme="light"] {
  /* Backgrounds - Soft Off-Whites */
  --bg-primary: #f8fafb;           /* Main background - soft blue-grey */
  --bg-secondary: #fefefe;         /* Cards/surfaces - off-white (98.5% luminance) */
  --bg-tertiary: #f3f5f7;          /* Muted elements - light grey */
  --bg-interactive: #eaecef;       /* Hover/active states */
  --bg-elevated: #ffffff;          /* Only for critical elevation (modals) */

  /* Text - Warm Greys (Not Pure Black) */
  --text-primary: #1a202c;         /* Main text - soft charcoal (13.2:1 contrast) */
  --text-secondary: #4a5568;       /* Secondary text - medium grey (7.8:1 contrast) */
  --text-muted: #718096;           /* Muted text - light grey (5.1:1 contrast) */
  --text-inverse: #fefefe;         /* Text on dark backgrounds */

  /* Borders - Subtle Opacity-Based */
  --border-subtle: rgba(26, 32, 44, 0.08);
  --border-moderate: rgba(26, 32, 44, 0.12);
  --border-strong: rgba(26, 32, 44, 0.18);

  /* Elevation Shadows - Softer for Light Mode */
  --shadow-0: none;
  --shadow-1: 0 1px 3px rgba(0, 0, 0, 0.04),
              0 0 0 1px rgba(26, 32, 44, 0.06) inset;
  --shadow-2: 0 4px 8px rgba(0, 0, 0, 0.06),
              0 0 0 1px rgba(26, 32, 44, 0.08) inset;
  --shadow-3: 0 8px 16px rgba(0, 0, 0, 0.08),
              0 0 0 1px rgba(26, 32, 44, 0.10) inset;
  --shadow-4: 0 16px 32px rgba(0, 0, 0, 0.12),
              0 0 0 1px rgba(26, 32, 44, 0.12) inset;

  /* Gradients - Subtle Brand Wash */
  --gradient-ambient: radial-gradient(120% 120% at 10% 0%,
                        rgba(110, 231, 255, 0.04) 0%,
                        transparent 60%),
                      radial-gradient(120% 120% at 90% 100%,
                        rgba(155, 107, 255, 0.04) 0%,
                        transparent 60%);

  --gradient-brand: linear-gradient(135deg,
                      var(--brand-cyan) 0%,
                      var(--brand-purple) 100%);

  /* Glow Effects - Toned Down */
  --glow-cyan: 0 0 8px rgba(110, 231, 255, 0.2),
               0 0 16px rgba(110, 231, 255, 0.1);
  --glow-purple: 0 0 8px rgba(155, 107, 255, 0.2),
                 0 0 16px rgba(155, 107, 255, 0.1);
  --glow-mixed: 0 0 8px rgba(110, 231, 255, 0.18),
                0 0 20px rgba(155, 107, 255, 0.12);
}
```

### Dark Theme (High Contrast, Deep Blues)

```css
.dark,
[data-theme="dark"] {
  /* Backgrounds - Deep Navy Blues */
  --bg-primary: #0b0f1a;           /* Main background - near black with blue tint */
  --bg-secondary: #0f1524;         /* Cards/surfaces - dark blue-grey */
  --bg-tertiary: #1a2030;          /* Elevated elements */
  --bg-interactive: #212836;       /* Hover/active states */
  --bg-elevated: #252d3f;          /* Modals/highest elevation */

  /* Text - Cool Whites */
  --text-primary: #e7ecff;         /* Main text - soft white with blue tint */
  --text-secondary: #a8b2d1;       /* Secondary text - muted blue-grey */
  --text-muted: #6b7694;           /* Muted text - darker grey-blue */
  --text-inverse: #1a202c;         /* Text on light backgrounds */

  /* Borders - Light Opacity-Based */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-moderate: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.18);

  /* Elevation Shadows - Stronger for Dark Mode */
  --shadow-0: none;
  --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  --shadow-2: 0 6px 16px rgba(0, 0, 0, 0.35),
              0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  --shadow-3: 0 16px 32px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  --shadow-4: 0 30px 60px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(255, 255, 255, 0.08) inset;

  /* Gradients - Vibrant Brand Wash */
  --gradient-ambient: radial-gradient(120% 120% at 10% 0%,
                        rgba(110, 231, 255, 0.15) 0%,
                        transparent 60%),
                      radial-gradient(120% 120% at 90% 100%,
                        rgba(155, 107, 255, 0.15) 0%,
                        transparent 60%);

  /* Glow Effects - Full Intensity */
  --glow-cyan: 0 0 12px rgba(110, 231, 255, 0.3),
               0 0 24px rgba(110, 231, 255, 0.15);
  --glow-purple: 0 0 12px rgba(155, 107, 255, 0.3),
                 0 0 24px rgba(155, 107, 255, 0.15);
  --glow-mixed: 0 0 10px rgba(110, 231, 255, 0.25),
                0 0 30px rgba(155, 107, 255, 0.18);
}
```

---

## 📐 Design Tokens

### Spacing Scale

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.375rem;   /* 6px - inputs, small buttons */
  --radius-md: 0.5rem;     /* 8px - default buttons */
  --radius-lg: 0.75rem;    /* 12px - cards */
  --radius-xl: 1rem;       /* 16px - large cards */
  --radius-2xl: 1.5rem;    /* 24px - modals */
  --radius-full: 9999px;   /* Pills, avatars */
}
```

### Typography Scale

```css
:root {
  /* Font families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

  /* Font sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

---

## 🎯 Component Classes

### Base Application Shell

```css
.app-shell {
  background: var(--bg-primary);
  background-image: var(--gradient-ambient);
  color: var(--text-primary);
  min-height: 100vh;
  font-family: var(--font-sans);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Card Components (Elevation Scale: 0-4)

```css
/* Base Card (Elevation 2) */
.card {
  background: color-mix(in oklab, var(--bg-secondary) 92%, var(--bg-primary) 8%);
  border: 1px solid var(--border-moderate);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2);
  padding: var(--space-6);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

/* Interactive Card */
.card--interactive:hover {
  box-shadow: var(--shadow-3), var(--glow-mixed);
  transform: translateY(-2px);
  cursor: pointer;
}

/* Neon Edge Variant */
.card--neon {
  box-shadow: var(--shadow-2),
              inset 0 0 0 1px color-mix(in oklab, var(--brand-cyan) 18%, transparent);
}

/* Elevated Card (Elevation 3) */
.card--elevated {
  background: var(--bg-elevated);
  box-shadow: var(--shadow-3);
}

/* Modal/Toast (Elevation 4) */
.card--modal {
  background: var(--bg-elevated);
  box-shadow: var(--shadow-4);
  border-radius: var(--radius-2xl);
}
```

### Button System

```css
/* Primary CTA */
.btn-primary {
  background: linear-gradient(180deg,
    var(--brand-cyan),
    color-mix(in oklab, var(--brand-cyan), black 18%));
  color: #001018;
  font-weight: var(--font-semibold);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  border: none;
  box-shadow: var(--shadow-1);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}

.btn-primary:hover,
.btn-primary:focus-visible {
  box-shadow: var(--shadow-2),
              0 0 0 2px rgba(110, 231, 255, 0.25),
              var(--glow-cyan);
  transform: translateY(-1px);
  outline: none;
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-1);
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--brand-cyan);
  box-shadow: var(--shadow-1);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: var(--bg-interactive);
  color: var(--text-primary);
}

/* Destructive Button */
.btn-destructive {
  background: var(--error);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  border: none;
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-destructive:hover {
  background: color-mix(in oklab, var(--error), black 15%);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
}
```

### Gradient Utilities

```css
.soft-gradient {
  background-image: var(--gradient-ambient);
}

.brand-gradient {
  background-image: var(--gradient-brand);
}

.glass-effect {
  background: color-mix(in oklab, var(--bg-secondary) 85%, transparent);
  backdrop-filter: saturate(120%) blur(12px);
  border: 1px solid var(--border-subtle);
}
```

---

## ⚙️ Tailwind Configuration

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        'brand-cyan': '#6ee7ff',
        'brand-purple': '#9b6bff',

        // Backgrounds
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          interactive: 'var(--bg-interactive)',
          elevated: 'var(--bg-elevated)',
        },

        // Text
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },

        // Borders
        border: {
          subtle: 'var(--border-subtle)',
          moderate: 'var(--border-moderate)',
          strong: 'var(--border-strong)',
        },

        // Semantic
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },

      boxShadow: {
        'elev-0': 'var(--shadow-0)',
        'elev-1': 'var(--shadow-1)',
        'elev-2': 'var(--shadow-2)',
        'elev-3': 'var(--shadow-3)',
        'elev-4': 'var(--shadow-4)',
        'glow-cyan': 'var(--glow-cyan)',
        'glow-purple': 'var(--glow-purple)',
        'glow-mixed': 'var(--glow-mixed)',
      },

      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-ambient': 'var(--gradient-ambient)',
      },

      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },

      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
      },

      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },

      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
      },

      zIndex: {
        'base': 'var(--z-base)',
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
      },

      backdropBlur: {
        'glass': '12px',
      },

      backdropSaturate: {
        '120': '1.2',
      },
    },
  },
  plugins: [],
};
```

---

## ♿ Accessibility Requirements

### WCAG Contrast Compliance

| Combination | Ratio | WCAG AA | WCAG AAA | Use Case |
|-------------|-------|---------|----------|----------|
| **Light Theme** |  |  |  |  |
| `#1a202c` on `#fefefe` | **13.2:1** | ✅ Pass | ✅ Pass | Body text |
| `#4a5568` on `#fefefe` | **7.8:1** | ✅ Pass | ✅ Pass | Secondary text |
| `#718096` on `#fefefe` | **5.1:1** | ✅ Pass | ⚠️ Large text | Muted text |
| **Dark Theme** |  |  |  |  |
| `#e7ecff` on `#0b0f1a` | **14.1:1** | ✅ Pass | ✅ Pass | Body text |
| `#a8b2d1` on `#0b0f1a` | **8.2:1** | ✅ Pass | ✅ Pass | Secondary text |
| `#6b7694` on `#0b0f1a` | **4.8:1** | ✅ Pass | ⚠️ Large text | Muted text |

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--brand-cyan);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-2),
              0 0 0 3px rgba(110, 231, 255, 0.4);
}
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Day 1)

- [ ] Add CSS variables to root stylesheet
- [ ] Update Tailwind configuration
- [ ] Verify no TypeScript/ESLint errors
- [ ] Test theme switching (if applicable)
- [ ] Document color tokens in Storybook/style guide

### Phase 2: Component Migration (Days 2-3)

- [ ] Apply `.app-shell` to root layout
- [ ] Migrate cards to new `.card` classes
- [ ] Update all buttons to use new button classes
- [ ] Apply elevation scale consistently
- [ ] Add neon edge effects to primary cards

### Phase 3: Quality Assurance (Day 4)

- [ ] Run WCAG contrast checker on all text combinations
- [ ] Test with `prefers-reduced-motion: reduce`
- [ ] Verify focus indicators on all interactive elements
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness check

### Phase 4: Polish (Day 5)

- [ ] Add hover states to all interactive elements
- [ ] Implement loading states with brand colors
- [ ] Add subtle animations (respecting reduced motion)
- [ ] Take before/after screenshots
- [ ] Document any deviations from guide

---

## 🚨 Critical Rules

### Never Do

❌ Use pure `#ffffff` or `#000000`
❌ Use `any` or arbitrary color values
❌ Skip WCAG contrast verification
❌ Ignore `prefers-reduced-motion`
❌ Hardcode colors instead of using tokens
❌ Mix opacity values inconsistently
❌ Override elevation scale without reason

### Always Do

✅ Use CSS custom properties for all colors
✅ Verify contrast ratios before deploying
✅ Test both light and dark themes
✅ Respect user's motion preferences
✅ Document any custom color additions
✅ Use semantic color names
✅ Follow the elevation scale (0-4)

---

## 🔧 Quick Start Examples

### React Component Example

```tsx
import React from 'react';

export const DashboardCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children
}) => {
  return (
    <div className="card card--interactive card--neon p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-text-primary mb-4">
        {title}
      </h3>
      <div className="text-text-secondary">
        {children}
      </div>
    </div>
  );
};

export const PrimaryCTA: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children
}) => {
  return (
    <button
      onClick={onClick}
      className="btn-primary focus-visible:outline-none"
    >
      {children}
    </button>
  );
};
```

### Next.js Layout Example

```tsx
// app/layout.tsx
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="app-shell">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
```

---

## 📚 Resources

### Official Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)

### Tools

- **Contrast Checker**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Color Mixer**: [OKLab Color Mixer](https://oklch.com/)
- **Accessibility Testing**: [axe DevTools](https://www.deque.com/axe/devtools/)

---

## 🎯 Success Metrics

After implementation, verify:

1. **WCAG AA compliance**: 100% of text combinations pass
2. **Eye comfort**: 30+ minute viewing sessions without strain
3. **Theme consistency**: 0 hardcoded color values in components
4. **Performance**: No layout shifts when switching themes
5. **Accessibility**: All focus indicators visible and functional

---

**Version**: 1.0.0
**Last Updated**: 2025-10-01
**Maintainer**: Design Systems Team
