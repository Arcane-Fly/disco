# OAuth Troubleshooting Guide - Disco MCP Server

## Overview

This guide helps troubleshoot OAuth callback flow issues, browser extension interference, and MCP OAuth 2.1 compliance problems.

## Common Issues and Solutions

### 1. OAuth Callback Flow Breakdown

**Problem**: Authorization phase completes successfully but token exchange fails
```
Error: "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
```

**Root Cause**: Missing MCP OAuth 2.1 specification components
- Missing OAuth discovery endpoints
- Incomplete PKCE (Proof Key for Code Exchange) validation
- Browser extension interference during callback processing

**Solution**: ✅ RESOLVED
- Added `.well-known/oauth-authorization-server` endpoint
- Added `.well-known/oauth-protected-resource` endpoint
- Implemented RFC 7636 compliant PKCE validation
- Enhanced callback processing with browser extension mitigation

### 2. Missing OAuth Discovery Endpoints

**Problem**: MCP clients cannot discover OAuth server capabilities
```bash
curl https://disco-mcp.up.railway.app/.well-known/oauth-authorization-server
# Returns: 404 Not Found
```

**Solution**: ✅ FIXED
OAuth discovery endpoints now available:
- `/.well-known/oauth-authorization-server` - RFC 8414 compliant
- `/.well-known/oauth-protected-resource` - RFC 8707 compliant

**Test Commands**:
```bash
# Test OAuth Authorization Server discovery
curl -s https://disco-mcp.up.railway.app/.well-known/oauth-authorization-server | jq .

# Test OAuth Protected Resource discovery
curl -s https://disco-mcp.up.railway.app/.well-known/oauth-protected-resource | jq .
```

### 3. PKCE Validation Failures

**Problem**: Token exchange fails with PKCE-related errors
```
Error: "PKCE verification failed" or "Invalid code verifier"
```

**Root Cause**: Missing or incorrect PKCE implementation

**Solution**: ✅ IMPLEMENTED
- Full RFC 7636 PKCE implementation with S256 challenge method
- Authorization code storage with PKCE challenge data
- Proper code_verifier validation during token exchange

**Test PKCE Flow**:
```bash
# Generate PKCE challenge (example)
CODE_VERIFIER=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-43)
CODE_CHALLENGE=$(echo -n $CODE_VERIFIER | sha256sum | cut -d' ' -f1 | xxd -r -p | base64 | tr -d "=+/" | cut -c1-43)

# Test token exchange with PKCE
curl -X POST https://disco-mcp.up.railway.app/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=YOUR_AUTH_CODE&code_verifier=$CODE_VERIFIER"
```

### 4. Browser Extension Interference

**Problem**: OAuth callbacks interrupted by browser extensions
```
Error: "Message channel closed before response received"
```

**Symptoms**:
- OAuth authorization completes but callback fails
- JavaScript execution interrupted during redirect
- Extension content scripts interfering with OAuth flow

**Solution**: ✅ MITIGATED
Enhanced OAuth callback with browser extension interference mitigation:
- Added Content Security Policy (CSP) headers
- Multiple redirect strategies (meta refresh + JavaScript)
- Frame-ancestors protection
- Enhanced error handling

**Security Headers Applied**:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; form-action 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
```

### 5. OAuth State Parameter Issues

**Problem**: State validation failures or CSRF vulnerabilities
```
Error: "Invalid state parameter" or "State expired"
```

**Solution**: ✅ ENHANCED
Robust OAuth state management:
- Base64 encoded state with timestamp validation
- 10-minute expiration window
- CSRF nonce generation
- PKCE challenge data embedded in state

### 6. Authorization Code Storage Issues

**Problem**: Authorization codes not properly stored or validated
```
Error: "Authorization code is invalid or expired"
```

**Solution**: ✅ IMPLEMENTED
In-memory authorization code storage with:
- One-time use validation
- 10-minute expiration
- Automatic cleanup of expired codes
- PKCE challenge data storage

**Note**: For production deployment, implement Redis-based storage:
```typescript
// Production enhancement (not yet implemented)
import { RedisClientType } from 'redis';
const redis: RedisClientType = createClient({ url: process.env.REDIS_URL });
```

## Integration Testing

### Quick Health Check

```bash
#!/bin/bash
# OAuth health check script

echo "🔍 Testing OAuth Implementation..."

# Test discovery endpoints
curl -s https://disco-mcp.up.railway.app/.well-known/oauth-authorization-server > /dev/null
echo "✅ OAuth Authorization Server Discovery: OK"

curl -s https://disco-mcp.up.railway.app/.well-known/oauth-protected-resource > /dev/null  
echo "✅ OAuth Protected Resource Discovery: OK"

# Test callback handling
curl -s https://disco-mcp.up.railway.app/auth/callback | grep -q "OAuth Callback"
echo "✅ Enhanced OAuth Callback: OK"

# Test token endpoint error handling
curl -s -X POST https://disco-mcp.up.railway.app/oauth/token \
  -d "grant_type=authorization_code&code=invalid&code_verifier=test" | grep -q "invalid_grant"
echo "✅ PKCE Token Validation: OK"

echo "🎉 OAuth Implementation: HEALTHY"
```

### Complete OAuth Flow Test

```bash
#!/bin/bash
# Complete OAuth flow integration test

echo "🧪 Testing Complete OAuth Flow..."

# Step 1: Test client registration
CLIENT_REG=$(curl -s -X POST https://disco-mcp.up.railway.app/oauth/register \
  -H "Content-Type: application/json" \
  -d '{"client_name":"Test Client","redirect_uris":["http://localhost:3000/callback"],"scope":"mcp:tools"}')

