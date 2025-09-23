# Connection Troubleshooting Matrix

This comprehensive troubleshooting guide helps diagnose and resolve connection issues between MCP clients and the Disco MCP Server, with platform-specific solutions and automated validation tools.

## Table of Contents

- [Quick Diagnosis Tool](#quick-diagnosis-tool)
- [Platform-Specific Issues](#platform-specific-issues)
- [Authentication Problems](#authentication-problems)
- [Network and Connectivity](#network-and-connectivity)
- [Configuration Issues](#configuration-issues)
- [Validation Tools](#validation-tools)
- [Advanced Debugging](#advanced-debugging)

## Quick Diagnosis Tool

Use this step-by-step checklist to quickly identify the root cause of connection issues:

### ✅ Step 1: Basic Connectivity
```bash
# Test server availability
curl -I "https://disco-mcp.up.railway.app/health"
# Expected: HTTP/1.1 200 OK
```

### ✅ Step 2: Authentication Status
```bash
# Test token validity (replace YOUR_TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/auth/status"
# Expected: {"status": "success", "data": {"authenticated": true}}
```

### ✅ Step 3: API Endpoint
```bash
# Test API accessibility
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/containers"
# Expected: {"status": "success", "data": {"containers": []}}
```

### ✅ Step 4: MCP Protocol
```bash
# Test MCP endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  "https://disco-mcp.up.railway.app/mcp"
# Expected: JSON-RPC response with capabilities
```

## Platform-Specific Issues

### Claude Desktop Issues

#### Issue: Server Not Found
**Symptoms:**
- "Server not found" error in Claude Desktop
- Disco doesn't appear in connections panel
- Connection timeout errors

**Solutions:**
✅ **Correct File Location**: Ensure config file is in the correct directory for your OS  
✅ **Valid JSON Format**: Use a JSON validator to check syntax  
✅ **Restart Claude Desktop**: Close completely and reopen after config changes  
✅ **Check URL**: Ensure URL is exactly `https://disco-mcp.up.railway.app/mcp`  
✅ **Transport Protocol**: Use `"transport": "http-stream"` for better compatibility  

**Working Configuration Template:**
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {
        "type": "bearer",
        "token": "your-jwt-token-here"
      }
    }
  }
}
```

### ChatGPT.com Connector Issues

#### Issue: Connector Not Found
**Symptoms:**
- "Connector not found" error
- "Invalid URL" message when adding connector
- Connector doesn't appear in list

**Solutions:**
✅ **Correct URL**: Use exact URL `https://disco-mcp.up.railway.app/openapi.json`  
✅ **Account Level**: Ensure you have appropriate ChatGPT subscription  
✅ **Clear Cache**: Clear browser cache and cookies for ChatGPT  
✅ **Try Incognito**: Use private/incognito browsing mode  
✅ **Different Browser**: Test with different browser  

## Authentication Problems

### JWT Token Issues

#### Expired Tokens
**Symptoms:**
- 401 Unauthorized errors
- "Token expired" messages
- Authentication worked before but fails now

**Solutions:**
```bash
# Check token expiry
echo "YOUR_TOKEN" | cut -d. -f2 | base64 -d | jq .exp
current_time=$(date +%s)
echo "Current time: $current_time"

# Get new token
curl "https://disco-mcp.up.railway.app/api/v1/auth/github"
```

## Validation Tools

### Automated Health Check Script

```bash
#!/bin/bash
# disco-health-check.sh

BASE_URL="https://disco-mcp.up.railway.app"
TOKEN="$1"

if [ -z "$TOKEN" ]; then
    echo "Usage: $0 <jwt-token>"
    exit 1
fi

echo "🔍 Disco MCP Server Health Check"
echo "=================================="

# Test 1: Server Health
echo -n "1. Server Health: "
if curl -sf "$BASE_URL/health" > /dev/null; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 2: Authentication
echo -n "2. Authentication: "
auth_response=$(curl -sf -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v1/auth/status")
if echo "$auth_response" | jq -e '.data.authenticated == true' > /dev/null; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

echo "🎉 All tests passed! Connection is healthy."
```

## Advanced Debugging

### Configuration Validator

```bash
#!/bin/bash
# validate-config.sh

config_file="$1"
echo "🔍 Validating Configuration: $config_file"

# Test JSON Syntax
if jq . "$config_file" > /dev/null 2>&1; then
    echo "✅ JSON Syntax: PASS"
else
    echo "❌ JSON Syntax: FAIL"
    exit 1
fi

echo "✅ Configuration validation complete!"
```

---

**Last Updated**: 2024-01-26  
**Troubleshooting Version**: 1.0  
**Supported Platforms**: Claude Desktop, ChatGPT.com, Claude.ai, Custom MCP Clients