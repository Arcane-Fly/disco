# Connection Troubleshooting Matrix

This comprehensive guide helps diagnose and resolve connection issues with the Disco MCP Server across different platforms and scenarios.

## 🔍 Quick Diagnosis

### Connection Status Check

| Issue | Symptoms | Platform | Quick Fix |
|-------|----------|----------|-----------|
| **Server Down** | Cannot reach any endpoint | All | Check https://disco-mcp.up.railway.app/health |
| **Authentication Failed** | 401/403 errors | All | Regenerate token via GitHub OAuth |
| **CORS Blocked** | Preflight errors in browser | ChatGPT/Claude Web | Check browser console, try incognito |
| **Token Expired** | Initial connection, then failures | All | Refresh token or re-authenticate |
| **Rate Limited** | 429 errors | All | Wait 1 minute, reduce request frequency |

## 📊 Platform-Specific Diagnostics

### ChatGPT.com Connectors

#### Common Issues

1. **Connector Not Found**
   ```
   ❌ Symptoms: "Unable to load connector" error
   ✅ Solution: Verify URL: https://disco-mcp.up.railway.app/openapi.json
   🔧 Test: curl https://disco-mcp.up.railway.app/openapi.json
   ```

2. **Authentication Loop**
   ```
   ❌ Symptoms: Continuous authentication redirects
   ✅ Solution: Clear ChatGPT cookies, try incognito mode
   🔧 Test: Check browser devtools for blocked cookies
   ```

3. **Tools Not Available**
   ```
   ❌ Symptoms: ChatGPT says "I don't have access to tools"
   ✅ Solution: Disconnect and reconnect connector
   🔧 Test: Check ChatGPT settings → Connectors for green status
   ```

#### Diagnostic Commands

```bash
# Test OpenAPI specification
curl -s https://disco-mcp.up.railway.app/openapi.json | jq .info

# Test CORS for ChatGPT
curl -X OPTIONS \
  -H "Origin: https://chat.openai.com" \
  -H "Access-Control-Request-Method: POST" \
  https://disco-mcp.up.railway.app/api/v1/auth/github

# Test plugin manifest
curl -s https://disco-mcp.up.railway.app/.well-known/ai-plugin.json
```

### Claude.ai External APIs

#### Common Issues

1. **API Connection Failed**
   ```
   ❌ Symptoms: "Cannot connect to external API" 
   ✅ Solution: Check base URL: https://disco-mcp.up.railway.app/mcp
   🔧 Test: curl -H "Authorization: Bearer TOKEN" https://disco-mcp.up.railway.app/mcp
   ```

2. **Invalid Bearer Token**
   ```
   ❌ Symptoms: 401 Unauthorized responses
   ✅ Solution: Get fresh token from https://disco-mcp.up.railway.app/
   🔧 Test: curl -H "Authorization: Bearer TOKEN" https://disco-mcp.up.railway.app/api/v1/auth/verify
   ```

3. **MCP Protocol Errors**
   ```
   ❌ Symptoms: Invalid JSON-RPC responses
   ✅ Solution: Use HTTP Stream transport, not legacy SSE
   🔧 Test: POST to /mcp with JSON-RPC 2.0 format
   ```

#### Diagnostic Commands

```bash
# Test MCP endpoint
curl -X POST https://disco-mcp.up.railway.app/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Test authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://disco-mcp.up.railway.app/api/v1/auth/verify

# Test capabilities
curl https://disco-mcp.up.railway.app/capabilities
```

### Claude Desktop (MCP Client)

#### Common Issues

1. **Server Not Found**
   ```
   ❌ Symptoms: "Failed to connect to server" in Claude Desktop
   ✅ Solution: Check config file location and JSON syntax
   🔧 Test: Validate JSON in online JSON validator
   ```

2. **Transport Protocol Error**
   ```
   ❌ Symptoms: Connection established but tools fail
   ✅ Solution: Use "http-stream" transport, not "http"
   🔧 Test: Check Claude Desktop logs for transport errors
   ```

3. **Token Format Error**
   ```
   ❌ Symptoms: Authentication errors in logs
   ✅ Solution: Ensure token starts with "eyJ" (JWT format)
   🔧 Test: Decode JWT at jwt.io to verify structure
   ```

#### Configuration Validation

