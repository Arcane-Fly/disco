# Enhanced Claude Desktop & Web Integration Setup Guide

This comprehensive guide covers setting up the Disco MCP Server for Claude Desktop and Claude web interface integration with step-by-step instructions, troubleshooting, and success indicators.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites) 
- [Quick Setup (TL;DR)](#quick-setup-tldr)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Platform-Specific Configuration](#platform-specific-configuration)
- [Connection Testing](#connection-testing)
- [Troubleshooting](#troubleshooting)
- [Success Indicators](#success-indicators)

## Overview

The Disco MCP Server provides multiple integration paths with Claude:

### Claude Desktop (MCP Client)
- **Protocol**: MCP 2024-11-05 compliant
- **Transport**: HTTP Stream (recommended) or HTTP
- **Authentication**: Bearer JWT tokens
- **Benefits**: Native tool integration, real-time streaming

### Claude Web Interface (External API)
- **Protocol**: RESTful API with OpenAPI schema
- **Transport**: HTTPS
- **Authentication**: Bearer JWT tokens
- **Benefits**: Web-based integration, no desktop app required

### Claude API (Direct Integration)
- **Protocol**: Direct API calls
- **Transport**: HTTPS
- **Authentication**: Bearer JWT tokens
- **Benefits**: Custom applications, programmatic access

## Prerequisites

### Required
1. **GitHub Account** - For authentication and token generation
2. **Internet Connection** - For Railway-hosted deployment access
3. **One of the following**:
   - Claude Desktop app (for desktop integration)
   - Claude Pro/Team/Enterprise account (for web interface)
   - Claude API access (for direct integration)

### Recommended
- **Modern Browser** - Chrome, Firefox, Safari, or Edge (latest versions)
- **Basic JSON knowledge** - For configuration file editing
- **Text Editor** - For editing configuration files

## Quick Setup (TL;DR)

### For Claude Desktop (Recommended)

1. **Get Token**: Visit https://disco-mcp.up.railway.app/ → Login with GitHub
2. **Find Config File**: 
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/claude/claude_desktop_config.json`
3. **Add Configuration**:
   ```json
   {
     "servers": {
       "disco": {
         "url": "https://disco-mcp.up.railway.app/mcp",
         "transport": "http-stream",
         "auth": {"type": "bearer", "token": "your-jwt-token-here"}
       }
     }
   }
   ```
4. **Restart Claude Desktop**
5. **Test**: Ask Claude "What tools are available from Disco?"

### For Claude Web Interface

1. **Get Token**: Visit https://disco-mcp.up.railway.app/ → Login with GitHub
2. **Open Claude Settings**: https://claude.ai/ → Settings → External APIs
3. **Add Integration**:
   - **Name**: Disco MCP Server
   - **Base URL**: `https://disco-mcp.up.railway.app/mcp`
   - **Auth Type**: Bearer Token
   - **Token**: `your-jwt-token-here`
4. **Test Connection**
5. **Verify**: Create new conversation and test tools

## Detailed Setup Instructions

### Step 1: Authentication Setup

#### Method A: Web Interface (Recommended)

1. **Visit the Server**: Open https://disco-mcp.up.railway.app/ in your browser
2. **Initiate Login**: Click "🚀 Login with GitHub to Get Started"
3. **GitHub OAuth**: 
   - You'll be redirected to GitHub
   - Click "Authorize" to grant access
   - You'll be redirected back automatically
4. **Copy Token**: Once authenticated, your JWT token will be displayed
5. **Save Token**: Copy and save the token securely

#### Method B: Direct API (Advanced)

```bash
# Get authentication token via API
curl -X POST "https://disco-mcp.up.railway.app/api/v1/auth/github" \
  -H "Content-Type: application/json"
```

### Step 2: Platform-Specific Setup

#### Claude Desktop Integration

##### 2A. Locate Configuration File

**macOS:**
```bash
open "~/Library/Application Support/Claude/"
```

**Windows:**
```cmd
explorer "%APPDATA%\Claude"
```

**Linux:**
```bash
mkdir -p ~/.config/claude
```

##### 2B. Create/Edit Configuration

Create or edit `claude_desktop_config.json`:

```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {
        "type": "bearer", 
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
      "capabilities": [
        "tools",
        "resources", 
        "prompts",
        "sampling",
        "completions"
      ],
      "timeout": 30000,
      "retry": {
        "attempts": 3,
        "delay": 1000
      }
    }
  },
  "defaults": {
    "timeout": 30000,
    "retry": {
      "attempts": 3,
      "delay": 1000
    }
  }
}
```

##### 2C. Restart Claude Desktop

- Close Claude Desktop completely
- Wait 5 seconds
- Reopen Claude Desktop
- Check for "Disco" in the connections panel

#### Claude Web Interface Integration

##### 2A. Access External APIs

1. **Open Claude.ai**: Navigate to https://claude.ai/
2. **Login**: Use your Claude Pro/Team/Enterprise account
3. **Open Settings**: Click profile → Settings
4. **Find External APIs**: Look for "External APIs", "Integrations", or "API" section

##### 2B. Add Disco Integration

1. **Click "Add New API"** or similar button
2. **Fill in details**:
   - **Name**: `Disco MCP Server`
   - **Description**: `WebContainer development environment with MCP tools`
   - **Base URL**: `https://disco-mcp.up.railway.app/mcp`
   - **Authentication Type**: `Bearer Token`
   - **Token**: `your-jwt-token-here`
3. **Test Connection**: Click "Test" if available
4. **Save Configuration**

##### 2C. Alternative: OpenAPI Import

If your Claude account supports OpenAPI imports:

1. **Import Schema**: Use URL `https://disco-mcp.up.railway.app/openapi.json`
2. **Configure Auth**: Set Bearer token authentication
3. **Select Capabilities**: Enable desired tools and functions

## Platform-Specific Configuration

### Advanced Claude Desktop Configuration

#### Custom Capabilities Configuration
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {"type": "bearer", "token": "your-token"},
      "capabilities": {
        "tools": {
          "enabled": true,
          "allowed": ["*"],
          "denied": []
        },
        "resources": {
          "enabled": true,
          "subscribe": true
        },
        "prompts": {
          "enabled": true
        }
      },
      "environment": {
        "DISCO_ENVIRONMENT": "production",
        "MCP_CLIENT": "claude-desktop"
      }
    }
  }
}
```

#### Development vs Production Settings
```json
{
  "servers": {
    "disco-dev": {
      "url": "http://localhost:3000/mcp",
      "transport": "http-stream",
      "auth": {"type": "bearer", "token": "dev-token"}
    },
    "disco-prod": {
      "url": "https://disco-mcp.up.railway.app/mcp", 
      "transport": "http-stream",
      "auth": {"type": "bearer", "token": "prod-token"}
    }
  }
}
```

### Claude Web Interface Advanced

#### Headers Configuration
```json
{
  "name": "Disco MCP Server",
  "base_url": "https://disco-mcp.up.railway.app/mcp",
  "authentication": {
    "type": "bearer",
    "token": "your-jwt-token"
  },
  "headers": {
    "Content-Type": "application/json",
    "User-Agent": "Claude-Web-Interface/1.0",
    "Mcp-Client-Name": "claude-web",
    "Mcp-Client-Version": "1.0.0"
  },
  "timeout": 30000
}
```

## Connection Testing

### Claude Desktop Testing

1. **Check Connections Panel**: 
   - Open Claude Desktop
   - Look for "Disco" in the connections/servers list
   - Verify green/connected status

2. **Test Basic Functionality**:
   ```
   "What tools are available from the Disco MCP server?"
   ```

3. **Test Container Operations**:
   ```
   "Create a new development container and list its contents"
   ```

4. **Test File Operations**:
   ```
   "Create a file called hello.js with a simple console.log statement"
   ```

### Claude Web Interface Testing

1. **Verify API Connection**:
   - Check that API shows as "Connected" in settings
   - Look for green indicator or success message

2. **Test Tool Integration**:
   ```
   "Can you access the Disco MCP tools? List what's available."
   ```

3. **Test Container Creation**:
   ```
   "Create a new WebContainer and install Express.js"
   ```

## Troubleshooting

### Common Issues

#### 1. "Server not found" or Connection Failed

**Symptoms:**
- Claude shows "Server not found" error
- Connection status shows as offline/failed
- No Disco server appears in connections panel

**Solutions:**
✅ **Check Internet Connection**: Verify you can access https://disco-mcp.up.railway.app/health  
✅ **Verify URL**: Ensure URL is exactly `https://disco-mcp.up.railway.app/mcp`  
✅ **Check Server Status**: Visit https://disco-mcp.up.railway.app/health for server status  
✅ **Restart Client**: Close and reopen Claude Desktop completely  
✅ **Check Firewall**: Ensure your firewall allows outbound HTTPS connections  

#### 2. Authentication Failed

**Symptoms:**
- "Authentication failed" or "Unauthorized" errors
- 401 HTTP status codes
- Token-related error messages

**Solutions:**
✅ **Verify Token Format**: Token should start with `eyJ` (JWT format)  
✅ **Check Token Expiry**: Tokens expire after 1 hour, regenerate if needed  
✅ **Regenerate Token**: Get a fresh token from https://disco-mcp.up.railway.app/  
✅ **Copy Carefully**: Ensure no extra spaces or characters in token  
✅ **Test Token**: Use curl to verify token works:
```bash
curl -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/auth/status"
```

#### 3. Configuration File Issues

**Symptoms:**
- Claude Desktop doesn't start or crashes
- "Invalid configuration" errors
- Changes don't take effect

**Solutions:**
✅ **Validate JSON**: Use a JSON validator to check syntax  
✅ **Check File Location**: Ensure file is in correct directory  
✅ **File Permissions**: Ensure Claude can read the configuration file  
✅ **Backup Original**: Keep a backup of working configuration  
✅ **Restart Required**: Always restart Claude Desktop after config changes  

#### 4. Transport/Protocol Issues

**Symptoms:**
- Connection established but tools don't work
- Partial functionality
- Timeout errors

**Solutions:**
✅ **Use HTTP Stream**: Prefer "http-stream" over "http" transport  
✅ **Check MCP Version**: Ensure using MCP protocol 2024-11-05  
✅ **Verify Capabilities**: Ensure all required capabilities are enabled  
✅ **Network Issues**: Check for proxy/VPN interference  

#### 5. Web Interface Integration Issues

**Symptoms:**
- API appears connected but tools unavailable
- Partial tool functionality
- Request/response errors

**Solutions:**
✅ **Check Account Level**: Ensure you have Claude Pro/Team/Enterprise  
✅ **Verify Base URL**: Use `https://disco-mcp.up.railway.app/mcp`  
✅ **Test API Directly**: Use curl to test API endpoints  
✅ **Check Browser Console**: Look for JavaScript errors  
✅ **Clear Cache**: Clear browser cache and cookies  

### Advanced Debugging

#### Enable Debug Logging (Claude Desktop)
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream", 
      "auth": {"type": "bearer", "token": "your-token"},
      "debug": true,
      "log_level": "debug"
    }
  },
  "logging": {
    "level": "debug",
    "file": "claude_mcp_debug.log"
  }
}
```

#### Test with Curl
```bash
# Test MCP endpoint
curl -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' \
  "https://disco-mcp.up.railway.app/mcp"

