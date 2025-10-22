# ChatGPT Integration Verification Guide

This document provides step-by-step instructions for verifying that the Disco MCP Server is properly configured for ChatGPT integration.

## Quick Verification Checklist

After deploying to Railway, verify these endpoints:

### 1. Discovery Endpoints ✅

```bash
# Root service discovery
curl https://disco-mcp.up.railway.app/

# Configuration for ChatGPT
curl https://disco-mcp.up.railway.app/config

# MCP capabilities
curl https://disco-mcp.up.railway.app/capabilities
```

### 2. ChatGPT Plugin Manifests ✅

```bash
# OpenAI plugin manifest
curl https://disco-mcp.up.railway.app/.well-known/ai-plugin.json

# MCP standard configuration
curl https://disco-mcp.up.railway.app/.well-known/mcp.json

# OpenAPI specification
curl https://disco-mcp.up.railway.app/openapi.json
```

### 3. Documentation Interfaces ✅

- **Swagger UI**: https://disco-mcp.up.railway.app/docs
- **API Reference**: https://disco-mcp.up.railway.app/openapi.json

### 4. CORS and Security Headers ✅

```bash
# Test CORS preflight for ChatGPT
curl -X OPTIONS \
  -H "Origin: https://chat.openai.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization" \
  https://disco-mcp.up.railway.app/api/v1/auth/login

# Verify security headers
curl -I https://disco-mcp.up.railway.app/
```

Expected headers:

- `Access-Control-Allow-Origin: https://chat.openai.com`
- `Content-Security-Policy: frame-ancestors 'self' https://chat.openai.com https://chatgpt.com`
- Rate limiting headers
- Security headers (Helmet.js)

## ChatGPT Connection Process

### Method 1: Custom GPT with API Integration

1. **Create Custom GPT**
   - Go to [ChatGPT GPTs](https://chat.openai.com/gpts)
   - Click "Create a GPT"

2. **Configure API Connection**
   - In Actions section, click "Connect to external API"
   - Select "Custom API"
   - Enter: `https://disco-mcp.up.railway.app/openapi.json`

3. **Set Authentication**
   - Choose "Bearer" authentication
   - Users will need to provide JWT tokens from `/api/v1/auth/login`

### Method 2: Direct Plugin Integration

1. **Use Plugin Manifest**
   - ChatGPT can discover the service via: `https://disco-mcp.up.railway.app/.well-known/ai-plugin.json`

2. **OpenAPI Auto-Discovery**
   - The manifest points to: `https://disco-mcp.up.railway.app/openapi.json`
   - ChatGPT can automatically generate tool definitions

## Environment Variables for Production

```bash
# Core ChatGPT compliance
railway variables set ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com"
railway variables set WEBSOCKET_URL="wss://disco-mcp.up.railway.app/socket.io"

# Security
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set WEBCONTAINER_API_KEY=your-stackblitz-key

# GitHub OAuth (optional)
railway variables set GITHUB_REDIRECT_URI="https://disco-mcp.up.railway.app/oauth/github/callback"
```

## Success Criteria

### ✅ All Implemented

- [x] Root discovery endpoint returns service information
- [x] OpenAPI documentation served at `/docs` and `/openapi.json`
- [x] ChatGPT plugin manifest at `/.well-known/ai-plugin.json`
- [x] MCP configuration at `/.well-known/mcp.json`
- [x] Configuration endpoint exposes WebSocket URLs
- [x] CORS headers allow both `chat.openai.com` and `chatgpt.com`
- [x] CSP headers permit frame-ancestors from ChatGPT domains
- [x] Explicit OPTIONS handler for preflight requests
- [x] Rate limiting and security headers properly configured

### Response Examples

**Root Discovery** (`GET /`):

```json
{
  "service": "disco",
  "version": "1.0.0",
  "name": "Disco MCP Server",
  "description": "MCP (Model Control Plane) server with WebContainer integration for ChatGPT",
  "docs": "/docs",
  "openapi": "/openapi.json",
  "config": "/config",
  "capabilities": "/capabilities",
  "health": "/health",
  "environment": "production",
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

**Configuration** (`GET /config`):

```json
{
  "websocket": "wss://disco-mcp.up.railway.app/socket.io",
  "api_url": "https://disco-mcp.up.railway.app/api/v1",
  "auth_required": true,
  "rate_limit": {
    "max": 100,
    "window_ms": 60000
  },
  "environment": "production"
}
```

**Plugin Manifest** (`GET /.well-known/ai-plugin.json`):

```json
{
  "schema_version": "v1",
  "name_for_human": "Disco Code Runner",
  "name_for_model": "disco",
  "description_for_human": "Full development environment with repository access, terminal operations, and computer use capabilities.",
  "description_for_model": "Provides complete development environment through WebContainers with file operations, git integration, terminal access, and browser automation for code development and testing.",
  "auth": {
    "type": "none"
  },
  "api": {
    "type": "openapi",
    "url": "https://disco-mcp.up.railway.app/openapi.json"
  },
  "logo_url": "https://disco-mcp.up.railway.app/logo.png",
  "contact_email": "support@disco-mcp.dev",
  "legal_info_url": "https://disco-mcp.up.railway.app/legal"
}
```

## MCP Tools Exposed to ChatGPT

Disco exposes **10 high-level development operation tools** via the MCP protocol:

### Available Tools

1. **file_read** - Read file contents with intelligent encoding detection
2. **file_write** - Write content to files with atomic operations
3. **file_search** - Search for files and content with advanced filtering
4. **terminal_execute** - Execute commands in WebContainer terminal with streaming
5. **git_clone** - Clone repositories with authentication support
6. **git_commit** - Create Git commits with files and message
7. **computer_use_screenshot** - Take screenshots using browser automation
8. **computer_use_click** - Perform click actions on web page elements
9. **ai_complete** - Request AI completions from connected language models
10. **code_analyze** - Analyze code structure, dependencies, and quality metrics

### Tool Discovery

ChatGPT can discover available tools via:

```bash
curl -X POST https://disco-mcp.up.railway.app/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### Tool Invocation

ChatGPT invokes tools via:

```bash
curl -X POST https://disco-mcp.up.railway.app/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"file_read",
      "arguments":{"path":"/README.md"}
    }
  }'
```

**Note**: These tools are abstracted as high-level development operations that map to underlying REST API endpoints. They provide ChatGPT with powerful development capabilities without requiring knowledge of WebContainer internals.

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes both ChatGPT domains
   - Check that OPTIONS requests return 204

2. **Plugin Discovery Fails**
   - Ensure `/.well-known/ai-plugin.json` is accessible
   - Verify OpenAPI URL is correct and returns valid JSON

3. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify auth endpoints are working

4. **WebSocket Connection Fails**
   - Confirm `WEBSOCKET_URL` is set correctly
   - Test WebSocket connection manually

5. **Tool Calls Fail**
   - Verify Bearer token is provided in Authorization header
   - Check tool name is spelled correctly (use tools/list to verify)
   - Ensure required parameters are provided per tool schema

### Monitoring

Monitor these metrics post-deployment:

- Request volume to discovery endpoints
- CORS preflight success rate
- Authentication success rate
- WebSocket connection rate
- API response times

---

**Implementation Status**: ✅ Complete - Ready for ChatGPT Integration  
**Last Updated**: 2024-01-26  
**Deployment**: https://disco-mcp.up.railway.app
