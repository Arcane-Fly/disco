# MCP Server API Documentation

This document provides comprehensive API documentation for the MCP Server WebContainer integration.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://disco-mcp.up.railway.app`

## Authentication

All API endpoints (except health checks and auth) require JWT authentication.

### Get Token

```http
POST /api/v1/auth
Content-Type: application/json

{
  "apiKey": "your-api-key"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires": 1640995200000,
    "userId": "user-abc123"
  }
}
```

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## MCP Capabilities

### Get Capabilities

```http
GET /capabilities
```

**Response:**
```json
{
  "version": "1.0",
  "capabilities": [
    "file:read", "file:write", "file:delete", "file:list",
    "git:clone", "git:commit", "git:push", "git:pull",
    "terminal:execute", "terminal:stream",
    "computer-use:screenshot", "computer-use:click", "computer-use:type",
    "rag:search"
  ],
  "environment": {
    "os": "linux",
    "node_version": "v20.0.0",
    "npm_version": "9.6.7"
  }
}
```

## Container Management

### Create Container

```http
POST /api/v1/containers
Authorization: Bearer {token}
Content-Type: application/json

{
  "options": {
    "preWarm": true,
    "template": "node"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "containerId": "user-abc123-def456",
    "status": "ready",
    "url": "https://webcontainer-user-abc123-def456.localhost:3000"
  }
}
```

### List Containers

```http
GET /api/v1/containers
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "containers": [
      {
        "containerId": "user-abc123-def456",
        "status": "ready",
        "url": "https://webcontainer-user-abc123-def456.localhost:3000",
        "createdAt": "2023-12-01T10:00:00.000Z",
        "lastActive": "2023-12-01T10:30:00.000Z",
        "repositoryUrl": "https://github.com/user/repo.git"
      }
    ],
    "count": 1
  }
}
```

### Get Container Status

```http
GET /api/v1/containers/{containerId}
Authorization: Bearer {token}
```

### Delete Container

```http
DELETE /api/v1/containers/{containerId}
Authorization: Bearer {token}
```

## File Operations

### List Files

```http
GET /api/v1/files/{containerId}?path=/src
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "path": "/src",
    "files": [
      {
        "name": "server.ts",
        "type": "file",
        "size": 1024,
        "lastModified": "2023-12-01T10:00:00.000Z"
      },
      {
        "name": "lib",
        "type": "directory",
        "size": 0,
        "lastModified": "2023-12-01T09:30:00.000Z"
      }
    ]
  }
}
```

### Read File

```http
GET /api/v1/files/{containerId}/content?path=/package.json
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "path": "/package.json",
    "content": "{\n  \"name\": \"my-app\",\n  \"version\": \"1.0.0\"\n}",
    "encoding": "utf-8"
  }
}
```

### Create/Update File

```http
POST /api/v1/files/{containerId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "path": "/src/newfile.js",
  "content": "console.log('Hello World');",
  "encoding": "utf-8"
}
```

### Delete File

```http
DELETE /api/v1/files/{containerId}?path=/src/oldfile.js
Authorization: Bearer {token}
```

## Terminal Operations

### Execute Command

```http
POST /api/v1/terminal/{containerId}/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "command": "npm install express",
  "cwd": "/",
  "env": {
    "NODE_ENV": "development"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "output": "added 1 package in 2s",
    "exitCode": 0,
    "stdout": "added 1 package in 2s",
    "stderr": "",
    "duration": 2341
  }
}
```

### Stream Command Output

```http
POST /api/v1/terminal/{containerId}/stream
Authorization: Bearer {token}
Content-Type: application/json

{
  "command": "npm run dev",
  "cwd": "/"
}
```

**Response:** Server-Sent Events (SSE)
```
data: {"type": "stdout", "data": "Starting development server...\n"}

data: {"type": "stdout", "data": "Server running on port 3000\n"}

data: {"type": "complete", "duration": 1500}
```

### Get Command History

```http
GET /api/v1/terminal/{containerId}/history
Authorization: Bearer {token}
```

## Git Operations

### Clone Repository

```http
POST /api/v1/git/{containerId}/clone
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://github.com/user/repository.git",
  "branch": "main",
  "authToken": "github_pat_...",
  "directory": "."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "success": true,
    "message": "Repository cloned successfully to .",
    "data": {
      "url": "https://github.com/user/repository.git",
      "branch": "main",
      "directory": ".",
      "commit": "abc123def456"
    }
  }
}
```

### Commit Changes

```http
POST /api/v1/git/{containerId}/commit
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Add new feature",
  "files": ["src/feature.js", "README.md"],
  "author": {
    "name": "Developer",
    "email": "dev@example.com"
  }
}
```

### Push Changes

```http
POST /api/v1/git/{containerId}/push
Authorization: Bearer {token}
Content-Type: application/json

{
  "remote": "origin",
  "branch": "main",
  "authToken": "github_pat_...",
  "force": false
}
```

### Pull Changes

```http
POST /api/v1/git/{containerId}/pull
Authorization: Bearer {token}
Content-Type: application/json

{
  "remote": "origin",
  "branch": "main",
  "authToken": "github_pat_..."
}
```

### Get Repository Status

```http
GET /api/v1/git/{containerId}/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "branch": "main",
    "ahead": 2,
    "behind": 0,
    "staged": ["src/newfile.js"],
    "modified": ["README.md"],
    "untracked": ["temp.txt"],
    "conflicted": []
  }
}
```

