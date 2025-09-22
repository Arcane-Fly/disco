# Quick Start Guide - Disco MCP Server

Get up and running with the Disco MCP Server in under 5 minutes!

## 🚀 One-Click Setup

### Step 1: Choose Your Platform

| Platform | Setup Time | Complexity |
|----------|------------|------------|
| **ChatGPT.com Connectors** | 2 minutes | Easy |
| **Claude.ai External APIs** | 3 minutes | Easy |
| **Claude Desktop (MCP)** | 5 minutes | Medium |
| **Custom Integration** | 10 minutes | Advanced |

### Step 2: Get Your Configuration

1. **Visit**: https://disco-mcp.up.railway.app/
2. **Click**: "🚀 Login with GitHub to Get Started"
3. **Authorize**: GitHub OAuth (one-time setup)
4. **Copy**: Your personalized configuration URLs

### Step 3: Paste and Use

#### For ChatGPT.com (Main Interface)
```
1. Open ChatGPT.com → Settings → Connectors
2. Click "Add New Connector"
3. Paste: https://disco-mcp.up.railway.app/openapi.json
4. Done! ✅
```

#### For Claude.ai (Web Interface)
```
1. Open Claude.ai → Settings → External APIs
2. Add New API
3. Base URL: https://disco-mcp.up.railway.app/mcp
4. Auth: Bearer <your-token>
5. Done! ✅
```

#### For Claude Desktop (MCP Client)
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {"type": "bearer", "token": "your-token-here"}
    }
  }
}
```

## 🎯 What You Get

Once connected, your AI assistant can:

- 📁 **Read/Write Files**: Create, edit, and manage project files
- 🔧 **Run Commands**: Execute terminal commands and scripts
- 🔀 **Git Operations**: Clone repos, commit changes, push/pull
- 🖥️ **Computer Use**: Take screenshots, click, type (experimental)
- 🔍 **Search & RAG**: Find code patterns and documentation

## 🧪 Test Your Setup

Try these prompts after connecting:

### File Operations
```
"List the files in the current directory"
"Create a file called hello.py with a simple print statement"
"Read the contents of package.json"
```

### Development Tasks
```
"Clone the repository https://github.com/microsoft/vscode"
"Install dependencies and run the development server"
"Run 'npm test' and show me the results"
```

### Computer Use
```
"Take a screenshot of the current screen"
"Show me what's visible in the browser"
```

## ❓ Troubleshooting

### Connection Issues
- ✅ Check server status: https://disco-mcp.up.railway.app/health
- ✅ Regenerate your token if expired
- ✅ Try incognito/private browsing mode

### Authentication Problems
- ✅ Ensure you have a GitHub account
- ✅ Check if popup blockers are disabled
- ✅ Try logging out and back in

### Tools Not Working
- ✅ Refresh your AI interface
- ✅ Reconnect the connector/API
- ✅ Check that you have the right subscription level

## 🆘 Need Help?

- 📖 **Full Documentation**: [Claude Setup](../connectors/claude-setup.md) | [ChatGPT Setup](../connectors/chatgpt-setup.md)
- 🔧 **API Reference**: https://disco-mcp.up.railway.app/docs
- 💚 **Server Health**: https://disco-mcp.up.railway.app/health
- 🐛 **Issues**: https://github.com/Arcane-Fly/disco/issues

---

**⚡ Pro Tip**: Bookmark https://disco-mcp.up.railway.app/ for quick access to your configuration URLs!