**Config File Locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json`

**Valid Configuration:**
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {
        "type": "bearer",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

## 🛠️ Environment Validation

### Required Environment Variables

Check these are properly set on the server:

```bash
# Core variables
echo $JWT_SECRET          # Should be 32+ character string
echo $ALLOWED_ORIGINS     # Should include your platform domains
echo $WEBCONTAINER_API_KEY # Should be valid StackBlitz key

# Optional but recommended
echo $GITHUB_CLIENT_ID    # For GitHub OAuth
echo $GITHUB_CLIENT_SECRET
echo $REDIS_URL          # For session persistence
```

### Missing Configuration Detection

**GitHub OAuth Not Configured:**
```json
{
  "status": "error",
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "GitHub OAuth not configured - service unavailable",
    "details": {
      "missing_env_vars": ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
      "setup_instructions": {
        "step_1": "Create a GitHub OAuth App at https://github.com/settings/applications/new",
        "step_2": "Set Authorization callback URL to your domain + /api/v1/auth/github/callback",
        "step_3": "Configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables"
      }
    }
  }
}
```

## 🔧 Health Check Matrix

### Endpoint Health Verification

| Endpoint | Expected Status | Test Command |
|----------|----------------|--------------|
| Basic Health | 200 OK | `curl https://disco-mcp.up.railway.app/health` |
| Capabilities | 200 OK | `curl https://disco-mcp.up.railway.app/capabilities` |
| OpenAPI Spec | 200 OK | `curl https://disco-mcp.up.railway.app/openapi.json` |
| GitHub Auth | 302 Redirect | `curl -I https://disco-mcp.up.railway.app/api/v1/auth/github` |
| MCP Endpoint | 400 Bad Request | `curl -X POST https://disco-mcp.up.railway.app/mcp` |

### Service Status Interpretation

```bash
# Healthy server response
{
  "status": "healthy",
  "uptime": 3600,
  "containers": {"active": 5, "max": 50},
  "services": {
    "webcontainer": "enabled",
    "redis": "enabled",
    "github": "enabled"
  }
}

# Warning state (some services disabled)
{
  "status": "warning",
  "services": {
    "webcontainer": "enabled", 
    "redis": "disabled",      # In-memory sessions only
    "github": "disabled"      # OAuth unavailable
  }
}

# Error state (critical issues)
{
  "status": "error",
  "error": "Database connection failed"
}
```

## 🐛 Advanced Debugging

### Browser Debug Mode

1. **Open Developer Tools** (F12)
2. **Network Tab** → Clear → Attempt connection
3. **Look for**:
   - Failed requests (red)
   - CORS errors (console)
   - Authentication redirects
   - Rate limit headers

### Server-Side Debugging

```bash
# Enable debug mode
export DEBUG=disco:*

# Check server logs
railway logs --service disco

# Test MCP compliance
./test-mcp-compliance.sh
```

### Token Debugging

```bash
# Decode JWT token (replace YOUR_TOKEN)
echo "YOUR_TOKEN" | cut -d. -f2 | base64 -d | jq .

# Check token expiration
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://disco-mcp.up.railway.app/api/v1/auth/verify
```

## 🔄 Recovery Procedures

### Complete Reset

1. **Clear browser data** for ChatGPT/Claude domains
2. **Regenerate authentication token**
3. **Update all configurations** with new token
4. **Restart Claude Desktop** (if applicable)
5. **Test with simple commands** first

### Gradual Recovery

1. **Test server health** first
2. **Verify authentication** works
3. **Test one capability** at a time
4. **Scale up** to complex operations

### Emergency Fallback

If all else fails:
1. Use direct API calls via curl/Postman
2. Check Railway deployment status
3. Report issue with debug information
4. Use local development server as backup

## 📞 Getting Support

### Information to Collect

When reporting issues, include:

```bash
# Server health
curl -s https://disco-mcp.up.railway.app/health

# Your browser/client info
echo "Platform: ChatGPT/Claude/Desktop"
echo "Browser: Chrome/Firefox/Safari"
echo "OS: Windows/Mac/Linux"

# Error details
# - Exact error messages
# - Screenshots of issues
# - Network tab failures
# - Console error logs
```

### Support Channels

- **GitHub Issues**: https://github.com/Arcane-Fly/disco/issues
- **Documentation**: https://disco-mcp.up.railway.app/docs
- **Health Status**: https://disco-mcp.up.railway.app/health
- **API Reference**: https://disco-mcp.up.railway.app/openapi.json

---

**Last Updated**: 2025-09-22  
**Troubleshooting Version**: 1.0  
**Server Compatibility**: v2.0.0+