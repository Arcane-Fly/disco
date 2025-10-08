# Claude Desktop & Web Integration Setup Guide

This comprehensive guide covers setting up the Disco MCP Server for Claude Desktop and Claude web interface integration.

## Overview

The Disco MCP Server provides complete integration with Claude through multiple channels:
- **Claude Desktop**: Direct MCP client integration
- **Claude Web Interface**: External API integration
- **Claude API**: Direct API access for custom applications

## Quick Setup (TL;DR)

### For Claude Desktop (MCP Client)
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {"type": "bearer", "token": "your-jwt-token"}
    }
  }
}
```

### For Claude Web Interface (External API)
```
API Base URL: https://disco-mcp.up.railway.app/mcp
Authentication: Bearer <your-jwt-token>
```

## Detailed Setup Instructions

### Prerequisites

1. **Claude Desktop** (for desktop integration) - Download from [Anthropic](https://claude.ai/download)
2. **Claude Pro/Team Account** (for web interface external APIs)
3. **GitHub Account** (for authentication)
4. **Internet Connection** (for Railway-hosted deployment)

### Step 1: Get Your Authentication Token

#### Method A: Quick GitHub OAuth (Recommended)

1. Visit the live server: https://disco-mcp.up.railway.app/
2. Click "Login with GitHub" 
3. Authorize the application
4. Copy your JWT token from the configuration section

#### Method B: Manual API Authentication

```bash
# 1. Get your GitHub OAuth token
curl -X GET "https://disco-mcp.up.railway.app/api/v1/auth/github"

# 2. Complete the OAuth flow and get your JWT
# (Follow the redirect and authorization process)

# 3. Your JWT token will be provided after successful authentication
```

### Step 2A: Claude Desktop Integration (MCP Client)

#### Configuration File Setup

1. **Locate Claude Desktop Config**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/claude/claude_desktop_config.json`

2. **Create/Edit Configuration**:
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
      ]
    }
  }
}
```

3. **Restart Claude Desktop**

#### Verification

After restarting Claude Desktop, you should see:
- ✅ Disco server in the connections panel
- ✅ Available tools: file operations, git, terminal, computer-use
- ✅ Status: Connected (green indicator)

### Step 2B: Claude Web Interface Integration

#### External API Setup

1. **Open Claude Web Interface**: https://claude.ai/
2. **Access Settings**: Click your profile → Settings
3. **Navigate to External APIs**: (If available in your plan)
4. **Add New API Connection**:
   - **Name**: Disco MCP Server
   - **Base URL**: `https://disco-mcp.up.railway.app/mcp`
   - **Authentication**: Bearer Token
   - **Token**: `your-jwt-token-here`

#### Alternative: OpenAPI Integration

If your Claude account supports OpenAPI integrations:

1. **Import OpenAPI Spec**: https://disco-mcp.up.railway.app/openapi.json
2. **Configure Authentication**: Bearer token from Step 1
3. **Enable Desired Capabilities**: Select tools you want Claude to access

### Step 3: Available Capabilities

Once connected, Claude will have access to:

#### File Operations
- **Read files**: View and analyze file contents
- **Write files**: Create and modify files
- **List directories**: Browse project structure
- **Delete files**: Remove unwanted files

#### Git Operations
- **Clone repositories**: Download projects from GitHub/GitLab
- **Commit changes**: Save progress with messages
- **Push/pull**: Sync with remote repositories
- **Branch management**: Create and switch branches

#### Terminal Operations  
- **Execute commands**: Run shell commands
- **Stream output**: See real-time command results
- **Multiple sessions**: Parallel terminal instances
- **Working directory**: Navigate project folders

#### Computer Use (Experimental)
- **Screenshots**: Capture screen content
- **Click actions**: Interact with UI elements
- **Type text**: Input text into applications
- **Browser automation**: Navigate web interfaces

#### RAG Search
- **Code search**: Find functions and patterns
- **Documentation lookup**: Access project docs
- **Knowledge retrieval**: Search indexed content

### Step 4: Testing Your Connection

#### Quick Connection Test

```bash
# Test basic connectivity
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://disco-mcp.up.railway.app/capabilities

# Expected response:
{
  "version": "1.0",
  "capabilities": ["file:read", "file:write", "git:clone", ...]
}
```

