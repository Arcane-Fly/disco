# Disco MCP Bi-Directional Integration Guide

## Architecture Overview

Disco MCP (Model Context Protocol) Server acts as a central hub connecting AI platforms and development environments. It exposes **tools** (actions with side effects), **resources** (read-only context data), and **prompts** (pre-defined templates) to AI agents via a JSON-RPC 2.0 interface.

The integration is bi-directional – AI assistants can invoke MCP tools/resources, and the MCP server streams results or triggers events back to clients in real-time.

### High-Level Architecture

```
┌─────────────┐         ┌──────────────┐         ┌────────────────────┐
│  AI Client  │ ◄────► │  Disco MCP   │ ◄────►  │ Sandboxed Runtime  │
│  (ChatGPT/  │ JSON-  │   Server     │         │  (WebContainer/    │
│   Claude)   │  RPC   │              │         │   Docker/E2B)      │
└─────────────┘         └──────────────┘         └────────────────────┘
       │                       │                          │
       │                       ▼                          │
       │              ┌────────────────┐                  │
       └─────────────►│  Local IDE/    │◄─────────────────┘
                      │   Terminal     │
                      └────────────────┘
```

### Components

1. **MCP Server (Disco)**: Deployed on Railway/cloud with endpoints for:
   - JSON-RPC interface (`/mcp`)
   - Streaming (`/sse` or WebSocket)
   - REST APIs for containers, files, etc.

2. **AI Clients**:
   - **ChatGPT**: Connects via plugin or Developer Mode connector
   - **Claude**: Connects via Claude Desktop extension or external API
   - **Local IDE/Terminal**: Direct API connection or A2A protocol

3. **Sandboxed Execution Environment**: Per-user isolated runtime for code execution, file editing, and terminal access

### Key Design Points

- **Persistent Sessions**: Maintain context/state across multiple calls
- **Streaming Outputs**: Real-time feedback via Server-Sent Events or WebSocket
- **Secure Authentication**: JWT tokens or OAuth2 for client connections
- **Bi-directional Flow**: Results flow back to LLM and reflect in chat and web UI

## ChatGPT Integration (OpenAI-Style Plugin & Connector)

### OpenAI Plugin Manifest

The MCP server exposes an OpenAI-compatible plugin JSON manifest at `/.well-known/ai-plugin.json` and an OpenAPI spec.

**Configuration Requirements:**
- CORS `ALLOWED_ORIGINS` must include `https://chat.openai.com` and `https://chatgpt.com`
- Content-Security-Policy must permit framing by these domains
- OpenAPI spec (`/openapi.json`) must be accessible via HTTPS

### ChatGPT Developer Mode Connector

As of late 2025, ChatGPT supports direct MCP server connections in Developer Mode.

**Setup Steps:**

1. Enable Developer Mode in ChatGPT settings under Connectors
2. Create a new connector entry:
   - **Name**: "Disco MCP Server – full coding environment"
   - **Server URL**: `https://disco-mcp.yourdomain.com`
   - **Auth method**: OAuth or Bearer token
3. After adding, ChatGPT will prompt to authorize
4. Once authorized, ChatGPT discovers available tools from MCP server

**Required Endpoints:**
- Discovery: `/.well-known/oauth-authorization-server`
- Token exchange: `/oauth/token`
- Tool listing: `/mcp` (JSON-RPC)

**Example Tool Invocation:**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/execute",
  "params": {
    "tool": "file_read",
    "args": { "path": "/README.md" }
  },
  "id": 42
}
```

### Real-time Behavior

- ChatGPT plugins expect final JSON response (no native streaming)
- For long-running commands, return job ID and provide polling endpoint
- Use WebSocket URL for faster updates in custom UIs

### Authentication and Security

- Plugin auth: Set `auth.type: "none"` if handling auth via ChatGPT UI
- Developer Mode (OAuth): ChatGPT handles token via OAuth flow
- Always restrict CORS to ChatGPT origins
- Validate tokens on every request

## Claude Integration (Anthropic's MCP Connector)

### Claude Desktop (MCP Extension)

Claude 2+ supports extensions implementing the MCP protocol.

**Integration Steps:**

1. Create an extension manifest (JSON) with server details
2. Define capabilities in manifest (tools, prompts)
3. Package extension into `.mcpb` file using Anthropic's CLI:
   ```bash
   npx @anthropic-ai/mcpb init
   mcpb pack
   ```
4. Install in Claude Desktop

**Manifest Example:**

```json
{
  "name": "Disco MCP",
  "version": "1.0.0",
  "description": "Full coding environment with container management",
  "author": "Your Team",
  "server": {
    "entry_point": "disco-mcp-server",
    "type": "remote",
    "url": "https://disco-mcp.yourdomain.com/mcp"
  },
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": true
  },
  "user_config": {
    "api_key": {
      "type": "string",
      "description": "API key for authentication"
    }
  }
}
```

### Claude Web Interface

Claude's web app supports connecting to external APIs for tool use.

**Setup Steps:**

1. Navigate to Settings > External API / Integrations
2. Provide:
   - **Base URL**: `https://disco-mcp.yourdomain.com/mcp`
   - **Authentication**: Bearer Token with JWT
