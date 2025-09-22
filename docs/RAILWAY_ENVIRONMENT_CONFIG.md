# Railway Environment Configuration Guide

## Overview

This guide provides comprehensive instructions for configuring Railway environment variables for the Disco MCP Server, ensuring optimal deployment and troubleshooting capabilities.

## Required Environment Variables

### Core Railway Configuration

```bash
# Essential Railway deployment settings
YARN_ENABLE_IMMUTABLE_INSTALLS=true  # Can be set to false for troubleshooting
NODE_ENV=production
PORT=3000  # Railway will automatically override this
```

### Railway Deployment Flexibility

The `YARN_ENABLE_IMMUTABLE_INSTALLS` variable provides deployment flexibility:

- **`true` (default)**: Enforces lockfile consistency, preventing deployment with mismatched dependencies
- **`false`**: Allows lockfile modifications during deployment, useful for troubleshooting dependency issues

#### Setting in Railway Console

```bash
# For production (recommended)
railway variables set YARN_ENABLE_IMMUTABLE_INSTALLS=true

# For troubleshooting only
railway variables set YARN_ENABLE_IMMUTABLE_INSTALLS=false
```

## Shared Variables Configuration

Railway's shared variable system allows centralized management of common configuration:

```bash
# Set shared variables once
railway variables set --shared JWT_SECRET=$(openssl rand -base64 32)
railway variables set --shared GITHUB_CLIENT_ID=your-github-client-id
railway variables set --shared GITHUB_CLIENT_SECRET=your-github-client-secret
railway variables set --shared ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com"

# Reference shared variables in service
railway variables set JWT_SECRET='${{shared.JWT_SECRET}}'
railway variables set GITHUB_CLIENT_ID='${{shared.GITHUB_CLIENT_ID}}'
railway variables set GITHUB_CLIENT_SECRET='${{shared.GITHUB_CLIENT_SECRET}}'
railway variables set ALLOWED_ORIGINS='${{shared.ALLOWED_ORIGINS}}'
```

## Add-on Service Integration

For PostgreSQL and Redis add-ons, Railway automatically provides connection variables:

```bash
# PostgreSQL (automatically set by Railway)
DATABASE_URL='${{Postgres.DATABASE_URL}}'
PGHOST='${{Postgres.PGHOST}}'
PGPORT='${{Postgres.PGPORT}}'
PGDATABASE='${{Postgres.PGDATABASE}}'
PGUSER='${{Postgres.PGUSER}}'
POSTGRES_PASSWORD='${{Postgres.POSTGRES_PASSWORD}}'

# Redis (automatically set by Railway)
REDIS_HOST='${{Redis.REDISHOST}}'
REDIS_PORT='${{Redis.REDISPORT}}'
REDIS_PASSWORD='${{Redis.REDISPASSWORD}}'
```

## Health Check Configuration

Railway uses the configured health check endpoint for deployment monitoring:

```json
{
  "deploy": {
    "healthCheckPath": "/health",
    "healthCheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Deployment Commands

The Railway deployment process follows this sequence:

1. **Install**: `corepack enable && corepack prepare yarn@4.9.2 --activate && yarn install --immutable`
2. **Build**: `yarn build:server && yarn build:next`
3. **Start**: `node dist/server.js`
4. **Health Check**: `GET /health`

## Troubleshooting

### Lockfile Synchronization Issues

If you encounter YN0028 errors:

```bash
# Temporarily disable immutable installs
railway variables set YARN_ENABLE_IMMUTABLE_INSTALLS=false

# Deploy to resolve dependency conflicts
railway up

# Re-enable immutable installs after fixing
railway variables set YARN_ENABLE_IMMUTABLE_INSTALLS=true
```

### Build Failures

For build troubleshooting:

```bash
# Check logs
railway logs

# Test locally with Railway environment
railway run yarn build

# Validate configuration
npm run railway:check-all
```

## Security Best Practices

1. **Never hardcode secrets** in the codebase
2. **Use Railway shared variables** for common configuration
3. **Rotate API keys regularly**
4. **Use environment-specific values** for different deployments

## References

- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Railway Shared Variables](https://docs.railway.app/develop/variables#shared-variables)
- [Railway Add-on Variables](https://docs.railway.app/databases/postgresql#connect-to-your-database)
- [Yarn Immutable Installs](https://yarnpkg.com/configuration/yarnrc#enableImmutableInstalls)