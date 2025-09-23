# Visual Setup Guides

Step-by-step visual guides with screenshots and detailed instructions for setting up the Disco MCP Server with different platforms.

## Table of Contents

- [ChatGPT.com Connector Setup](#chatgpt-connector-setup)
- [Claude.ai Integration Setup](#claude-integration-setup)
- [Claude Desktop MCP Setup](#claude-desktop-setup)
- [Troubleshooting Visual Guide](#troubleshooting-guide)

## ChatGPT.com Connector Setup

### Overview
Setting up the Disco MCP Server as a connector in ChatGPT.com's main interface (requires ChatGPT Plus/Pro/Team/Enterprise).

### Step 1: Access ChatGPT Settings

1. **Open ChatGPT.com** in your browser
2. **Click your profile picture** in the bottom left corner
3. **Select "Settings"** from the dropdown menu

```
🔗 Direct Link: https://chat.openai.com/settings
```

**Visual Indicator**: Look for a gear icon (⚙️) or your profile picture with a dropdown arrow.

### Step 2: Navigate to Connectors

1. **In the Settings sidebar**, look for "**Connectors**" or "**Features**"
2. **Click on "Connectors"** to open the connector management page
3. **Click "Add New Connector"** or "**+**" button

**Expected Interface Elements**:
- Settings sidebar with multiple options
- "Connectors" section showing connected services
- "Add New Connector" button (usually blue)

### Step 3: Add Disco MCP Connector

1. **Copy the connector URL**:
   ```
   https://disco-mcp.up.railway.app/openapi.json
   ```

2. **Paste the URL** into the "Connector URL" or "API URL" field

3. **Click "Add Connector"** or "Connect"

**What You Should See**:
- A form with an input field for the connector URL
- Possibly additional fields for authentication (will be handled automatically)
- A "Connect" or "Add" button

### Step 4: Complete Authentication

1. **You'll be redirected** to GitHub OAuth (if not already logged in)
2. **Click "Authorize"** on the GitHub OAuth screen
3. **You'll be redirected back** to ChatGPT.com
4. **The connector should show as "Connected"** with a green indicator

**Authentication Flow**:
```
ChatGPT.com → GitHub OAuth → Authorization → Back to ChatGPT.com → Connected ✅
```

### Step 5: Verify Connection

1. **Start a new chat** in ChatGPT.com
2. **Type a test command**:
   ```
   "List the available tools from the Disco MCP server"
   ```

3. **You should see** a response listing available capabilities:
   - File operations (read, write, delete, list)
   - Git operations (clone, commit, push, pull)
   - Terminal operations (execute commands)
   - Computer use (screenshots, clicks)

### Success Indicators

- ✅ **Green "Connected" status** in the Connectors settings
- ✅ **ChatGPT can list Disco tools** when asked
- ✅ **No error messages** during connection process
- ✅ **Ability to create containers** and execute commands

### Troubleshooting ChatGPT Setup

#### Issue: "Connector not found" or "Invalid URL"
**Solution**: 
- Verify URL: `https://disco-mcp.up.railway.app/openapi.json`
- Try opening the URL directly in your browser to verify it loads
- Check your internet connection

#### Issue: Authentication loop or failure
**Solution**:
- Clear ChatGPT cookies and try again
- Use incognito/private browsing mode
- Ensure you have a GitHub account

#### Issue: Connector connects but tools not available
**Solution**:
- Disconnect and reconnect the connector
- Wait 1-2 minutes for the connection to fully establish
- Check ChatGPT subscription status (Plus/Pro/Team/Enterprise required)

---

## Claude.ai Integration Setup

### Overview
Setting up the Disco MCP Server for Claude.ai web interface using External APIs (requires Claude Pro/Team/Enterprise).

### Step 1: Access Claude Settings

1. **Open Claude.ai** in your browser
2. **Click the settings icon** (⚙️) or your profile
3. **Look for "External APIs"** or "Integrations" section

```
🔗 Direct Link: https://claude.ai/settings
```

### Step 2: Add External API

1. **Click "Add External API"** or "New Integration"
2. **Enter the configuration**:
   - **Name**: `Disco MCP Server`
   - **Base URL**: `https://disco-mcp.up.railway.app/mcp`
   - **Authentication Type**: `Bearer Token`

### Step 3: Get Authentication Token

1. **Visit**: https://disco-mcp.up.railway.app/
2. **Click "Login with GitHub"**
3. **Complete OAuth flow**
4. **Copy your JWT token** from the interface

### Step 4: Complete API Setup

1. **Paste your JWT token** in the "Bearer Token" field
2. **Click "Test Connection"** (if available)
3. **Save the configuration**

### Step 5: Verify Integration

1. **Start a new conversation** with Claude
2. **Test with a command**:
   ```
   "Can you create a new container and list its capabilities?"
   ```

3. **Claude should respond** with container creation confirmation and capability list

### Success Indicators

- ✅ **API shows as "Connected"** in Claude settings
- ✅ **Claude can access Disco MCP tools**
- ✅ **No authentication errors**
- ✅ **Container operations work correctly**

---

## Claude Desktop MCP Setup

### Overview
Setting up Claude Desktop to connect to the Disco MCP Server using the MCP protocol.

### Step 1: Locate Configuration File

**Find your Claude Desktop configuration file**:

#### macOS
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

#### Windows
```cmd
%APPDATA%\Claude\claude_desktop_config.json
```

#### Linux
```bash
~/.config/claude/claude_desktop_config.json
```

### Step 2: Get Authentication Token

1. **Visit**: https://disco-mcp.up.railway.app/
2. **Login with GitHub**
3. **Copy your JWT token**

### Step 3: Create Configuration

**Create or edit the configuration file**:

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

**Replace `your-jwt-token-here`** with your actual JWT token.

### Step 4: Restart Claude Desktop

1. **Close Claude Desktop** completely
2. **Restart the application**
3. **Look for connection indicators** in the interface

### Step 5: Verify Connection

1. **Check for "Disco" server** in Claude Desktop's connections panel
2. **Test with a command**:
   ```
   "Please list the files in the current directory"
   ```

3. **Claude should create a container** and list files

### Success Indicators

- ✅ **"Disco" server appears** in connections panel
- ✅ **Green connection indicator**
- ✅ **Tools are available** when requested
- ✅ **No error messages** in Claude Desktop logs

### Configuration Troubleshooting

#### Issue: Server not found
**Check**:
- JSON syntax is valid (use a JSON validator)
- File is saved in the correct location
- Claude Desktop has been restarted

#### Issue: Authentication failed
**Check**:
- Token starts with "eyJ" (JWT format)
- Token hasn't expired (tokens last 1 hour)
- Regenerate token if needed

#### Issue: Connection established but tools fail
**Check**:
- Use `"http-stream"` transport (not `"http"`)
- Server health: https://disco-mcp.up.railway.app/health
- Network connectivity to Railway

---

## Troubleshooting Visual Guide

### Quick Diagnostic Flowchart

```
Start: Connection Issue
    ↓
Is the server healthy?
    ↓ NO → Check https://disco-mcp.up.railway.app/health
    ↓ YES
Is authentication working?
    ↓ NO → Regenerate token at disco-mcp.up.railway.app
    ↓ YES
Are tools available?
    ↓ NO → Check platform-specific configuration
    ↓ YES
✅ Connection successful!
```

### Common Visual Indicators

#### ✅ Working Connection
- **ChatGPT**: Green "Connected" status in Connectors
- **Claude.ai**: "Connected" indicator in External APIs
- **Claude Desktop**: Green dot next to "disco" server
- **All platforms**: Tools respond when requested

#### ❌ Failed Connection
- **ChatGPT**: Red "Failed" or "Disconnected" status
- **Claude.ai**: "Connection failed" error message
- **Claude Desktop**: Red dot or missing server entry
- **All platforms**: "I don't have access to tools" responses

#### ⚠️ Partial Connection
- **ChatGPT**: Yellow "Warning" status
- **Claude.ai**: "Limited access" indicator
- **Claude Desktop**: Yellow dot next to server
- **All platforms**: Some tools work, others fail

### Platform-Specific Error Messages

#### ChatGPT Error Messages
```
"Unable to connect to external service"
→ Check connector URL and server health

"Authentication failed" 
→ Regenerate JWT token

"Service temporarily unavailable"
→ Wait 1-2 minutes, server may be scaling
```

#### Claude.ai Error Messages
```
"External API connection failed"
→ Verify base URL and bearer token

"Invalid bearer token"
→ Get fresh token from disco-mcp.up.railway.app

"API rate limit exceeded"
→ Wait 1 minute before retrying
```

#### Claude Desktop Error Messages
```
"Failed to connect to MCP server"
→ Check JSON configuration syntax

"Transport protocol error"
→ Use "http-stream" not "http"

"Authentication error"
→ Verify JWT token format and expiration
```

### Visual Setup Checklist

#### Before You Start
- [ ] **Active subscription**: ChatGPT Plus/Pro or Claude Pro/Team
- [ ] **GitHub account**: For authentication
- [ ] **Internet connection**: For accessing disco-mcp.up.railway.app
- [ ] **Modern browser**: Chrome, Firefox, Safari, Edge

#### During Setup
- [ ] **Server health check**: https://disco-mcp.up.railway.app/health shows "healthy"
- [ ] **JWT token obtained**: From disco-mcp.up.railway.app after GitHub login
- [ ] **Correct URL used**: https://disco-mcp.up.railway.app/openapi.json (ChatGPT) or /mcp (others)
- [ ] **Authentication completed**: Green/connected status in platform

#### After Setup
- [ ] **Test basic functionality**: Ask AI to list available tools
- [ ] **Test container creation**: Request file operations or terminal commands
- [ ] **Test git operations**: Clone a repository or check git status
- [ ] **Document working setup**: Save configuration for future reference

### Getting Help

#### If You're Still Having Issues

1. **Check server status**: https://disco-mcp.up.railway.app/health
2. **Try different browser**: Incognito/private mode
3. **Clear cache/cookies**: For the AI platform you're using
4. **Regenerate token**: Get fresh JWT from disco-mcp.up.railway.app
5. **Check documentation**: Detailed guides in `/docs` folder
6. **Report issue**: https://github.com/Arcane-Fly/disco/issues

#### Support Resources

- **📖 Quick Start**: [QUICK_START.md](../QUICK_START.md)
- **🔧 Troubleshooting**: [CONNECTION_TROUBLESHOOTING.md](../CONNECTION_TROUBLESHOOTING.md)
- **⚙️ Configuration**: [CONFIGURATION_SAMPLES.md](../CONFIGURATION_SAMPLES.md)
- **🚀 API Examples**: [CURL_EXAMPLES.md](../CURL_EXAMPLES.md)
- **🐛 GitHub Issues**: https://github.com/Arcane-Fly/disco/issues

---

**💡 Pro Tips**:
- **Bookmark** https://disco-mcp.up.railway.app/ for quick token regeneration
- **Save your working configuration** for future reference
- **Test with simple commands first** before complex operations
- **Check server health** before troubleshooting connection issues