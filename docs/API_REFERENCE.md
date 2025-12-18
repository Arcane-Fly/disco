# API Reference

Comprehensive API documentation for the MCP Server.

## Table of Contents

- [Authentication](#authentication)
- [Standardized Responses](#standardized-responses)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Health Checks](#health-checks)
- [Container Management](#container-management)
- [File Operations](#file-operations)
- [Terminal Operations](#terminal-operations)
- [Git Operations](#git-operations)

## Authentication

All API endpoints (except health checks and authentication endpoints) require JWT authentication.

### Headers

```http
Authorization: Bearer <jwt_token>
X-Correlation-ID: <optional_correlation_id>
```

### Obtaining a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "apiKey": "your-api-key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires": 1640995200,
    "userId": "user-123"
  },
  "metadata": {
    "timestamp": "2024-01-26T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## Standardized Responses

All API responses follow a standardized format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "metadata": {
    "timestamp": "2024-01-26T10:30:00.000Z",
    "version": "1.0.0",
    "requestId": "req-123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation failed",
    "details": {
      // Additional error details (development only)
    },
    "timestamp": "2024-01-26T10:30:00.000Z",
    "correlationId": "corr-123"
  },
  "metadata": {
    "timestamp": "2024-01-26T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `AUTH_FAILED` | 401 | Authentication failed |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `CONTAINER_NOT_FOUND` | 404 | Container not found |
| `FILE_NOT_FOUND` | 404 | File not found |
| `EXECUTION_ERROR` | 422 | Command execution failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `WEBCONTAINER_ERROR` | 503 | WebContainer service unavailable |
| `GIT_ERROR` | 422 | Git operation failed |

### Correlation IDs

Each request can include an `X-Correlation-ID` header for request tracking. If not provided, the server generates one automatically.

```http
X-Correlation-ID: abc-123-def-456
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per minute per user
- **Burst**: 10 requests per second

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
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
  "timestamp": "2024-01-26T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "node_version": "v20.10.0",
  "environment": "production",
  "memory": {
    "used": 128,
    "total": 256,
    "external": 32,
    "rss": 180
  },
  "containers": {
    "active": 5,
    "max": 50,
    "pool_ready": 3,
    "pool_initializing": 0
  },
  "services": {
    "webcontainer": "enabled",
    "redis": "enabled",
    "github": "enabled"
  }
}
```

### Readiness Probe

```http
GET /health/ready
```

### Liveness Probe

```http
GET /health/live
```

### Metrics

```http
GET /health/metrics
```

## Container Management

### Create Container

```http
POST /api/v1/containers
Authorization: Bearer <token>
Content-Type: application/json

{
  "options": {
    "preWarm": false,
    "template": "node"
  }
}
```

### List Containers

```http
GET /api/v1/containers
Authorization: Bearer <token>
```

### Get Container

```http
GET /api/v1/containers/:containerId
Authorization: Bearer <token>
```

### Terminate Container

```http
DELETE /api/v1/containers/:containerId
Authorization: Bearer <token>
```

## File Operations

### Read File

```http
GET /api/v1/containers/:containerId/files?path=/src/index.js
Authorization: Bearer <token>
```

### Write File

```http
POST /api/v1/containers/:containerId/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "path": "/src/index.js",
  "content": "console.log('Hello World');",
  "encoding": "utf-8"
}
```

### List Files

```http
GET /api/v1/containers/:containerId/files/list?path=/src
Authorization: Bearer <token>
```

### Delete File

```http
DELETE /api/v1/containers/:containerId/files?path=/src/temp.js
Authorization: Bearer <token>
```

## Terminal Operations

### Execute Command

```http
POST /api/v1/containers/:containerId/terminal/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "command": "npm install",
  "cwd": "/workspace",
  "env": {
    "NODE_ENV": "development"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "output": "added 152 packages...",
    "exitCode": 0,
    "stdout": "added 152 packages...",
    "stderr": "",
    "duration": 5243
  }
}
```

## Git Operations

### Clone Repository

```http
POST /api/v1/containers/:containerId/git/clone
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://github.com/user/repo.git",
  "branch": "main",
  "directory": "/workspace"
}
```

### Commit Changes

```http
POST /api/v1/containers/:containerId/git/commit
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "feat: add new feature",
  "files": ["src/index.js"],
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Push Changes

```http
POST /api/v1/containers/:containerId/git/push
Authorization: Bearer <token>
Content-Type: application/json

{
  "remote": "origin",
  "branch": "main",
  "authToken": "github_pat_..."
}
```

## Best Practices

1. **Always include correlation IDs** for easier debugging
2. **Handle rate limiting** gracefully with exponential backoff
3. **Validate responses** using the standardized format
4. **Store JWT tokens securely** and refresh before expiration
5. **Use appropriate error handling** based on error codes
6. **Monitor health endpoints** for service status
7. **Sanitize all user inputs** before sending to API
8. **Use HTTPS in production** for secure communication

## Examples

### Node.js Example

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://mcp-server.example.com',
  headers: {
    'Authorization': `Bearer ${process.env.JWT_TOKEN}`,
    'X-Correlation-ID': generateUUID(),
  },
});

// Create container
const { data } = await client.post('/api/v1/containers');
const containerId = data.data.containerId;

// Execute command
const result = await client.post(
  `/api/v1/containers/${containerId}/terminal/execute`,
  { command: 'npm install' }
);

console.log('Command output:', result.data.data.output);
```

### Python Example

```python
import requests
import uuid

class MCPClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'X-Correlation-ID': str(uuid.uuid4())
        })
    
    def create_container(self):
        response = self.session.post(f'{self.base_url}/api/v1/containers')
        response.raise_for_status()
        return response.json()['data']
    
    def execute_command(self, container_id, command):
        response = self.session.post(
            f'{self.base_url}/api/v1/containers/{container_id}/terminal/execute',
            json={'command': command}
        )
        response.raise_for_status()
        return response.json()['data']

# Usage
client = MCPClient('https://mcp-server.example.com', 'your-token')
container = client.create_container()
result = client.execute_command(container['containerId'], 'npm install')
print(result['output'])
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/Arcane-Fly/disco/issues
- Documentation: https://github.com/Arcane-Fly/disco/docs