#### MCP Protocol Test

If using Claude Desktop, test the MCP connection:

```bash
# Test MCP endpoint
curl -X POST https://disco-mcp.up.railway.app/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

#### Claude Desktop Test Prompts

Try these prompts in Claude Desktop to verify functionality:

1. **File Operations**: "List the files in the current directory"
2. **Git Operations**: "Clone the repository https://github.com/microsoft/vscode"
3. **Terminal**: "Run 'npm --version' and show me the output"
4. **Computer Use**: "Take a screenshot of the current screen"

### Troubleshooting

#### Common Issues

1. **"Server not found" Error**
   - ✅ Check internet connectivity
   - ✅ Verify the URL: https://disco-mcp.up.railway.app/mcp
   - ✅ Ensure your JWT token is valid (not expired)

2. **Authentication Failed**
   - ✅ Regenerate your JWT token via GitHub OAuth
   - ✅ Check token format (should start with `eyJ`)
   - ✅ Verify you have GitHub account access

3. **Tools Not Available**
   - ✅ Restart Claude Desktop after config changes
   - ✅ Check configuration file syntax (valid JSON)
   - ✅ Verify all required capabilities are listed

4. **Connection Timeout**
   - ✅ Check Railway deployment status: https://disco-mcp.up.railway.app/health
   - ✅ Try different network connection
   - ✅ Contact support if persistent

#### Debug Mode

Enable debug logging in Claude Desktop:

1. **Add to config**:
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream", 
      "auth": {"type": "bearer", "token": "..."},
      "debug": true
    }
  }
}
```

2. **Check logs**:
   - **macOS**: `~/Library/Logs/Claude/`
   - **Windows**: `%APPDATA%\Claude\logs\`
   - **Linux**: `~/.local/share/claude/logs/`

#### Health Check Endpoints

Monitor server status:

```bash
# Basic health
curl https://disco-mcp.up.railway.app/health

# Detailed metrics  
curl https://disco-mcp.up.railway.app/health/metrics

# MCP-specific status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://disco-mcp.up.railway.app/api/v1/containers/stats
```

### Advanced Configuration

#### Custom Timeout Settings

```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {"type": "bearer", "token": "..."},
      "timeout": 30000,
      "retries": 3
    }
  }
}
```

#### Environment-Specific Configurations

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

#### Custom Tool Selection

```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {"type": "bearer", "token": "..."},
      "tools": ["file:read", "file:write", "git:clone", "terminal:execute"]
    }
  }
}
```

## Security Considerations

### Token Management
- 🔐 **Never share your JWT tokens** in public repositories
- 🔄 **Rotate tokens regularly** (recommended: monthly)
- 🔒 **Store tokens securely** in environment variables or secure vaults
- ⏰ **Monitor token expiration** and refresh as needed

### Access Control
- 🛡️ **Principle of least privilege**: Only enable tools you need
- 👥 **Team sharing**: Use separate tokens for team members
- 🔍 **Audit access**: Review logs regularly for unauthorized usage
- 🚫 **Revoke access**: Remove tokens when no longer needed

### Network Security
- 🔐 **HTTPS only**: All connections use TLS encryption
- 🌐 **Railway hosting**: Benefit from Railway's security infrastructure
- 🔒 **No local exposure**: Server runs remotely, reducing local attack surface

## Getting Help

### Official Resources
- **Anthropic MCP Documentation**: https://docs.anthropic.com/en/docs/build-with-claude/computer-use
- **Claude Desktop Downloads**: https://claude.ai/download
- **Claude API Documentation**: https://docs.anthropic.com/

### Project Resources
- **API Documentation**: https://disco-mcp.up.railway.app/docs
- **GitHub Repository**: https://github.com/Arcane-Fly/disco
- **Health Status**: https://disco-mcp.up.railway.app/health
- **OpenAPI Spec**: https://disco-mcp.up.railway.app/openapi.json

### Support Channels
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check troubleshooting guides
- **Health Endpoints**: Monitor server status
- **Logs**: Review Claude Desktop logs for detailed error information

---

**Last Updated**: {{ current_date }}  
**Server Version**: 2.0.0  
**MCP Version**: 2024-11-05  
**Status**: ✅ Production Ready