## Health Checks

### Basic Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 256,
    "total": 512
  },
  "containers": {
    "active": 5,
    "max": 50
  }
}
```

### Readiness Check

```http
GET /health/ready
```

### Liveness Check

```http
GET /health/live
```

### Metrics

```http
GET /health/metrics
```

## Error Handling

All API responses follow a consistent error format:

```json
{
  "status": "error",
  "error": {
    "code": "CONTAINER_NOT_FOUND",
    "message": "Container not found"
  }
}
```

### Error Codes

- `INVALID_REQUEST`: Bad request format or missing parameters
- `AUTH_FAILED`: Authentication failed or token expired
- `CONTAINER_NOT_FOUND`: Container doesn't exist
- `PERMISSION_DENIED`: User doesn't have access to resource
- `EXECUTION_ERROR`: Command or operation failed
- `FILE_NOT_FOUND`: File doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `WEBCONTAINER_ERROR`: WebContainer-specific error
- `GIT_ERROR`: Git operation failed

## Rate Limiting

API requests are limited to:
- **100 requests per minute** per user
- **10 concurrent containers** per user
- **30 minute timeout** for inactive containers

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## WebSocket Events

For real-time updates, connect to the WebSocket endpoint:

```javascript
const socket = io('wss://your-app.up.railway.app');

socket.on('container:status', (data) => {
  console.log('Container status:', data);
});

socket.on('terminal:output', (data) => {
  console.log('Terminal output:', data);
});
```

## SDK Examples

### JavaScript/Node.js

```javascript
class MCPClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.token = null;
  }

  async authenticate() {
    const response = await fetch(`${this.baseUrl}/api/v1/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: this.apiKey })
    });
    const data = await response.json();
    this.token = data.data.token;
  }

  async createContainer() {
    const response = await fetch(`${this.baseUrl}/api/v1/containers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async executeCommand(containerId, command) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/terminal/${containerId}/execute`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      }
    );
    return response.json();
  }
}

// Practical usage example
const client = new MCPClient('https://disco-mcp.up.railway.app', 'your-api-key');

async function developmentWorkflow() {
  // Authenticate
  await client.authenticate();
  
  // Create a development container
  const container = await client.createContainer();
  const containerId = container.data.containerId;
  
  // Clone a repository
  await client.executeCommand(containerId, 'git clone https://github.com/user/project.git');
  
  // Install dependencies
  await client.executeCommand(containerId, 'cd project && npm install');
  
  // Run tests
  const testResult = await client.executeCommand(containerId, 'cd project && npm test');
  console.log('Test results:', testResult.data.output);
  
  // Start development server
  await client.executeCommand(containerId, 'cd project && npm run dev');
}
```

### React/Frontend Integration

```jsx
import React, { useState, useEffect } from 'react';

function MCPTerminal() {
  const [container, setContainer] = useState(null);
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState('');

  useEffect(() => {
    // Initialize container on component mount
    initializeContainer();
  }, []);

  const initializeContainer = async () => {
    const response = await fetch('/api/v1/containers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mcp_token')}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    setContainer(data.data.containerId);
  };

  const executeCommand = async () => {
    if (!container || !command) return;

    const response = await fetch(`/api/v1/terminal/${container}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('mcp_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command })
    });

    const result = await response.json();
    setOutput(prev => [...prev, { command, output: result.data.output }]);
    setCommand('');
  };

  return (
    <div className="terminal">
      <div className="output">
        {output.map((entry, i) => (
          <div key={i}>
            <div className="command">$ {entry.command}</div>
            <div className="result">{entry.output}</div>
          </div>
        ))}
      </div>
      <div className="input">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
          placeholder="Enter command..."
        />
        <button onClick={executeCommand}>Execute</button>
      </div>
    </div>
  );
}
```

### Python

```python
import requests
import json

class MCPClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
        self.token = None
    
    def authenticate(self):
        response = requests.post(
            f"{self.base_url}/api/v1/auth",
            json={"apiKey": self.api_key}
        )
        data = response.json()
        self.token = data["data"]["token"]
    
    def create_container(self):
        response = requests.post(
            f"{self.base_url}/api/v1/containers",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        return response.json()
    
    def execute_command(self, container_id, command):
        response = requests.post(
            f"{self.base_url}/api/v1/terminal/{container_id}/execute",
            headers={"Authorization": f"Bearer {self.token}"},
            json={"command": command}
        )
        return response.json()
```

This API documentation provides a complete reference for integrating with the MCP Server WebContainer platform.

## Platform-Specific Configuration Examples

### Claude Desktop MCP Client

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

### ChatGPT.com Connector Configuration

```json
{
  "connector_url": "https://disco-mcp.up.railway.app/openapi.json",
  "platform": "ChatGPT.com Main Interface",
  "authentication": "automatic_oauth"
}
```

### Claude.ai External API Setup

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
    "Mcp-Session-Id": "optional-session-id"
  }
}
```

### Direct API Integration

```bash
# Environment setup
export MCP_BASE_URL="https://disco-mcp.up.railway.app"
export MCP_TOKEN="your-jwt-token"

# Quick API test
curl -H "Authorization: Bearer $MCP_TOKEN" \
  "$MCP_BASE_URL/api/v1/containers"
```