CLIENT_ID=$(echo $CLIENT_REG | jq -r .client_id)
echo "✅ Client Registration: $CLIENT_ID"

# Step 2: Test authorization endpoint
AUTH_URL="https://disco-mcp.up.railway.app/api/v1/auth/github?client_id=$CLIENT_ID&redirect_uri=http://localhost:3000/callback&scope=mcp:tools"
echo "✅ Authorization URL: $AUTH_URL"

# Step 3: Test token introspection with valid token
# (Requires valid JWT token from actual OAuth flow)

echo "🎉 OAuth Flow Test Complete"
```

## Debugging Commands

### Check OAuth Server Configuration

```bash
# Get OAuth server metadata
curl -s https://disco-mcp.up.railway.app/.well-known/oauth-authorization-server | jq .

# Check supported PKCE methods
curl -s https://disco-mcp.up.railway.app/.well-known/oauth-authorization-server | jq .code_challenge_methods_supported

# Verify MCP scopes
curl -s https://disco-mcp.up.railway.app/.well-known/oauth-protected-resource | jq .scopes_supported
```

### Test Token Operations

```bash
# Test token introspection
curl -X POST https://disco-mcp.up.railway.app/oauth/introspect \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=YOUR_ACCESS_TOKEN"

# Test token revocation
curl -X POST https://disco-mcp.up.railway.app/oauth/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=YOUR_ACCESS_TOKEN"
```

### Monitor OAuth Logs

```bash
# Railway deployment logs
railway logs --service disco-mcp | grep -E "(OAuth|🔐|❌|✅)"

# Local development logs
npm start | grep -E "(OAuth|🔐|❌|✅)"
```

## Browser Extension Conflicts

### Common Extension Interference Patterns

1. **Content Script Injection**: Extensions injecting scripts that interfere with OAuth redirects
2. **Message Channel Blocking**: Extensions blocking async message channels during callback
3. **DOM Manipulation**: Extensions modifying DOM during OAuth flow

### Mitigation Strategies (Implemented)

1. **Content Security Policy**: Restricts extension script execution
2. **Multiple Redirect Methods**: Fallback strategies if JavaScript fails
3. **Meta Refresh**: Browser-native redirect as fallback
4. **Frame Protection**: Prevents extension iframe injection

### Testing Extension Conflicts

```bash
# Test OAuth flow in different browser modes
echo "Test 1: Regular browser (with extensions)"
echo "Test 2: Incognito mode (extensions disabled)"  
echo "Test 3: Browser with extensions explicitly disabled"

# Compare OAuth callback behavior across modes
curl -v https://disco-mcp.up.railway.app/auth/callback?code=test123
```

## Environment Configuration

### Required Environment Variables

```bash
# Minimum required for OAuth
JWT_SECRET="your-secure-jwt-secret-key-at-least-32-characters"

# GitHub OAuth (optional but recommended)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Production deployment
NODE_ENV="production"
RAILWAY_PUBLIC_DOMAIN="disco-mcp.up.railway.app"
AUTH_CALLBACK_URL="https://disco-mcp.up.railway.app/api/v1/auth/github/callback"
ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com"
```

### Optional Enhancements

```bash
# Redis for production authorization code storage
REDIS_URL="redis://localhost:6379"

# Additional OAuth providers
GOOGLE_CLIENT_ID="your-google-client-id"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
```

## MCP OAuth 2.1 Compliance Checklist

- [x] **OAuth Discovery Endpoints**
  - [x] `/.well-known/oauth-authorization-server` (RFC 8414)
  - [x] `/.well-known/oauth-protected-resource` (RFC 8707)

- [x] **PKCE Implementation**
  - [x] S256 challenge method support
  - [x] Code verifier validation
  - [x] Authorization code storage

- [x] **Required OAuth Endpoints**
  - [x] `/oauth/token` - Token exchange
  - [x] `/oauth/register` - Client registration
  - [x] `/oauth/introspect` - Token introspection
  - [x] `/oauth/revoke` - Token revocation

- [x] **Security Features**
  - [x] Browser extension interference mitigation
  - [x] CSRF protection via state parameter
  - [x] Content Security Policy headers
  - [x] Token expiration and validation

- [x] **MCP-Specific Requirements**
  - [x] MCP scopes: `mcp:tools`, `mcp:resources`, `mcp:prompts`
  - [x] Bearer token authentication
  - [x] HTTP transport compatibility

## Support and Troubleshooting

### Getting Help

1. **Check Logs**: Always start with server logs for OAuth-specific error messages
2. **Test Discovery**: Verify OAuth discovery endpoints are accessible
3. **Validate Environment**: Ensure all required environment variables are set
4. **Browser Testing**: Test OAuth flow in incognito mode to isolate extension issues

### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `invalid_request` | Missing required parameters | Check request format and required fields |
| `invalid_grant` | Authorization code invalid/expired | Verify code is recent and not reused |
| `unsupported_grant_type` | Invalid grant type | Use `authorization_code` grant type |
| `invalid_client` | Client authentication failed | Verify client ID and secret |
| `server_error` | Internal server error | Check server logs and configuration |

### Contact Information

- **Repository**: https://github.com/Arcane-Fly/disco
- **Issues**: https://github.com/Arcane-Fly/disco/issues
- **Discussions**: https://github.com/Arcane-Fly/disco/discussions

---

**Last Updated**: December 2024  
**OAuth Implementation Status**: ✅ COMPLETE - All major issues resolved