3. Optionally import OpenAPI spec

**Testing Connection:**

```bash
# Verify capabilities endpoint
curl https://disco-mcp.yourdomain.com/api/v1/computer-use/:containerId/capabilities/enhanced \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test tools/list JSON-RPC call
curl https://disco-mcp.yourdomain.com/mcp \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
```

## Local IDE & Terminal Integration (MCP and A2A)

### Direct MCP Client (IDE Plugin/Extension)

IDEs can directly communicate with MCP server via HTTP or STDIO.

**VS Code Extension Example:**

```javascript
// Configure with MCP server URL and API key
const config = {
  serverUrl: 'https://disco-mcp.yourdomain.com',
  apiKey: 'your-api-key'
};

// Call endpoints for container management
const containers = await fetch(`${config.serverUrl}/api/v1/containers`, {
  headers: { 'Authorization': `Bearer ${config.apiKey}` }
});

// Execute terminal command
const result = await fetch(`${config.serverUrl}/api/v1/terminal/execute`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    containerId: 'abc123',
    command: 'npm install'
  })
});
```

### Agent-to-Agent (A2A) Protocol

Disco supports an A2A protocol for coordination with other agents.

**Agent Card Structure:**

```json
{
  "name": "LocalAgent",
  "version": "1.0",
  "skills": ["open_app", "screenshot", "notify_user"],
  "endpoint": "http://localhost:3000/a2a"
}
```

**Task Sending:**

```bash
# Send task to local agent
curl http://localhost:3000/a2a/tasks/send \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "notify_user",
    "data": {
      "message": "Build completed successfully"
    }
  }'
```

**Use Cases:**
- Opening GUI applications on user's local machine
- Taking screenshots or accessing local hardware
- Showing desktop notifications when background jobs complete

## JSON-RPC Protocol & Message Formats

### Handshake (Initialization)

```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    }
  },
  "id": 1
}
```

**Server Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {}
    },
    "serverInfo": {
      "name": "Disco MCP Server",
      "version": "1.0.0"
    }
  }
}
```

### Tool Invocation

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "file_read",
    "arguments": {
      "path": "/README.md"
    }
  },
  "id": 42
}
```

### Resource Access

```json
{
  "jsonrpc": "2.0",
  "method": "resources/read",
  "params": {
    "uri": "file:///workspace/README.md"
  },
  "id": 43
}
```

## Enhanced Capabilities Endpoint

The enhanced capabilities endpoint provides a comprehensive feature matrix:

```bash
GET /api/v1/computer-use/:containerId/capabilities/enhanced
```

**Response Structure:**

```json
{
  "status": "success",
  "data": {
    "version": "2025.1",
    "lastUpdated": "2025-10-01T13:00:00.000Z",
    "platform": {
      "railway": {
        "supported": true,
        "optimized": true,
        "deployment": "railpack"
      },
      "webcontainer": {
        "supported": true,
        "version": "1.1.9",
        "features": ["filesystem", "networking", "shell", "npm", "node"]
      }
    },
    "automation": {
      "browser": {
        "engines": ["chromium", "firefox", "webkit"],
        "aiAssisted": true,
        "accessibilityTesting": true
      },
      "computer": {
        "screenshots": true,
        "clicking": true,
        "typing": true,
        "visualRegression": true
      }
    },
    "integrations": {
      "mcp": {
        "version": "1.18.2",
        "protocols": ["stdio", "http", "sse"]
      },
      "ai": {
        "assistedActions": true,
        "contextAware": true,
        "naturalLanguageCommands": true
      }
    },
    "limits": {
      "maxSessions": 10,
      "commandTimeout": 300000,
      "sessionDuration": 3600000
    }
  }
}
```

## Workflow Automation & Long-Running Tasks

### Background Task Scheduling

```javascript
// Example: Schedule periodic health checks
import cron from 'node-cron';

cron.schedule('*/5 * * * *', async () => {
  const health = await checkServerHealth();
  if (!health.ok) {
    await notifyAdmin(health.error);
  }
});
```

### External Triggers via Webhooks

**GitHub Webhook Example:**

```javascript
app.post('/webhooks/github', async (req, res) => {
  const event = req.body;
  
  if (event.action === 'opened' && event.pull_request) {
    // Auto-review PR
    await createContainer(event.pull_request.head.sha);
    await runTests();
  }
  
  res.sendStatus(200);
});
```

### Long-Running Code Execution

