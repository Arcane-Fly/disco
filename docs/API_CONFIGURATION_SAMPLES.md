# API Configuration Samples and Examples

This document provides comprehensive configuration samples for integrating the Disco MCP Server with various platforms, including working examples, curl commands, and SDK integrations.

## Table of Contents

- [Platform-Specific Configurations](#platform-specific-configurations)
- [Authentication Examples](#authentication-examples)
- [SDK Integration Examples](#sdk-integration-examples)
- [Curl Command Reference](#curl-command-reference)
- [Configuration Templates](#configuration-templates)
- [Error Handling Examples](#error-handling-examples)
- [Rate Limiting and Performance](#rate-limiting-and-performance)

## Platform-Specific Configurations

### Claude Desktop MCP Client

#### Standard Configuration
```json
{
  "servers": {
    "disco": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream",
      "auth": {
        "type": "bearer",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJnaXRodWItNDIiLCJwcm92aWRlciI6ImdpdGh1YiIsImlhdCI6MTcwNjI4MDAwMCwiZXhwIjoxNzA2MjgzNjAwfQ.example-signature"
      }
    }
  }
}
```

#### Advanced Configuration with Retry Logic
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
        "delay": 1000,
        "backoff": "exponential"
      },
      "headers": {
        "User-Agent": "Claude-Desktop/1.0",
        "X-Client-Version": "1.0.0"
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

#### Development vs Production
```json
{
  "servers": {
    "disco-dev": {
      "url": "http://localhost:3000/mcp",
      "transport": "http-stream",
      "auth": {
        "type": "bearer",
        "token": "dev-token-here"
      },
      "environment": "development"
    },
    "disco-prod": {
      "url": "https://disco-mcp.up.railway.app/mcp",
      "transport": "http-stream", 
      "auth": {
        "type": "bearer",
        "token": "prod-token-here"
      },
      "environment": "production"
    }
  }
}
```

### ChatGPT.com Connector Configuration

#### OpenAPI Connector URL
```
https://disco-mcp.up.railway.app/openapi.json
```

#### Manual Connector Configuration
```json
{
  "connector_name": "Disco MCP Server",
  "description": "WebContainer development environment with MCP tools",
  "base_url": "https://disco-mcp.up.railway.app",
  "openapi_url": "https://disco-mcp.up.railway.app/openapi.json",
  "authentication": {
    "type": "oauth",
    "oauth_url": "https://disco-mcp.up.railway.app/api/v1/auth/github",
    "redirect_uri": "https://chat.openai.com/backend-api/conversation"
  },
  "headers": {
    "User-Agent": "ChatGPT-Connector/1.0",
    "X-Client-Name": "chatgpt"
  }
}
```

### Claude.ai Web Interface (External API)

#### Basic External API Configuration
```json
{
  "name": "Disco MCP Server",
  "description": "Development environment with WebContainer support",
  "base_url": "https://disco-mcp.up.railway.app/mcp",
  "authentication": {
    "type": "bearer",
    "token": "your-jwt-token-here"
  },
  "timeout": 30000
}
```

#### Advanced External API Configuration
```json
{
  "name": "Disco MCP Server",
  "base_url": "https://disco-mcp.up.railway.app/mcp",
  "authentication": {
    "type": "bearer",
    "token": "your-jwt-token-here"
  },
  "headers": {
    "Content-Type": "application/json",
    "User-Agent": "Claude-Web/1.0",
    "X-Client-Name": "claude-web",
    "X-Client-Version": "1.0.0",
    "Mcp-Session-Id": "optional-session-id"
  },
  "retry": {
    "attempts": 3,
    "delay": 1000
  },
  "timeout": 30000,
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": true
  }
}
```

### VSCode MCP Extension

#### Extension Configuration
```json
{
  "mcp.servers": {
    "disco": {
      "command": "node",
      "args": [
        "-e",
        "const http = require('http'); const options = { hostname: 'disco-mcp.up.railway.app', port: 443, path: '/mcp', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_TOKEN_HERE' } }; process.stdin.pipe(http.request(options, res => res.pipe(process.stdout)));"
      ]
    }
  }
}
```

#### Alternative Curl-based Configuration
```json
{
  "mcp.servers": {
    "disco": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "-H", "Authorization: Bearer YOUR_TOKEN_HERE",
        "-d", "@-",
        "https://disco-mcp.up.railway.app/mcp"
      ]
    }
  }
}
```

### JetBrains IDEs (IntelliJ, PyCharm, etc.)

#### Plugin Configuration
```xml
<component name="MCPSettings">
  <servers>
    <server name="disco">
      <url>https://disco-mcp.up.railway.app/mcp</url>
      <transport>http</transport>
      <authentication>
        <type>bearer</type>
        <token>your-jwt-token-here</token>
      </authentication>
    </server>
  </servers>
</component>
```

## Authentication Examples

### JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "github-12345",
    "provider": "github",
    "iat": 1706280000,
    "exp": 1706283600
  },
  "signature": "example-signature"
}
```

### Token Validation Example
```bash
# Validate token
curl -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/auth/status"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "authenticated": true,
    "user": {
      "userId": "github-12345",
      "provider": "github"
    },
    "token": {
      "expires_at": 1706283600000,
      "expires_in": 3600000,
      "refresh_needed": false
    }
  }
}
```

### Token Refresh Example
```bash
# Refresh token before expiration
curl -X POST \
  -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/auth/refresh"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "token": "new-jwt-token-here",
    "expires": 1706287200000,
    "userId": "github-12345"
  }
}
```

## SDK Integration Examples

### JavaScript/Node.js SDK

#### Basic Client Implementation
```javascript
class DiscoMCPClient {
  constructor(baseUrl = 'https://disco-mcp.up.railway.app', token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.tokenExpiry = null;
  }

  async authenticate() {
    // Redirect to GitHub OAuth
    window.location.href = `${this.baseUrl}/api/v1/auth/github`;
  }

  setToken(token) {
    this.token = token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    this.tokenExpiry = payload.exp * 1000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createContainer(options = {}) {
    return this.request('/api/v1/containers', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }

  async executeCommand(containerId, command, cwd = '/') {
    return this.request(`/api/v1/terminal/${containerId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ command, cwd })
    });
  }

  async readFile(containerId, path) {
    return this.request(`/api/v1/files/${containerId}/content?path=${encodeURIComponent(path)}`);
  }

  async writeFile(containerId, path, content) {
    return this.request(`/api/v1/files/${containerId}`, {
      method: 'POST',
      body: JSON.stringify({ path, content })
    });
  }
}
```

#### Advanced Client with Auto-Refresh
```javascript
class AdvancedDiscoClient extends DiscoMCPClient {
  constructor(baseUrl, token) {
    super(baseUrl, token);
    this.refreshTimer = null;
    this.setupAutoRefresh();
  }

  setupAutoRefresh() {
    if (!this.token || !this.tokenExpiry) return;

    const refreshTime = this.tokenExpiry - Date.now() - 15 * 60 * 1000; // 15 min before expiry
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => this.refreshToken(), refreshTime);
    }
  }

  async refreshToken() {
    try {
      const response = await this.request('/api/v1/auth/refresh', {
        method: 'POST'
      });
      this.setToken(response.data.token);
      this.setupAutoRefresh();
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Redirect to re-authenticate
      this.authenticate();
    }
  }

  async request(endpoint, options = {}) {
    try {
      return await super.request(endpoint, options);
    } catch (error) {
      if (error.message.includes('401')) {
        // Token expired, try refresh
        await this.refreshToken();
        return super.request(endpoint, options);
      }
      throw error;
    }
  }
}
```

### Python SDK

#### Basic Client
```python
import requests
import json
import time
from typing import Optional, Dict, Any

class DiscoMCPClient:
    def __init__(self, base_url: str = "https://disco-mcp.up.railway.app", token: Optional[str] = None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        if token:
            self.session.headers.update({"Authorization": f"Bearer {token}"})

    def authenticate_with_token(self, token: str):
        """Set authentication token"""
        self.token = token
        self.session.headers.update({"Authorization": f"Bearer {token}"})

    def request(self, endpoint: str, method: str = "GET", **kwargs) -> Dict[Any, Any]:
        """Make API request"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        
        if response.status_code == 401:
            raise Exception("Authentication failed - token may be expired")
        
        response.raise_for_status()
        return response.json()

    def create_container(self, options: Optional[Dict] = None) -> Dict:
        """Create a new container"""
        return self.request("/api/v1/containers", method="POST", json=options or {})

    def execute_command(self, container_id: str, command: str, cwd: str = "/") -> Dict:
        """Execute command in container"""
        return self.request(
            f"/api/v1/terminal/{container_id}/execute",
            method="POST",
            json={"command": command, "cwd": cwd}
        )

    def read_file(self, container_id: str, path: str) -> Dict:
        """Read file from container"""
        return self.request(f"/api/v1/files/{container_id}/content", params={"path": path})

    def write_file(self, container_id: str, path: str, content: str) -> Dict:
        """Write file to container"""
        return self.request(
            f"/api/v1/files/{container_id}",
            method="POST",
            json={"path": path, "content": content}
        )

    def git_clone(self, container_id: str, url: str, branch: str = "main") -> Dict:
        """Clone git repository"""
        return self.request(
            f"/api/v1/git/{container_id}/clone",
            method="POST",
            json={"url": url, "branch": branch}
        )
```

#### Usage Example
```python
# Initialize client
client = DiscoMCPClient()

# Set token (get from https://disco-mcp.up.railway.app/)
client.authenticate_with_token("your-jwt-token-here")

# Create container
container = client.create_container()
container_id = container["data"]["containerId"]

# Clone repository
client.git_clone(container_id, "https://github.com/microsoft/TypeScript-Node-Starter")

# Execute commands
result = client.execute_command(container_id, "npm install")
print(result["data"]["output"])

# Read package.json
package_json = client.read_file(container_id, "/package.json")
print(json.dumps(package_json["data"], indent=2))
```

### React/Frontend Integration

#### React Hook for Disco MCP
```jsx
import { useState, useEffect, useCallback } from 'react';

export function useDiscoMCP(token) {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [containers, setContainers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      const newClient = new DiscoMCPClient('https://disco-mcp.up.railway.app', token);
      setClient(newClient);
      setConnected(true);
      loadContainers(newClient);
    } else {
      setClient(null);
      setConnected(false);
    }
  }, [token]);

  const loadContainers = useCallback(async (clientInstance) => {
    try {
      const response = await clientInstance.request('/api/v1/containers');
      setContainers(response.data.containers);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const createContainer = useCallback(async (options = {}) => {
    if (!client) throw new Error('Not connected');
    
    try {
      const response = await client.createContainer(options);
      await loadContainers(client);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [client, loadContainers]);

  const executeCommand = useCallback(async (containerId, command) => {
    if (!client) throw new Error('Not connected');
    
    try {
      return await client.executeCommand(containerId, command);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [client]);

  return {
    client,
    connected,
    containers,
    error,
    createContainer,
    executeCommand,
    refreshContainers: () => loadContainers(client)
  };
}
```

#### React Component Example
```jsx
import React, { useState } from 'react';
import { useDiscoMCP } from './hooks/useDiscoMCP';

function DiscoTerminal() {
  const [token, setToken] = useState(localStorage.getItem('disco_token'));
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState('');
  const [currentContainer, setCurrentContainer] = useState(null);

  const {
    connected,
    containers,
    error,
    createContainer,
    executeCommand
  } = useDiscoMCP(token);

  const handleLogin = () => {
    window.location.href = 'https://disco-mcp.up.railway.app/api/v1/auth/github';
  };

  const handleCreateContainer = async () => {
    try {
      const container = await createContainer();
      setCurrentContainer(container.containerId);
      addOutput(`Created container: ${container.containerId}`);
    } catch (err) {
      addOutput(`Error: ${err.message}`);
    }
  };

  const handleExecuteCommand = async () => {
    if (!currentContainer || !command) return;

    try {
      addOutput(`$ ${command}`);
      const result = await executeCommand(currentContainer, command);
      addOutput(result.data.output);
      setCommand('');
    } catch (err) {
      addOutput(`Error: ${err.message}`);
    }
  };

  const addOutput = (text) => {
    setOutput(prev => [...prev, { text, timestamp: Date.now() }]);
  };

  if (!connected) {
    return (
      <div className="disco-terminal">
        <h3>Disco MCP Terminal</h3>
        <button onClick={handleLogin}>Login with GitHub</button>
      </div>
    );
  }

  return (
    <div className="disco-terminal">
      <div className="terminal-header">
        <h3>Disco MCP Terminal</h3>
        <button onClick={handleCreateContainer}>New Container</button>
      </div>
      
      <div className="terminal-output">
        {output.map((entry, i) => (
          <div key={i} className="output-line">{entry.text}</div>
        ))}
      </div>
      
      <div className="terminal-input">
        <span className="prompt">$ </span>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleExecuteCommand()}
          placeholder="Enter command..."
          disabled={!currentContainer}
        />
        <button onClick={handleExecuteCommand} disabled={!currentContainer}>
          Execute
        </button>
      </div>
    </div>
  );
}
```

## Curl Command Reference

### Authentication Commands

#### Get Auth Status
```bash
curl -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/auth/status"
```

#### Refresh Token
```bash
curl -X POST \
  -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/auth/refresh"
```

### Container Management

#### Create Container
```bash
curl -X POST \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{"options": {"preWarm": true}}' \
  "https://disco-mcp.up.railway.app/api/v1/containers"
```

#### List Containers
```bash
curl -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/containers"
```

#### Delete Container
```bash
curl -X DELETE \
  -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/containers/container-id-here"
```

### File Operations

#### List Files
```bash
curl -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/files/container-id/list?path=/"
```

#### Read File
```bash
curl -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/files/container-id/content?path=/package.json"
```

#### Write File
```bash
curl -X POST \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/hello.js",
    "content": "console.log(\"Hello World\");"
  }' \
  "https://disco-mcp.up.railway.app/api/v1/files/container-id"
```

#### Delete File
```bash
curl -X DELETE \
  -H "Authorization: Bearer your-token-here" \
  "https://disco-mcp.up.railway.app/api/v1/files/container-id?path=/hello.js"
```

### Terminal Operations

#### Execute Command
```bash
curl -X POST \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "npm install express",
    "cwd": "/",
    "env": {"NODE_ENV": "development"}
  }' \
  "https://disco-mcp.up.railway.app/api/v1/terminal/container-id/execute"
```

#### Stream Command (SSE)
```bash
curl -N \
  -H "Authorization: Bearer your-token-here" \
  -H "Accept: text/event-stream" \
  -X POST \
  -d '{"command": "npm run dev"}' \
  "https://disco-mcp.up.railway.app/api/v1/terminal/container-id/stream"
```

### Git Operations

#### Clone Repository
```bash
curl -X POST \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/microsoft/TypeScript-Node-Starter.git",
    "branch": "main",
    "directory": "."
  }' \
  "https://disco-mcp.up.railway.app/api/v1/git/container-id/clone"
```

#### Commit Changes
```bash
curl -X POST \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add new feature",
    "files": ["src/feature.js"],
    "author": {
      "name": "Developer",
      "email": "dev@example.com"
    }
  }' \
  "https://disco-mcp.up.railway.app/api/v1/git/container-id/commit"
```

#### Push Changes
```bash
curl -X POST \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "remote": "origin",
    "branch": "main",
    "authToken": "github_pat_..."
  }' \
  "https://disco-mcp.up.railway.app/api/v1/git/container-id/push"
```

### Health and Status

#### Server Health
```bash
curl "https://disco-mcp.up.railway.app/health"
```

#### Detailed Metrics
```bash
curl "https://disco-mcp.up.railway.app/health/metrics"
```

#### Capabilities
```bash
curl "https://disco-mcp.up.railway.app/capabilities"
```

## Configuration Templates

### Environment Variables Template
```bash
# Core Configuration
export DISCO_MCP_URL="https://disco-mcp.up.railway.app"
export DISCO_API_BASE="https://disco-mcp.up.railway.app/api/v1"
export DISCO_MCP_TOKEN="your-jwt-token-here"

# Optional Configuration
export DISCO_OPENAPI_URL="https://disco-mcp.up.railway.app/openapi.json"
export DISCO_HEALTH_URL="https://disco-mcp.up.railway.app/health"
export DISCO_TIMEOUT="30000"
export DISCO_RETRY_ATTEMPTS="3"

# Usage Examples
curl -H "Authorization: Bearer $DISCO_MCP_TOKEN" "$DISCO_API_BASE/containers"
curl "$DISCO_HEALTH_URL"
```

### Docker Compose Integration
```yaml
version: '3.8'
services:
  app:
    image: my-app:latest
    environment:
      - DISCO_MCP_URL=https://disco-mcp.up.railway.app
      - DISCO_MCP_TOKEN=${DISCO_TOKEN}
    volumes:
      - ./config:/app/config
    networks:
      - disco-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    networks:
      - disco-network

networks:
  disco-network:
    driver: bridge
```

### GitHub Actions Workflow
```yaml
name: Test with Disco MCP
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Test with Disco MCP
        env:
          DISCO_MCP_TOKEN: ${{ secrets.DISCO_MCP_TOKEN }}
        run: |
          # Create container
          CONTAINER_ID=$(curl -s -X POST \
            -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
            -H "Content-Type: application/json" \
            "https://disco-mcp.up.railway.app/api/v1/containers" | \
            jq -r '.data.containerId')
          
          # Run tests in container
          curl -X POST \
            -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"command\": \"npm test\"}" \
            "https://disco-mcp.up.railway.app/api/v1/terminal/$CONTAINER_ID/execute"
```

## Error Handling Examples

### JavaScript Error Handling
```javascript
class DiscoMCPError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'DiscoMCPError';
    this.code = code;
    this.details = details;
  }
}

async function safeApiCall(client, operation) {
  try {
    return await operation();
  } catch (error) {
    if (error.message.includes('401')) {
      throw new DiscoMCPError(
        'Authentication failed - token may be expired',
        'AUTH_FAILED',
        { suggestion: 'Refresh token or re-authenticate' }
      );
    } else if (error.message.includes('429')) {
      throw new DiscoMCPError(
        'Rate limit exceeded',
        'RATE_LIMIT',
        { suggestion: 'Wait and retry, or reduce request frequency' }
      );
    } else if (error.message.includes('500')) {
      throw new DiscoMCPError(
        'Server error',
        'SERVER_ERROR',
        { suggestion: 'Check server status and retry' }
      );
    }
    throw error;
  }
}

// Usage
try {
  const result = await safeApiCall(client, () => 
    client.createContainer({ template: 'node' })
  );
} catch (error) {
  if (error instanceof DiscoMCPError) {
    console.error(`${error.code}: ${error.message}`);
    console.log(`Suggestion: ${error.details.suggestion}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Python Error Handling
```python
class DiscoMCPException(Exception):
    def __init__(self, message, code=None, details=None):
        super().__init__(message)
        self.code = code
        self.details = details or {}

def safe_request(func, *args, **kwargs):
    try:
        return func(*args, **kwargs)
    except requests.HTTPError as e:
        if e.response.status_code == 401:
            raise DiscoMCPException(
                "Authentication failed - token may be expired",
                "AUTH_FAILED",
                {"suggestion": "Refresh token or re-authenticate"}
            )
        elif e.response.status_code == 429:
            raise DiscoMCPException(
                "Rate limit exceeded",
                "RATE_LIMIT", 
                {"suggestion": "Wait and retry, or reduce request frequency"}
            )
        elif e.response.status_code >= 500:
            raise DiscoMCPException(
                "Server error",
                "SERVER_ERROR",
                {"suggestion": "Check server status and retry"}
            )
        raise DiscoMCPException(f"HTTP {e.response.status_code}: {e.response.text}")

# Usage
try:
    result = safe_request(client.create_container, {"template": "python"})
except DiscoMCPException as e:
    print(f"{e.code}: {e}")
    if "suggestion" in e.details:
        print(f"Suggestion: {e.details['suggestion']}")
```

## Rate Limiting and Performance

### Rate Limiting Guidelines
- **100 requests per minute** per authenticated user
- **10 concurrent containers** maximum per user  
- **30 minutes** container idle timeout
- **1 hour** JWT token expiration

### Performance Best Practices

#### Request Batching
```javascript
class BatchedDiscoClient extends DiscoMCPClient {
  constructor(baseUrl, token) {
    super(baseUrl, token);
    this.batchQueue = [];
    this.batchTimer = null;
  }

  batchRequest(operation) {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ operation, resolve, reject });
      
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.processBatch(), 100);
      }
    });
  }

  async processBatch() {
    const batch = this.batchQueue.splice(0);
    this.batchTimer = null;

    // Group operations by type
    const groups = batch.reduce((acc, item) => {
      const type = item.operation.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});

    // Process each group
    for (const [type, items] of Object.entries(groups)) {
      try {
        const results = await this.processBatchGroup(type, items);
        items.forEach((item, index) => item.resolve(results[index]));
      } catch (error) {
        items.forEach(item => item.reject(error));
      }
    }
  }
}
```

#### Connection Pooling
```javascript
class PooledDiscoClient {
  constructor(baseUrl, token, maxConcurrent = 5) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.maxConcurrent = maxConcurrent;
    this.activeRequests = 0;
    this.requestQueue = [];
  }

  async request(endpoint, options) {
    return new Promise((resolve, reject) => {
      const request = { endpoint, options, resolve, reject };
      
      if (this.activeRequests < this.maxConcurrent) {
        this.executeRequest(request);
      } else {
        this.requestQueue.push(request);
      }
    });
  }

  async executeRequest({ endpoint, options, resolve, reject }) {
    this.activeRequests++;
    
    try {
      const result = await super.request(endpoint, options);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      
      if (this.requestQueue.length > 0) {
        const nextRequest = this.requestQueue.shift();
        this.executeRequest(nextRequest);
      }
    }
  }
}
```

---

**Last Updated**: 2024-01-26  
**API Version**: 1.0.0  
**MCP Protocol**: 2024-11-05