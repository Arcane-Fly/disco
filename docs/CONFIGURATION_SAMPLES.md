# Working Configuration Samples

This directory contains ready-to-use configuration samples for various platforms and MCP clients.

## Claude Desktop Configuration

### Basic Configuration
File: `claude_desktop_config.json`
Location: 
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json` 
- **Linux**: `~/.config/claude/claude_desktop_config.json`

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

### Advanced Configuration with Error Handling
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {
        "type": "bearer", 
        "token": "your-jwt-token-here"
      },
      "timeout": 30000,
      "retries": 3,
      "capabilities": [
        "tools",
        "resources",
        "prompts", 
        "sampling",
        "completions"
      ]
    }
  }
}
```

## ChatGPT.com Connectors

### Direct Connector URL
Simply paste this URL into ChatGPT.com → Settings → Connectors:
```
https://disco-mcp.up.railway.app/openapi.json
```

### Custom GPT Actions Schema
For building custom GPTs, use this schema URL:
```
https://disco-mcp.up.railway.app/openapi.json
```

## Warp Terminal MCP Configuration

File: `~/.local/state/warp-terminal/mcp/servers.json`

```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http",
      "auth": {
        "type": "bearer",
        "token": "your-jwt-token-here"
      }
    }
  }
}
```

## VS Code MCP Extension

File: `.vscode/mcp-servers.json`

```json
{
  "mcpServers": {
    "disco": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "-H", "Authorization: Bearer your-jwt-token-here",
        "-d", "@-",
        "https://disco-mcp.up.railway.app/mcp"
      ]
    }
  }
}
```

## Environment Variables Setup

### Bash/Zsh (.bashrc, .zshrc)
```bash
# Disco MCP Server Configuration
export DISCO_MCP_URL="https://disco-mcp.up.railway.app"
export DISCO_MCP_TOKEN="your-jwt-token-here"
export DISCO_API_BASE="https://disco-mcp.up.railway.app/api/v1"
export DISCO_OPENAPI_URL="https://disco-mcp.up.railway.app/openapi.json"

# Quick test functions
disco_test() {
  curl "$DISCO_API_BASE/health"
}

disco_auth_test() {
  curl -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
    "$DISCO_MCP_URL/mcp" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
}
```

### PowerShell (Windows)
```powershell
# Add to $PROFILE
$env:DISCO_MCP_URL = "https://disco-mcp.up.railway.app"
$env:DISCO_MCP_TOKEN = "your-jwt-token-here"
$env:DISCO_API_BASE = "https://disco-mcp.up.railway.app/api/v1"
$env:DISCO_OPENAPI_URL = "https://disco-mcp.up.railway.app/openapi.json"

function Test-DiscoHealth {
  Invoke-RestMethod -Uri "$env:DISCO_API_BASE/health"
}

function Test-DiscoAuth {
  $headers = @{ "Authorization" = "Bearer $env:DISCO_MCP_TOKEN" }
  $body = @{
    jsonrpc = "2.0"
    method = "tools/list"
    id = 1
  } | ConvertTo-Json
  
  Invoke-RestMethod -Uri "$env:DISCO_MCP_URL/mcp" -Method POST -Headers $headers -Body $body -ContentType "application/json"
}
```

## Docker Compose Integration

```yaml
version: '3.8'
services:
  my-app:
    image: my-app:latest
    environment:
      - DISCO_MCP_URL=https://disco-mcp.up.railway.app
      - DISCO_MCP_TOKEN=${DISCO_MCP_TOKEN}
    volumes:
      - ./mcp-config:/app/mcp
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: disco-mcp-config
data:
  mcp-config.json: |
    {
      "servers": {
        "disco": {
          "url": "https://disco-mcp.up.railway.app/mcp",
          "transport": "http-stream",
          "auth": {
            "type": "bearer",
            "token": "${DISCO_MCP_TOKEN}"
          }
        }
      }
    }
  
---
apiVersion: v1
kind: Secret
metadata:
  name: disco-mcp-token
type: Opaque
stringData:
  token: "your-jwt-token-here"
```

## Testing Scripts