```javascript
// Return job ID immediately
app.post('/api/v1/tasks/run', async (req, res) => {
  const jobId = generateJobId();
  
  // Start async task
  runLongTask(jobId, req.body.command).catch(console.error);
  
  // Return immediately
  res.json({
    status: 'started',
    jobId,
    statusEndpoint: `/api/v1/tasks/${jobId}/status`
  });
});

// Provide status endpoint for polling
app.get('/api/v1/tasks/:jobId/status', async (req, res) => {
  const status = await getJobStatus(req.params.jobId);
  res.json(status);
});
```

## Sandboxing & Deployment Considerations

### Deployment Options

1. **Railway**: Simple Node app deployment with railpack
2. **E2B.dev**: Secure, ephemeral cloud sandboxes for AI agent code execution
3. **Coder**: Enterprise dev environments on Kubernetes
4. **Self-hosted**: Lightweight VMs or Docker containers per user
5. **WebContainer (StackBlitz)**: In-browser Node.js execution

### Security Best Practices

- **Isolation**: Use containerization or VM boundaries
- **Resource Limits**: Enforce CPU, memory, disk quotas
- **Token Validation**: Validate JWT on every request
- **CORS Restrictions**: Whitelist only required origins
- **Audit Logging**: Log all tool executions and file access

### Configuration Example

```env
# Environment variables
ALLOWED_ORIGINS=https://chat.openai.com,https://chatgpt.com,https://claude.ai
JWT_SECRET=your-secure-secret
CONTAINER_TIMEOUT_MINUTES=30
MAX_CONTAINERS=10
RAILWAY_PUBLIC_DOMAIN=disco-mcp.up.railway.app
```

## Language SDKs and Implementation

### TypeScript (Official SDK)

```typescript
import { MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new MCPServer({
  name: 'Disco MCP Server',
  version: '1.0.0',
});

// Register tools
server.tool('file_read', 'Read file contents', {
  path: { type: 'string' }
}, async ({ path }) => {
  const content = await readFile(path);
  return { content };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Python (FastMCP)

```python
from fastmcp import FastMCP

app = FastMCP(__name__)

@app.tool(name="sum", description="Add two numbers")
def sum_tool(a: int, b: int) -> int:
    return a + b

@app.resource(name="config", description="Server configuration")
def get_config():
    return {"version": "1.0.0"}

app.run()
```

## Best Practices

### Tool Design

- **Granularity**: Design tools as high-level actions (e.g., "run_tests" not "assert_equal")
- **Documentation**: Include clear descriptions and examples
- **Error Handling**: Return meaningful error messages

### Safety and Permissions

- **Confirmation**: Require user confirmation for destructive actions
- **Dry-run Mode**: Provide preview of changes before execution
- **Audit Trail**: Log all modifications for review

### User Experience

- **Progress Updates**: Provide status updates for long-running tasks
- **Fallbacks**: Handle cases where client doesn't support streaming
- **Clear Errors**: Return actionable error messages

## Testing and Validation

### Compliance Validation

```bash
# Run MCP compliance tests
yarn test:mcp-compliance

# Validate ChatGPT plugin
./verify-chatgpt-compliance.sh

# Check Railway deployment
./test-railway-deployment.sh
```

### Manual Testing

```bash
# Test tool invocation
echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | \
  curl -X POST https://disco-mcp.yourdomain.com/mcp \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d @-

# Test capabilities endpoint
curl https://disco-mcp.yourdomain.com/api/v1/computer-use/container123/capabilities/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Support and Troubleshooting

### Common Issues

1. **Connection Timeout**: Check firewall rules and CORS configuration
2. **Token Expired**: Refresh JWT token via `/api/v1/auth/github`
3. **Tool Not Found**: Verify tool registration in server code
4. **Permission Denied**: Ensure JWT includes correct user ID

### Getting Help

- **Repository**: https://github.com/Arcane-Fly/disco
- **Issues**: https://github.com/Arcane-Fly/disco/issues
- **Discussions**: https://github.com/Arcane-Fly/disco/discussions
- **Documentation**: See `/docs` directory for detailed guides

## Appendix

### Related Documentation

- [OAuth Troubleshooting Guide](./oauth-troubleshooting.md)
- [Connection Troubleshooting Matrix](./CONNECTION_TROUBLESHOOTING_ENHANCED.md)
- [Authentication Flow Analysis](./AUTH_FLOW_ANALYSIS.md)
- [ChatGPT Integration](../CHATGPT_INTEGRATION.md)
- [Claude Setup Guide](./connectors/claude-setup.md)

### Version History

- **2025.1** (Current): Enhanced capabilities endpoint, improved A2A protocol
- **2024.12**: Initial MCP integration with stdio transport
- **2024.11**: Railway deployment optimization

---

**Last Updated**: October 2025  
**MCP Integration Status**: ✅ PRODUCTION READY
