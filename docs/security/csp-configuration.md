# CSP Configuration Documentation

## Overview

The Disco MCP Server implements comprehensive Content Security Policy (CSP) protection with dynamic nonce generation to support Google Fonts while maintaining security.

## Implementation

### Enhanced CSP Middleware

The application uses a two-layer CSP approach:

1. **Enhanced Express CSP Middleware** (`src/middleware/csp.ts`)
   - Generates unique nonces for each request
   - Provides comprehensive CSP for all routes
   - Includes Google Fonts domains (`fonts.googleapis.com`, `fonts.gstatic.com`)
   - Maintains WebContainer compatibility

2. **Next.js Middleware** (`middleware.ts`)
   - Provides fallback CSP for standalone Next.js scenarios
   - Includes nonce generation for React components
   - Compatible with the Express-embedded Next.js setup

### CSP Directives

The implemented CSP includes:

```csp
default-src 'self';
script-src 'self' 'nonce-{random}' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
style-src 'self' 'nonce-{random}' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' blob: data: https:;
connect-src 'self' wss: ws: https://webcontainer.io;
frame-ancestors 'self' https://chat.openai.com https://chatgpt.com https://claude.ai;
worker-src 'self' blob:;
child-src 'self' blob:;
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

### Google Fonts Support

Google Fonts are supported through:
- `style-src`: Allows CSS from `https://fonts.googleapis.com`
- `font-src`: Allows font files from `https://fonts.gstatic.com`

### Nonce Generation

Each request generates a unique 16-byte random nonce:
- Available via `req.nonce` in Express middleware
- Accessible via `X-Nonce` response header
- Can be used in React components via `getNonce()` utility

## Usage

### In Next.js Pages

```typescript
import { getNonce, getNonceProps } from '@/utils/nonce'

export default function MyPage() {
  return (
    <div>
      <script 
        {...getNonceProps()} 
        dangerouslySetInnerHTML={{__html: 'console.log("secure script")'}} 
      />
    </div>
  )
}
```

### In Express Routes

```typescript
import { CSPRequest } from '@/middleware/csp'

app.get('/my-route', (req: CSPRequest, res) => {
  const nonce = req.nonce
  // Use nonce in templates or responses
})
```

## Security Features

1. **Dynamic Nonces**: Unique per request to prevent replay attacks
2. **Strict Directives**: Minimal permissions with explicit allowlists
3. **Google Fonts**: Secure external resource loading
4. **WebContainer Support**: Maintains compatibility with development features
5. **OAuth Endpoints**: Specific restrictive CSP for authentication flows

## Testing

The CSP configuration is validated by:
- `scripts/test-csp-fix.sh`: Verifies Google Fonts domains in OAuth callbacks
- Manual testing: Confirm nonce generation and header presence
- Browser DevTools: Check for CSP violations

## Compatibility

- ✅ Express.js server architecture
- ✅ Next.js embedded frontend
- ✅ WebContainer development environment
- ✅ OAuth authentication flows
- ✅ Google Fonts loading
- ✅ Browser extension integration (ChatGPT, Claude.ai)