### Quick Connection Test (Bash)
```bash
#!/bin/bash
# test-disco-connection.sh

echo "🧪 Testing Disco MCP Server Connection..."

# Test 1: Health check
echo "1. Testing health endpoint..."
if curl -s "https://disco-mcp.up.railway.app/health" | jq -e '.status == "healthy"' > /dev/null; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# Test 2: OpenAPI spec
echo "2. Testing OpenAPI specification..."
if curl -s "https://disco-mcp.up.railway.app/openapi.json" | jq -e '.info.title' > /dev/null; then
  echo "✅ OpenAPI spec accessible"
else
  echo "❌ OpenAPI spec failed"
  exit 1
fi

# Test 3: MCP endpoint (requires token)
if [ -n "$DISCO_MCP_TOKEN" ]; then
  echo "3. Testing MCP endpoint..."
  RESPONSE=$(curl -s -w "%{http_code}" \
    -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
    "https://disco-mcp.up.railway.app/mcp")
  
  if echo "$RESPONSE" | grep -q "200$"; then
    echo "✅ MCP endpoint accessible"
  else
    echo "❌ MCP endpoint failed (check token)"
  fi
else
  echo "⚠️  Skipping MCP test (DISCO_MCP_TOKEN not set)"
fi

echo "🎉 Connection test complete!"
```

### PowerShell Connection Test
```powershell
# test-disco-connection.ps1

Write-Host "🧪 Testing Disco MCP Server Connection..." -ForegroundColor Green

# Test 1: Health check
Write-Host "1. Testing health endpoint..."
try {
  $health = Invoke-RestMethod -Uri "https://disco-mcp.up.railway.app/health"
  if ($health.status -eq "healthy") {
    Write-Host "✅ Health check passed" -ForegroundColor Green
  } else {
    Write-Host "❌ Health check failed" -ForegroundColor Red
  }
} catch {
  Write-Host "❌ Health check error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: OpenAPI spec
Write-Host "2. Testing OpenAPI specification..."
try {
  $openapi = Invoke-RestMethod -Uri "https://disco-mcp.up.railway.app/openapi.json"
  if ($openapi.info.title) {
    Write-Host "✅ OpenAPI spec accessible" -ForegroundColor Green
  }
} catch {
  Write-Host "❌ OpenAPI spec failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: MCP endpoint
if ($env:DISCO_MCP_TOKEN) {
  Write-Host "3. Testing MCP endpoint..."
  try {
    $headers = @{ "Authorization" = "Bearer $env:DISCO_MCP_TOKEN" }
    $body = @{ jsonrpc="2.0"; method="tools/list"; id=1 } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://disco-mcp.up.railway.app/mcp" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ MCP endpoint accessible" -ForegroundColor Green
  } catch {
    Write-Host "❌ MCP endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
  }
} else {
  Write-Host "⚠️  Skipping MCP test (DISCO_MCP_TOKEN not set)" -ForegroundColor Yellow
}

Write-Host "🎉 Connection test complete!" -ForegroundColor Green
```

## Getting Your Authentication Token

1. **Visit**: https://disco-mcp.up.railway.app/
2. **Click**: "🚀 Login with GitHub to Get Started"
3. **Authorize**: GitHub OAuth
4. **Copy**: Your JWT token from the interface

Or use the API directly:
```bash
# Start OAuth flow
open "https://disco-mcp.up.railway.app/api/v1/auth/github"

# After completing OAuth, your token will be available in the interface
```

## Troubleshooting

### Common Issues

1. **Token Expired**: Tokens expire after 1 hour. Re-authenticate to get a new token.
2. **Invalid Transport**: Use `"http-stream"` for Claude Desktop, not `"http"`.
3. **CORS Issues**: Only affects web browsers, not desktop clients.
4. **Connection Timeout**: Check if the server is running at https://disco-mcp.up.railway.app/health

### Debug Commands

```bash
# Check server status
curl https://disco-mcp.up.railway.app/health

# Verify OpenAPI spec
curl https://disco-mcp.up.railway.app/openapi.json | jq .info

# Test authentication (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  https://disco-mcp.up.railway.app/api/v1/auth/verify

# Test MCP endpoint
curl -X POST https://disco-mcp.up.railway.app/mcp \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

---

**💡 Pro Tip**: Replace `your-jwt-token-here` with your actual token from https://disco-mcp.up.railway.app/