# Test health endpoint
curl "https://disco-mcp.up.railway.app/health"

# Test auth status
curl -H "Authorization: Bearer your-token" \
  "https://disco-mcp.up.railway.app/api/v1/auth/status"
```

## Success Indicators

### Claude Desktop
- ✅ **"Disco" server appears** in Claude Desktop connections panel
- ✅ **Green connection indicator** or "Connected" status
- ✅ **Tools are available** when Claude lists capabilities
- ✅ **No error messages** in Claude Desktop interface
- ✅ **Container operations work** when tested

### Claude Web Interface  
- ✅ **API shows as "Connected"** in Claude settings
- ✅ **Green status indicator** for the Disco integration
- ✅ **Claude can access tools** when asked about capabilities
- ✅ **No authentication errors** in requests
- ✅ **Tool responses work correctly** when tested

### General Health Checks
- ✅ **Server health endpoint** returns 200 OK: https://disco-mcp.up.railway.app/health
- ✅ **Authentication endpoint** validates your token successfully
- ✅ **MCP endpoint** responds to JSON-RPC requests
- ✅ **No rate limiting** errors in normal usage

## Getting Help

If you continue experiencing issues after following this guide:

1. **Check Server Status**: Visit https://disco-mcp.up.railway.app/health
2. **Review Logs**: Check Claude Desktop logs for error details
3. **Test Connectivity**: Use the curl commands provided in troubleshooting
4. **Visit Documentation**: https://disco-mcp.up.railway.app/docs
5. **Report Issues**: https://github.com/Arcane-Fly/disco/issues

## Reference Links

- **Live Server**: https://disco-mcp.up.railway.app/
- **API Documentation**: https://disco-mcp.up.railway.app/docs
- **Health Status**: https://disco-mcp.up.railway.app/health
- **OpenAPI Schema**: https://disco-mcp.up.railway.app/openapi.json
- **Anthropic MCP Documentation**: https://docs.anthropic.com/en/docs/build-with-claude/computer-use
- **GitHub Repository**: https://github.com/Arcane-Fly/disco

---

**Last Updated**: 2024-01-26  
**MCP Protocol Version**: 2024-11-05  
**API Version**: 1.0.0