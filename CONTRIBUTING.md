# Contributing to disco

Thank you for contributing to the disco project! This guide outlines our development practices and standards.

## No-Regex-by-Default Policy

**TL;DR:** Use parsers and typed APIs. Regex only for tiny, anchored literals with no quantifiers.

### Why This Policy?

Regex is brittle, slow to review, and often wrong for parsing DOM/HTML/JSON/URLs/logs. We standardize on **parsers and typed APIs** to improve:
- **Security**: Avoid ReDoS (Regular Expression Denial of Service) attacks
- **Maintainability**: Code is easier to understand and modify
- **Reliability**: Parsers handle edge cases better than regex
- **Performance**: Proper parsers are often faster than complex regex

### What's Disallowed ❌

The following uses of regex are **not permitted** and must be refactored:

- DOM selection via regex (use Playwright/Testing Library locators)
- Parsing JSON/URLs/HTML/CSV/logs with regex
- Catch-all patterns like `.*`, nested groups, lookbehinds, backtracking-prone groups
- Any `new RegExp(userInput)` or untrusted input in patterns
- Complex regex patterns that are hard to understand or maintain

### What's Allowed ✅

Regex is permitted only for **narrow, well-defined use cases**:

- **Trivial, fully-anchored literals**, max length 30 characters, no complex quantifiers
  - Examples: `^(OK|FAIL)$`, `^[A-Z]{3}-\d{4}$`
  - Must be compile-time literals only (no dynamic construction)
- Only for **validation** or **static routing** where no standard parser exists
- Must be documented and justified in code comments

### Preferred Replacements

#### JavaScript/TypeScript

**DOM Selection:**
```typescript
// ❌ Bad
await page.locator('div:has-text(/Submit/i)');

// ✅ Good
await page.getByRole('button', { name: 'Submit' });
await page.getByTestId('submit-btn');
```

**URLs and Query Parameters:**
```typescript
// ❌ Bad
const q = location.href.match(/[?&]q=([^&]+)/)?.[1];

// ✅ Good
const url = new URL(location.href);
const q = url.searchParams.get('q');
```

**JSON Parsing:**
```typescript
// ❌ Bad
const id = body.match(/"id":"(\w+)"/)?.[1];

// ✅ Good
const data = JSON.parse(body);
const id = data.id;
```

**HTML Parsing:**
```typescript
// ❌ Bad
const titles = html.match(/<h2>(.*?)<\/h2>/g);

// ✅ Good (server-side)
import * as cheerio from 'cheerio';
const $$ = cheerio.load(html);
const titles = $$('h2').map((_, el) => $$(el).text()).get();

// ✅ Good (browser)
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const titles = Array.from(doc.querySelectorAll('h2')).map(el => el.textContent);
```

**CSV Parsing:**
```typescript
// ❌ Bad
const rows = text.split('\n').map(r => r.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));

// ✅ Good
import { parse } from 'csv-parse/sync';
const records = parse(text, { columns: true, skip_empty_lines: true });
```

**Email/Phone Validation:**
```typescript
// ❌ Bad
const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// ✅ Good
import { isEmail } from 'validator';
if (isEmail(s)) { /* ... */ }
```

**String Operations:**
```typescript
// ❌ Bad
if (str.match(/error/i)) { /* ... */ }

// ✅ Good
if (str.toLowerCase().includes('error')) { /* ... */ }
```

#### Python

**URLs:**
```python
# ✅ Good
from urllib.parse import urlparse, parse_qs
q = parse_qs(urlparse(url).query).get('q', [None])[0]
```

**JSON:**
```python
# ✅ Good
import json
data = json.loads(body)
id = data['id']
```

**HTML:**
```python
# ✅ Good
from bs4 import BeautifulSoup
soup = BeautifulSoup(html, 'lxml')
titles = [h.text for h in soup.select('h2')]
```

**Dates:**
```python
# ✅ Good
from dateutil import parser
date = parser.parse(date_string)
```

### Adding a New Regex (Exception Process)

If you believe regex is truly necessary:

1. **Justify in the PR description**: Explain why no standard API or parser works
2. **Keep it simple**: 
   - Anchored (`^...$`)
   - Short (< 30 characters)
   - No lookbehind/lookahead
   - No backtracking risk
3. **Document it**: Add a comment explaining what it matches and why regex is needed
4. **Test thoroughly**: Add comprehensive tests, preferably property-based tests with fuzzed inputs
5. **Request review**: Tag the regex for extra scrutiny during code review

### Existing Regex Exceptions

The following regex patterns are currently permitted in the codebase:

- **Container URI parsing** (`src/mcp-server.ts`): Parses disco:// protocol URIs - simple anchored pattern
- **Newline sanitization** (`src/api/*.ts`): `replace(/[\r\n]/g, '')` - simple character class for security
- **Git URL authentication** (`src/api/git.ts`): URL substitution - uses standard string replace
- **Path segment filtering** (`src/middleware/securityAudit.ts`): API version detection - simple pattern
- **Command history parsing** (`src/api/terminal.ts`): Terminal output parsing - documented exception

These are documented exceptions that have been reviewed and approved.

## Development Workflow

### Setting Up

```bash
# Install dependencies
yarn install

# Enable git hooks
yarn husky install
```

### Before Committing

```bash
# Run linting
yarn lint

# Run type checking
yarn typecheck

# Run tests
yarn test
```

### Code Quality Standards

- Follow existing code style and patterns
- Write clear, self-documenting code
- Add tests for new functionality
- Update documentation as needed
- Ensure all CI checks pass

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the guidelines above
3. Run linting, type checking, and tests locally
4. Commit with clear, descriptive messages
5. Push and create a pull request
6. Address review feedback
7. Wait for CI checks to pass
8. Merge once approved

## Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate and sanitize all user inputs
- Follow the No-Regex-by-Default policy to prevent ReDoS attacks
- Report security issues privately to the maintainers

## Questions?

If you have questions about these guidelines or need help with implementation, please:
- Open a discussion on GitHub
- Ask in pull request comments
- Contact the maintainers

Thank you for helping make disco better!
