# Callback URL Configuration Guide

## Overview

This guide provides comprehensive instructions for configuring callback URLs for GitHub OAuth authentication across different environments (local, staging, and production).

## Table of Contents

1. [Understanding Callback URLs](#understanding-callback-urls)
2. [Environment-Specific Configurations](#environment-specific-configurations)
3. [GitHub OAuth App Setup](#github-oauth-app-setup)
4. [CORS Configuration](#cors-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Testing Your Configuration](#testing-your-configuration)

---

## Understanding Callback URLs

### What are Callback URLs?

Callback URLs (also called redirect URIs) are endpoints where OAuth providers redirect users after successful authentication. They are critical for:

- **Security**: Only whitelisted URLs can receive authentication tokens
- **User Flow**: Users are redirected back to your app after logging in
- **Token Exchange**: The authorization code is sent to this URL

### Why Multiple URLs?

Different environments need different callback URLs:

- **Local Development**: `http://localhost:3000/api/v1/auth/github/callback`
- **Staging**: `https://staging.yourapp.com/api/v1/auth/github/callback`
- **Production**: `https://yourapp.com/api/v1/auth/github/callback`

---

## Environment-Specific Configurations

### Local Development

**Callback URL**: `http://localhost:3000/api/v1/auth/github/callback`

**Configuration**:

1. Create `.env.local` file:
   ```bash
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_dev_github_client_id
   GITHUB_CLIENT_SECRET=your_dev_github_client_secret
   AUTH_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # JWT
   JWT_SECRET=your-local-jwt-secret-minimum-32-characters
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

2. GitHub OAuth App Settings:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/v1/auth/github/callback`

**Notes**:
- ⚠️ Use a separate GitHub OAuth App for local development
- ✅ Never commit `.env.local` to version control
- ✅ Use different client IDs/secrets for each environment

### Staging Environment

**Callback URL**: `https://staging.yourapp.com/api/v1/auth/github/callback`

**Configuration**:

1. Create `.env.staging` file:
   ```bash
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_staging_github_client_id
   GITHUB_CLIENT_SECRET=your_staging_github_client_secret
   AUTH_CALLBACK_URL=https://staging.yourapp.com/api/v1/auth/github/callback
   
   # CORS
   ALLOWED_ORIGINS=https://staging.yourapp.com
   
   # JWT
   JWT_SECRET=your-staging-jwt-secret-minimum-32-characters
   
   # Server
   PORT=3000
   NODE_ENV=staging
   ```

2. GitHub OAuth App Settings:
   - **Homepage URL**: `https://staging.yourapp.com`
   - **Authorization callback URL**: `https://staging.yourapp.com/api/v1/auth/github/callback`

**Notes**:
- ✅ Use HTTPS in staging (required by GitHub for non-localhost)
- ✅ Configure SSL certificates
- ✅ Test with staging data only

### Production Environment (Railway)

**Callback URL**: `https://disco-production.up.railway.app/api/v1/auth/github/callback`

**Configuration**:

1. Create `.env.production` file:
   ```bash
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_production_github_client_id
   GITHUB_CLIENT_SECRET=your_production_github_client_secret
   AUTH_CALLBACK_URL=https://disco-production.up.railway.app/api/v1/auth/github/callback
   
   # CORS
   ALLOWED_ORIGINS=https://disco-production.up.railway.app,https://www.yourapp.com
   
   # JWT
   JWT_SECRET=your-production-jwt-secret-minimum-32-characters-use-secure-random
   
   # Server
   PORT=3000
   NODE_ENV=production
   
   # Railway-specific
   RAILWAY_STATIC_URL=disco-production.up.railway.app
   ```

2. Railway Environment Variables:
   - Set all variables in Railway dashboard
   - Never commit `.env.production` to version control

3. GitHub OAuth App Settings:
   - **Homepage URL**: `https://disco-production.up.railway.app`
   - **Authorization callback URL**: `https://disco-production.up.railway.app/api/v1/auth/github/callback`

**Notes**:
- ✅ Use Railway's environment variables feature
- ✅ Generate JWT_SECRET using: `openssl rand -base64 32`
- ✅ Enable HTTPS only
- ✅ Configure custom domain if available

---

## GitHub OAuth App Setup

### Creating a GitHub OAuth App

1. **Navigate to GitHub Settings**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"

2. **Fill in Application Details**
   - **Application name**: `Disco MCP Server - [Environment]`
     - Examples: "Disco MCP Server - Development", "Disco MCP Server - Production"
   - **Homepage URL**: Your application's URL
   - **Application description**: (optional) "MCP Server with collaborative features"
   - **Authorization callback URL**: Your callback URL

3. **Generate Client Credentials**
   - After creating, note your **Client ID**
   - Click "Generate a new client secret"
   - **Save both immediately** - you won't see the secret again!

4. **Configure Multiple Callback URLs**
   - GitHub OAuth Apps support only ONE callback URL per app
   - **Solution**: Create separate OAuth Apps for each environment
     - `Disco MCP - Development`
     - `Disco MCP - Staging`
     - `Disco MCP - Production`

### Security Best Practices

- ✅ Create separate OAuth Apps for each environment
- ✅ Use different Client IDs and Secrets
- ✅ Rotate secrets periodically (every 90 days)
- ✅ Store secrets in environment variables, never in code
- ✅ Use secret management services (Railway Secrets, AWS Secrets Manager, etc.)
- ❌ Never commit credentials to version control
- ❌ Never share production credentials

---

## CORS Configuration

### What is CORS?

CORS (Cross-Origin Resource Sharing) controls which domains can make requests to your API. Proper configuration is critical for security.

### Environment-Specific CORS

#### Local Development

```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:8080
```

**Explanation**:
- Multiple localhost ports for different dev servers
- No trailing slashes
- Comma-separated list

#### Staging

```bash
ALLOWED_ORIGINS=https://staging.yourapp.com
```

**Explanation**:
- Single staging domain
- HTTPS required
- No wildcards (security risk)

#### Production

```bash
ALLOWED_ORIGINS=https://disco-production.up.railway.app,https://www.yourapp.com
```

**Explanation**:
- Production domain(s)
- Custom domain if configured
- Can include CDN domains

### Backend CORS Configuration

The server automatically configures CORS based on `ALLOWED_ORIGINS`:

```typescript
// src/server.ts
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

### Frontend CORS Headers

When making requests from the frontend:

```typescript
fetch('/api/v1/auth/github', {
  credentials: 'include', // Include cookies
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Redirect URI mismatch"

**Error Message**: `The redirect_uri MUST match the registered callback URL for this application.`

**Causes**:
- Callback URL doesn't match GitHub OAuth App settings
- HTTP vs HTTPS mismatch
- Trailing slash difference
- Port number mismatch

**Solutions**:
1. Verify `AUTH_CALLBACK_URL` in your `.env` file
2. Check GitHub OAuth App callback URL settings
3. Ensure exact match (including protocol, domain, port, path)
4. Remove trailing slashes from both

**Example Fix**:
```bash
# Wrong
AUTH_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback/

# Correct
AUTH_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
```

#### Issue 2: CORS Error

**Error Message**: `Access to fetch at 'http://localhost:3000/api/v1/auth/github' from origin 'http://localhost:3001' has been blocked by CORS policy`

**Causes**:
- Frontend origin not in `ALLOWED_ORIGINS`
- CORS credentials not configured
- Preflight request failing

**Solutions**:
1. Add frontend origin to `ALLOWED_ORIGINS`
2. Ensure `credentials: 'include'` in fetch requests
3. Check server CORS configuration

**Example Fix**:
```bash
# Before
ALLOWED_ORIGINS=http://localhost:3000

# After
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Issue 3: "Cannot read property 'GITHUB_CLIENT_ID'"

**Error Message**: `Cannot read property 'GITHUB_CLIENT_ID' of undefined`

**Causes**:
- Environment variables not loaded
- Missing `.env` file
- Variables not set in Railway dashboard

**Solutions**:
1. Verify `.env` file exists
2. Check environment variable names (exact match)
3. Restart server after `.env` changes
4. For Railway: verify variables in dashboard

**Example Fix**:
```bash
# Create .env file
cp .env.example .env

# Edit .env with your values
GITHUB_CLIENT_ID=your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_client_secret
```

#### Issue 4: Callback URL Works Locally, Fails in Production

**Causes**:
- Using localhost callback URL in production
- Wrong GitHub OAuth App (dev instead of prod)
- Railway domain mismatch

**Solutions**:
1. Create separate OAuth App for production
2. Update `AUTH_CALLBACK_URL` with Railway domain
3. Add Railway domain to GitHub OAuth App

**Example Fix**:
```bash
# Production .env
AUTH_CALLBACK_URL=https://disco-production.up.railway.app/api/v1/auth/github/callback

# GitHub OAuth App Settings
Authorization callback URL: https://disco-production.up.railway.app/api/v1/auth/github/callback
```

#### Issue 5: JWT Errors After OAuth Success

**Error Message**: `jwt malformed` or `invalid signature`

**Causes**:
- Missing `JWT_SECRET`
- Different JWT_SECRET between environments
- Secret too short (less than 32 characters)

**Solutions**:
1. Generate secure JWT secret: `openssl rand -base64 32`
2. Set in all environments
3. Ensure minimum 32 characters

**Example Fix**:
```bash
# Generate secure secret
openssl rand -base64 32
# Output: 8xKz9J4P2mN7vQ1wR5tY6uI0oP9lK8jH3gF2dS1aZ4c=

# Add to .env
JWT_SECRET=8xKz9J4P2mN7vQ1wR5tY6uI0oP9lK8jH3gF2dS1aZ4c=
```

---

## Testing Your Configuration

### Manual Testing with cURL

#### Test 1: OAuth Initiation

```bash
# Local
curl -v http://localhost:3000/api/v1/auth/github

# Production
curl -v https://disco-production.up.railway.app/api/v1/auth/github
```

**Expected Response**: Redirect to GitHub OAuth page

#### Test 2: Callback URL (after OAuth)

```bash
# Replace CODE with actual authorization code
curl -v "http://localhost:3000/api/v1/auth/github/callback?code=CODE"
```

**Expected Response**: Redirect with JWT token

#### Test 3: CORS Preflight

```bash
curl -v -X OPTIONS http://localhost:3000/api/v1/auth/github \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"
```

**Expected Response**: CORS headers present

### Automated Testing

Create a test script `scripts/test-callback-urls.sh`:

```bash
#!/bin/bash

echo "Testing Callback URL Configuration..."

# Test 1: Environment variables
echo "1. Checking environment variables..."
[ -z "$GITHUB_CLIENT_ID" ] && echo "❌ GITHUB_CLIENT_ID not set" || echo "✅ GITHUB_CLIENT_ID set"
[ -z "$GITHUB_CLIENT_SECRET" ] && echo "❌ GITHUB_CLIENT_SECRET not set" || echo "✅ GITHUB_CLIENT_SECRET set"
[ -z "$AUTH_CALLBACK_URL" ] && echo "❌ AUTH_CALLBACK_URL not set" || echo "✅ AUTH_CALLBACK_URL set"
[ -z "$ALLOWED_ORIGINS" ] && echo "❌ ALLOWED_ORIGINS not set" || echo "✅ ALLOWED_ORIGINS set"

# Test 2: Server health
echo "2. Testing server health..."
curl -f http://localhost:3000/health && echo "✅ Server responding" || echo "❌ Server not responding"

# Test 3: OAuth endpoint
echo "3. Testing OAuth endpoint..."
curl -f http://localhost:3000/api/v1/auth/github && echo "✅ OAuth endpoint accessible" || echo "❌ OAuth endpoint failed"

echo "Testing complete!"
```

### Integration Testing

```typescript
// test/auth-callback.test.ts
describe('OAuth Callback Configuration', () => {
  test('should have correct callback URL configured', () => {
    expect(process.env.AUTH_CALLBACK_URL).toBeDefined();
    expect(process.env.AUTH_CALLBACK_URL).toMatch(/\/api\/v1\/auth\/github\/callback$/);
  });

  test('should have CORS origins configured', () => {
    expect(process.env.ALLOWED_ORIGINS).toBeDefined();
    const origins = process.env.ALLOWED_ORIGINS!.split(',');
    expect(origins.length).toBeGreaterThan(0);
  });

  test('should redirect to GitHub OAuth', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/github');
    expect(response.redirected).toBe(true);
    expect(response.url).toContain('github.com');
  });
});
```

---

## Quick Reference

### Environment Variable Checklist

- [ ] `GITHUB_CLIENT_ID` - OAuth client ID
- [ ] `GITHUB_CLIENT_SECRET` - OAuth client secret
- [ ] `AUTH_CALLBACK_URL` - Full callback URL with protocol
- [ ] `ALLOWED_ORIGINS` - Comma-separated list of allowed origins
- [ ] `JWT_SECRET` - Secure random string (32+ characters)
- [ ] `PORT` - Server port (usually 3000)
- [ ] `NODE_ENV` - Environment (development/staging/production)

### GitHub OAuth App Checklist

- [ ] Separate OAuth App for each environment
- [ ] Homepage URL matches environment domain
- [ ] Callback URL matches `AUTH_CALLBACK_URL` exactly
- [ ] Client ID and Secret stored securely
- [ ] Secrets documented in secure location

### CORS Checklist

- [ ] All frontend domains in `ALLOWED_ORIGINS`
- [ ] No trailing slashes on domains
- [ ] HTTPS in staging and production
- [ ] `credentials: 'include'` in frontend requests

---

## Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [CORS MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Test with validation script
4. Open an issue on GitHub

## Version History

- **v1.0.0** (2025-01-07): Initial guide
  - Environment-specific configurations
  - GitHub OAuth setup instructions
  - CORS configuration
  - Comprehensive troubleshooting
  - Testing procedures
