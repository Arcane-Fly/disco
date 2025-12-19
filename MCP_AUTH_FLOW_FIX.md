# MCP Authorization Flow Fix

## Problem Statement

When users attempted to authorize Disco as an MCP server from an external application:
1. User clicks "authorize" link (e.g., `https://disco-mcp.up.railway.app/mcp?token=token-here`)
2. User is redirected to GitHub OAuth for authentication
3. After successful authentication, user is redirected to Disco's `/app-dashboard`
4. **Expected:** User should be redirected back to the external application with authorization credentials

## Root Cause

In `/src/api/auth.ts`, the GitHub OAuth callback handler had a fallback path (when no PKCE parameters were present) that always redirected to `/app-dashboard`, ignoring any `redirect_uri` parameters that would send users back to their external applications.

```typescript
// OLD CODE (line 519)
// Redirect to frontend dashboard if authenticated, otherwise home
res.redirect(userData ? '/app-dashboard' : '/');
```

This meant external applications trying to use Disco as an MCP server would never receive the authorization credentials.

## Solution

### 1. Enhanced State Management

Updated the `/api/v1/auth/github` endpoint to capture and preserve all OAuth parameters in the state:

```typescript
const state = Buffer.from(
  JSON.stringify({
    timestamp: Date.now(),
    redirectTo: req.query.redirect_to || req.headers.referer || '/',
    redirectUri: req.query.redirect_uri || '',           // NEW
    codeChallenge: req.query.code_challenge || '',       // NEW
    codeChallengeMethod: req.query.code_challenge_method || 'S256', // NEW
    clientId: req.query.client_id || 'disco-mcp-client', // NEW
  })
).toString('base64');
```

### 2. Enhanced Callback Handler

Updated the GitHub callback handler to:
- Parse `redirectUri` from state
- Check if user should be redirected to an external app
- Provide authorization code or token based on the flow type
- Only fallback to `/app-dashboard` if no external redirect is needed

```typescript
// NEW CODE - Fallback path now checks for external redirects
if (redirectUri && redirectUri !== '/') {
  // Redirect to external app with token
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set('token', token);
  if (state) {
    callbackUrl.searchParams.set('state', state as string);
  }
  console.log(`🔐 Redirecting user to external app: ${redirectUri}`);
  res.redirect(callbackUrl.toString());
} else if (redirectTo && redirectTo !== '/' && !redirectTo.includes('/app-dashboard')) {
  // Redirect to the original redirect_to location
  res.redirect(redirectTo);
} else {
  // Default: Redirect to frontend dashboard if authenticated, otherwise home
  res.redirect(userData ? '/app-dashboard' : '/');
}
```

### 3. PKCE Flow Enhancement

For flows with PKCE (code_challenge), the code now checks for a `redirectUri` and redirects directly to the external app:

```typescript
if (codeChallenge) {
  // ... store auth code data ...
  
  // NEW: If there's a redirect_uri, use it; otherwise use /auth/callback
  if (redirectUri) {
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('code', authCode);
    if (state) {
      callbackUrl.searchParams.set('state', state as string);
    }
    res.redirect(callbackUrl.toString());
  } else {
    res.redirect(`/auth/callback?code=${authCode}&state=${state || ''}`);
  }
}
```

## Authorization Flows Supported

### 1. **External MCP Client with PKCE** (Recommended)
External app initiates OAuth with:
- `client_id`
- `redirect_uri` 
- `code_challenge`
- `code_challenge_method`

Flow:
1. External app → `/oauth/authorize?client_id=...&redirect_uri=...&code_challenge=...`
2. Disco → GitHub OAuth
3. GitHub → Disco callback
4. Disco → External app with `code` parameter
5. External app → `/oauth/token` to exchange code for access token

### 2. **External MCP Client without PKCE** (Backward Compatible)
External app initiates OAuth with:
- `redirect_uri`

Flow:
1. External app → `/api/v1/auth/github?redirect_uri=https://external-app.com/callback`
2. Disco → GitHub OAuth
3. GitHub → Disco callback
4. Disco → External app with `token` parameter
5. External app uses token directly

### 3. **Internal Disco App**
User navigates directly to Disco:

Flow:
1. User → Disco frontend
2. Clicks "Sign In with GitHub"
3. GitHub OAuth
4. Redirect to `/app-dashboard`

## Testing the Fix

### Test Case 1: External App Authorization (PKCE)
```bash
# Initiate authorization from external app
curl "https://disco-mcp.up.railway.app/oauth/authorize?\
client_id=external-app&\
redirect_uri=https://external-app.com/callback&\
response_type=code&\
code_challenge=abc123&\
code_challenge_method=S256"

# After user authentication, they should be redirected to:
# https://external-app.com/callback?code=<auth_code>&state=<state>
```

### Test Case 2: External App Authorization (Direct Token)
```bash
# Initiate authorization from external app
curl "https://disco-mcp.up.railway.app/api/v1/auth/github?\
redirect_uri=https://external-app.com/callback"

# After user authentication, they should be redirected to:
# https://external-app.com/callback?token=<jwt_token>&state=<state>
```

### Test Case 3: Internal App (No Redirect)
```bash
# User clicks "Sign In" on Disco frontend
# After authentication, redirected to:
# https://disco-mcp.up.railway.app/app-dashboard
```

## Security Considerations

1. **Redirect URI Validation**: The `isValidRedirectUri()` function validates redirect URIs against registered clients
2. **State Parameter**: CSRF protection via state parameter
3. **PKCE Support**: Full RFC 7636 compliance for authorization code flows
4. **Token Expiry**: JWT tokens expire after 24 hours
5. **Secure Cookies**: Auth tokens stored in httpOnly, secure cookies

## Files Modified

- `src/api/auth.ts`: Enhanced GitHub OAuth callback handler and state management

## Commit

Commit hash: [will be added after commit]

## Related Issues

Fixes the issue where external MCP clients couldn't complete the authorization flow because users were redirected to Disco's dashboard instead of back to the external app.
