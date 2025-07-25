# Product Requirements Document (PRD) and Technical Specification: MCP Server with WebContainer Integration

## 1. Executive Summary

This document outlines the requirements and specifications for developing an MCP (Model Control Plane) server that integrates with ChatGPT through Railway deployment. The solution will leverage WebContainers technology to provide a complete development environment within the browser, enabling complex coding tasks, repository interactions, and advanced tool usage directly from ChatGPT.

## 2. Problem Statement

Current AI coding assistants have limited capabilities when it comes to:
- Fully interacting with code repositories
- Performing complex CLI operations
- Executing multi-step coding tasks requiring persistent environments
- Providing true agentic behavior with file system access

This solution addresses these limitations by creating a bridge between ChatGPT and a fully functional development environment powered by WebContainers.

## 3. Product Goals

1. Enable ChatGPT to interact with a complete development environment
2. Provide persistent workspace for complex coding tasks
3. Support all ChatGPT tools (Computer Use, Files, RAG, CLI coding agents)
4. Allow seamless repository interactions (clone, commit, push, etc.)
5. Maintain security while providing powerful capabilities
6. Deliver fast response times for coding operations

## 4. Target Users

- Developers using ChatGPT for coding assistance
- Technical teams implementing AI-powered development workflows
- Educators creating interactive coding tutorials
- Documentation teams building next-generation interactive documentation

## 5. Key Features and Requirements

### 5.1 Core Functionality

**MCP Server Requirements:**
- Must deploy to Railway.com with minimal configuration
- Must establish secure connection to ChatGPT's API
- Must manage WebContainer instances for user sessions
- Must handle authentication and session management
- Must provide API endpoints for ChatGPT to interact with the development environment

**WebContainer Integration:**
- Must initialize WebContainer environment on demand
- Must maintain persistent state between interactions
- Must enable full Node.js toolchain execution (Webpack, Vite, etc.)
- Must provide file system access for repository operations
- Must support CLI command execution within the container

### 5.2 Tool Support Requirements

**Computer Use Tool:**
- Must enable mouse and keyboard simulation in the WebContainer environment
- Must support taking screenshots of the development environment
- Must enable interaction with UI elements within the container

**File System Tool:**
- Must provide full CRUD operations on files within the container
- Must support file uploads/downloads between ChatGPT and WebContainer
- Must enable repository operations (clone, commit, push, pull)

**RAG (Retrieval-Augmented Generation):**
- Must index code repositories for semantic search
- Must provide relevant code snippets based on natural language queries
- Must maintain context across multiple interactions

**CLI Coding Agents:**
- Must execute complex command sequences
- Must maintain terminal state between commands
- Must capture and return command output
- Must handle interactive CLI tools requiring user input

### 5.3 User Experience Requirements

- Must provide seamless integration with ChatGPT interface
- Must show real-time progress of operations
- Must handle errors gracefully with clear explanations
- Must maintain context between interactions
- Must provide visual feedback for long-running operations

## 6. Technical Specification

### 6.1 Architecture Overview

```
ChatGPT UI → Railway-hosted MCP Server → WebContainer Instance
```

### 6.2 Technology Stack

**Backend (Railway):**
- Node.js 18+ runtime
- Express.js for API endpoints
- Socket.io for real-time communication
- JWT for authentication
- Redis for session management

**WebContainer Integration:**
- WebContainer API (v1.0+)
- StackBlitz SDK
- Custom adapter layer for ChatGPT tool interface

**Additional Services:**
- GitHub API integration for repository operations
- Code search engine for RAG capabilities
- Terminal emulation for CLI operations

### 6.3 API Specification

**Authentication Endpoint:**
```
POST /api/v1/auth
Request: { apiKey: string }
Response: { token: string, expires: number }
```

**WebContainer Management:**
```
POST /api/v1/containers
Creates a new WebContainer instance
Response: { containerId: string, status: "initializing"|"ready" }

GET /api/v1/containers/{containerId}
Checks container status
Response: { containerId: string, status: string, url: string }

DELETE /api/v1/containers/{containerId}
Terminates a container instance
```

**File System Operations:**
```
GET /api/v1/containers/{containerId}/files
List directory contents
Query: path (optional)
Response: Array<{ name: string, type: "file"|"directory", size: number }>

POST /api/v1/containers/{containerId}/files
Create or update file
Body: { path: string, content: string }
Response: { success: boolean }

GET /api/v1/containers/{containerId}/files/{path}
Download file
Response: File content

DELETE /api/v1/containers/{containerId}/files/{path}
Delete file
Response: { success: boolean }
```

**CLI Operations:**
```
POST /api/v1/containers/{containerId}/terminal
Execute command
Body: { command: string, cwd?: string }
Response: { 
  output: string, 
  exitCode: number, 
  stdout: string, 
  stderr: string 
}

POST /api/v1/containers/{containerId}/terminal/stream
Execute command with streaming output
WebSocket endpoint for real-time command output
```

**Repository Operations:**
```
POST /api/v1/containers/{containerId}/git/clone
Clone repository
Body: { url: string, branch?: string, authToken?: string }
Response: { success: boolean, message: string }

POST /api/v1/containers/{containerId}/git/commit
Commit changes
Body: { message: string, files?: string[] }
Response: { success: boolean, commitHash: string }

POST /api/v1/containers/{containerId}/git/push
Push to remote
Body: { remote?: string, branch?: string, authToken: string }
Response: { success: boolean, message: string }
```

### 6.4 Deployment Specification

**Railway Configuration:**
- Project name: mcp-server
- Region: us-central1 (or nearest to majority of users)
- Services:
  - Web service (Node.js)
  - Redis add-on for session management
  - GitHub secrets for API keys
- Environment variables:
  - `PORT`: 3000 (default)
  - `WEBCONTAINER_API_KEY`: [StackBlitz API key]
  - `GITHUB_CLIENT_ID`: [GitHub OAuth client ID]
  - `GITHUB_CLIENT_SECRET`: [GitHub OAuth client secret]
  - `JWT_SECRET`: [Randomly generated secure string]
  - `ALLOWED_ORIGINS`: https://chat.openai.com

**Scaling Configuration:**
- Minimum instances: 1
- Maximum instances: 10 (scale based on active container count)
- Auto-scaling trigger: > 5 active containers per instance

## 7. Security Considerations

1. **Sandboxing**: All code execution occurs within WebContainer's browser-based sandbox
2. **Authentication**: JWT tokens with short expiration (1 hour) for API access
3. **Authorization**: Each container instance is isolated and accessible only to authenticated user
4. **Input Validation**: All CLI commands and file operations undergo strict validation
5. **Rate Limiting**: API endpoints limited to prevent abuse (100 requests/minute/user)
6. **Secret Management**: GitHub tokens stored securely and never exposed to client
7. **Session Management**: Containers automatically terminate after 30 minutes of inactivity

## 8. Implementation Roadmap

### Phase 1: Core Infrastructure (2 weeks)
- Set up Railway project and basic server
- Implement container management API
- Integrate WebContainer API
- Implement basic file operations

### Phase 2: Tool Integration (3 weeks)
- Implement CLI operations with streaming
- Add repository operations (Git integration)
- Implement Computer Use tool interface
- Add RAG capabilities for code search

### Phase 3: Optimization & Security (2 weeks)
- Implement session management and auto-termination
- Add comprehensive error handling
- Implement security measures and rate limiting
- Optimize performance for common operations

### Phase 4: Testing & Documentation (1 week)
- Create comprehensive test suite
- Document API for ChatGPT integration
- Create user documentation
- Final security review

## 9. Success Metrics

1. **Performance**: 
   - WebContainer initialization < 3 seconds
   - CLI command execution < 500ms for simple commands
   - File operations < 300ms for files < 1MB

2. **Reliability**:
   - 99.5% uptime for MCP server
   - < 1% failure rate for common operations
   - < 5% error rate for complex operations

3. **User Satisfaction**:
   - 80% of users completing complex coding tasks
   - 4.5/5 satisfaction rating for integration experience
   - 70% reduction in "I can't do this" user messages

## 10. Limitations and Future Considerations

1. **Current Limitations**:
   - WebContainers run in browser, limiting available resources
   - No direct access to user's local file system
   - Limited to Node.js environment (no other language runtimes)

2. **Future Enhancements**:
   - Support for multiple programming language environments
   - Integration with additional cloud providers
   - Enhanced collaboration features
   - Persistent workspace storage between sessions
   - Advanced debugging capabilities

# Technical Specification Addendum: ChatGPT Integration

## 1. Connection Protocol

The MCP server will connect to ChatGPT using the Remote MCP protocol as referenced in OpenAI's documentation (https://platform.openai.com/docs/guides/tools-remote-mcp).

## 2. Required Configuration in ChatGPT

To enable the MCP connector, the following configuration must be added to the ChatGPT assistant:

```json
{
  "tools": [
    {
      "type": "mcp",
      "mcp": {
        "name": "webcontainer-dev",
        "description": "Full development environment with WebContainer",
        "url": "https://[your-railway-app].up.railway.app",
        "authentication": {
          "type": "bearer_token",
          "header": "Authorization"
        }
      }
    }
  ]
}
```

## 3. Tool Capabilities Definition

The MCP server must declare its capabilities in the `/capabilities` endpoint:

```json
{
  "version": "1.0",
  "capabilities": [
    "file:read",
    "file:write",
    "file:delete",
    "file:list",
    "git:clone",
    "git:commit",
    "git:push",
    "git:pull",
    "terminal:execute",
    "terminal:stream",
    "computer-use:screenshot",
    "computer-use:click",
    "computer-use:type",
    "rag:search"
  ],
  "environment": {
    "os": "linux",
    "node_version": "18.17.0",
    "npm_version": "9.6.7"
  }
}
```

## 4. Error Handling Specification

All API responses must follow this standard format:

```json
{
  "status": "success" | "error",
  "data": { /* response data */ },
  "error": {
    "code": "INVALID_REQUEST" | "AUTH_FAILED" | "CONTAINER_NOT_FOUND" | "PERMISSION_DENIED" | "EXECUTION_ERROR",
    "message": "Human-readable error message"
  }
}
```

## 5. Sample Workflow: Implementing a Feature Request

1. User asks ChatGPT to implement a feature in their GitHub repository
2. ChatGPT sends request to MCP server to clone repository
3. MCP server initializes WebContainer and clones repo
4. ChatGPT sends file modification requests
5. MCP server applies changes in WebContainer
6. ChatGPT sends request to commit and push changes
7. MCP server completes Git operations
8. ChatGPT reports success to user

## 6. Performance Optimization Strategies

1. **Container Pooling**: Maintain a pool of pre-initialized containers for faster startup
2. **Caching**: Cache common dependencies to speed up environment setup
3. **Delta Updates**: Only send changed portions of files during edits
4. **Command Batching**: Allow multiple CLI commands in single request
5. **Lazy Initialization**: Only initialize full environment when needed

This PRD and specification provides a comprehensive blueprint for implementing an MCP server that connects ChatGPT with a powerful WebContainer-based development environment, enabling previously impossible coding workflows directly within the ChatGPT interface.

[https://railpack.com/getting-started  ](https://railpack.com/getting-started  )
2. [https://railpack.com/installation  ](https://railpack.com/installation  )
3. [https://railpack.com/guides/installing-packages  ](https://railpack.com/guides/installing-packages  )
4. [https://railpack.com/guides/adding-steps  ](https://railpack.com/guides/adding-steps  )
5. [https://railpack.com/guides/developing-locally  ](https://railpack.com/guides/developing-locally  )
6. [https://railpack.com/guides/running-railpack-in-production  ](https://railpack.com/guides/running-railpack-in-production  )
7. [https://railpack.com/config/file  ](https://railpack.com/config/file  )

please also add docs and specs for deployment to railway.vom via railpack
8. [https://railpack.com/config/environment-variables  ](https://railpack.com/config/environment-variables  )
9. [https://railpack.com/config/procfile  ](https://railpack.com/config/procfile  )
10. [https://railpack.com/languages/node  ](https://railpack.com/languages/node  )
11. [https://railpack.com/languages/python  ](https://railpack.com/languages/python  )
12. [https://railpack.com/languages/golang  ](https://railpack.com/languages/golang  )
13. [https://railpack.com/languages/php  ](https://railpack.com/languages/php  )
14. [https://railpack.com/languages/java  ](https://railpack.com/languages/java  )
15. [https://railpack.com/languages/ruby  ](https://railpack.com/languages/ruby  )
16. [https://railpack.com/reference/cli  ](https://railpack.com/reference/cli  )
17. [https://railpack.com/reference/frontend  ](https://railpack.com/reference/frontend  )
18. [https://railpack.com/architecture/overview  ](https://railpack.com/architecture/overview  )
19. [https://railpack.com/architecture/package-resolution  ](https://railpack.com/architecture/package-resolution  )
20. [https://railpack.com/architecture/secrets  ](https://railpack.com/architecture/secrets  )
21. [https://railpack.com/architecture/buildkit  ](https://railpack.com/architecture/buildkit  )
22. [https://railpack.com/architecture/caching  ](https://railpack.com/architecture/caching  )
23. [https://railpack.com/architecture/user-config  ](https://railpack.com/architecture/user-config  )
24. [https://railpack.com/contributing  ](https://railpack.com/contributing  )

# PRD and Specification Addendum: Railpack Deployment to Railway

## 1. Railpack Deployment Overview

This addendum provides specific details for deploying the MCP server to Railway using Railpack, enhancing the original PRD with precise configuration requirements and deployment procedures.

## 2. Railpack Configuration Requirements

### 2.1 Required railpack.json Configuration

```json
{
  "$schema": "https://schema.railpack.com",
  "provider": "node",
  "buildAptPackages": ["git", "curl", "build-essential", "libssl-dev", "libffi-dev", "python3-dev"],
  "packages": {
    "node": "20.x"
  },
  "caches": {
    "npm-cache": {
      "directory": "/root/.npm",
      "type": "shared"
    },
    "webcontainer-cache": {
      "directory": "/root/.webcontainer",
      "type": "shared"
    }
  },
  "steps": {
    "install": {
      "commands": [
        "npm install"
      ],
      "caches": ["npm-cache"]
    },
    "build": {
      "inputs": [
        {
          "step": "install",
          "include": ["."]
        }
      ],
      "commands": [
        "...",
        "npm run build"
      ]
    }
  },
  "deploy": {
    "base": {
      "image": "ghcr.io/railwayapp/railpack-runtime:node-20"
    },
    "startCommand": "node dist/server.js",
    "inputs": [
      "...",
      {
        "step": "build",
        "include": ["."]
      }
    ],
    "aptPackages": ["git", "curl"]
  }
}
```

### 2.2 Configuration Explanation

- **Provider**: Explicitly set to "node" for Node.js application detection
- **Build Apt Packages**: Includes essential packages for Git operations and WebContainer dependencies
- **Caches**: 
  - `npm-cache`: Speeds up dependency installation between builds
  - `webcontainer-cache`: Caches WebContainer runtime files for faster initialization
- **Steps**:
  - `install`: Handles npm dependencies with caching
  - `build`: Compiles TypeScript and prepares production assets
- **Deploy**:
  - Uses official Railway Node.js runtime image
  - Specifies correct start command for compiled code
  - Includes build artifacts in final image

## 3. Railway Deployment Specification via Railpack

### 3.1 Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Railway-assigned port (default: 3000) |
| `WEBCONTAINER_API_KEY` | Yes | StackBlitz API key for WebContainer access |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth client secret |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of allowed origins (e.g., "https://chat.openai.com") |
| `REDIS_URL` | Yes | Railway Redis connection string |
| `RAILWAY_API_TOKEN` | No | For Railway API access during deployment |

### 3.2 Procfile Configuration

Create a `Procfile` in the project root:

```
web: node dist/server.js
worker: node dist/worker.js
```

- `web`: Primary process handling API requests
- `worker`: Background process for container management and cleanup

### 3.3 Directory Structure Requirements

```
project-root/
├── railpack.json          # Railpack configuration
├── Procfile               # Process type definitions
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── server.ts          # Main server entry point
│   ├── container-manager.ts # WebContainer management
│   ├── api/               # API route handlers
│   └── ...                # Other source files
├── dist/                  # Compiled output (ignored in git)
└── ...
```

## 4. Deployment Workflow

### 4.1 Local Development Setup

1. Install Railpack CLI:
```bash
npm install -g @railway/railpack
```

2. Configure local development:
```bash
railpack init
```

3. Start development server:
```bash
railpack dev
```

### 4.2 Railway Deployment Steps

1. Link project to Railway:
```bash
railway login
railway link --project <your-project-id>
```

2. Set required environment variables:
```bash
railway variables set WEBCONTAINER_API_KEY=<your-key>
railway variables set GITHUB_CLIENT_ID=<your-id>
railway variables set GITHUB_CLIENT_SECRET=<your-secret>
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ALLOWED_ORIGINS="https://chat.openai.com"
```

3. Deploy to Railway:
```bash
railway up
```

### 4.3 Advanced Deployment Configuration

#### 4.3.1 Railway TOML Configuration

Create `railway.toml` for Railway-specific settings:

```toml
[build]
  dockerfile = "Dockerfile"
  start = "node dist/server.js"

[deploy]
  regions = ["us-central1", "europe-west1", "asia-southeast1"]
  min_instances = 1
  max_instances = 10

[environment]
  PORT = "3000"
  NODE_ENV = "production"

[addons]
  redis = true
```

#### 4.3.2 Scaling Configuration

```toml
[scaling]
  # Scale based on active containers
  metric = "custom:active_containers"
  target = 5
  min_instances = 1
  max_instances = 10
  cooldown_period = "5m"
  scale_in_cooldown = "10m"
```

## 5. Language-Specific Implementation Details

### 5.1 Node.js Implementation (MCP Server)

#### Package.json Requirements
```json
{
  "name": "mcp-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "redis": "^4.6.10",
    "jsonwebtoken": "^9.0.2",
    "webcontainer-api": "^1.0.0",
    "@stackblitz/sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0"
  }
}
```

#### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

### 5.2 WebContainer Integration Code

#### Container Manager Implementation
```typescript
// src/container-manager.ts
import { WebContainer } from '@webcontainer/api';

interface ContainerSession {
  id: string;
  container: WebContainer;
  createdAt: Date;
  lastActive: Date;
  repositoryUrl?: string;
}

class ContainerManager {
  private sessions: Map<string, ContainerSession> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor(private maxInactiveMinutes = 30) {
    this.cleanupInterval = setInterval(() => this.cleanupInactive(), 5 * 60 * 1000);
  }
  
  async createSession(userId: string): Promise<ContainerSession> {
    const id = `${userId}-${Date.now()}`;
    const container = await WebContainer.boot();
    
    const session: ContainerSession = {
      id,
      container,
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    this.sessions.set(id, session);
    return session;
  }
  
  async cloneRepository(sessionId: string, repoUrl: string, authToken?: string): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    // Implementation for repository cloning would go here
    // This would use the container's file system and git commands
  }
  
  private getSession(sessionId: string): ContainerSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = new Date();
    }
    return session;
  }
  
  private cleanupInactive(): void {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      const inactiveMinutes = (now.getTime() - session.lastActive.getTime()) / (1000 * 60);
      if (inactiveMinutes > this.maxInactiveMinutes) {
        session.container.teardown();
        this.sessions.delete(id);
      }
    }
  }
  
  shutdown(): void {
    clearInterval(this.cleanupInterval);
    for (const session of this.sessions.values()) {
      session.container.teardown();
    }
    this.sessions.clear();
  }
}

export const containerManager = new ContainerManager();
```

## 6. Production Deployment Best Practices

### 6.1 Performance Optimization

1. **WebContainer Pre-warming**:
   - Maintain a pool of pre-initialized containers
   - Use Railpack's caching to store container templates
   - Configure Railway to keep minimum instances running

2. **Railway Configuration**:
   ```bash
   # Set appropriate instance size
   railway variables set RAILWAY_MEMORY_MB=1024
   
   # Configure health checks
   railway variables set HEALTHCHECK_PATH="/health"
   railway variables set HEALTHCHECK_INTERVAL=30
   ```

### 6.2 Security Hardening

1. **Environment Configuration**:
   ```bash
   # Set strict security headers
   railway variables set SECURE_HEADERS="true"
   
   # Enable CSP for WebContainer iframe
   railway variables set CONTENT_SECURITY_POLICY="frame-ancestors 'self' https://chat.openai.com;"
   ```

2. **Railway Network Configuration**:
   ```toml
   # railway.toml
   [network]
     private = true
     allowed_services = ["redis"]
   ```

### 6.3 Monitoring and Logging

1. **Railway Integration**:
   ```bash
   # Enable Railway logging
   railway logs --service mcp-server
   
   # Set up custom metrics
   railway metrics set "active_containers" "gauge" "Number of active WebContainer instances"
   ```

2. **Custom Health Check Endpoint**:
   ```typescript
   // In server.ts
   app.get('/health', (req, res) => {
     const stats = {
       status: 'healthy',
       activeContainers: containerManager.getActiveCount(),
       uptime: process.uptime(),
       memory: process.memoryUsage()
     };
     res.json(stats);
   });
   ```

## 7. Troubleshooting Common Issues

### 7.1 WebContainer Initialization Failures

**Symptoms**: Slow container boot times or initialization errors

**Solutions**:
1. Increase Railway instance memory:
   ```bash
   railway variables set RAILWAY_MEMORY_MB=2048
   ```
2. Implement container pooling:
   ```typescript
   // Maintain a pool of pre-initialized containers
   const containerPool = new ContainerPool(5); // Keep 5 containers ready
   ```
3. Configure Railpack to cache WebContainer dependencies:
   ```json
   {
     "caches": {
       "webcontainer-cache": {
         "directory": "/root/.webcontainer",
         "type": "shared"
       }
     }
   }
   ```

### 7.2 Authentication Issues with ChatGPT

**Symptoms**: 401 errors when ChatGPT tries to connect to MCP server

**Solutions**:
1. Verify ALLOWED_ORIGINS includes "https://chat.openai.com"
2. Check JWT token expiration (should be 1 hour)
3. Validate Railway's CORS configuration:
   ```bash
   railway variables set CORS_ORIGIN="https://chat.openai.com"
   railway variables set CORS_METHODS="GET,POST,OPTIONS"
   ```

### 7.3 Deployment Failures

**Common Error**: "No start command could be found"

**Fix**:
1. Ensure `railpack.json` has correct startCommand:
   ```json
   {
     "deploy": {
       "startCommand": "node dist/server.js"
     }
   }
   ```
2. Verify compiled code exists in dist/ directory
3. Check Procfile matches the start command:
   ```
   web: node dist/server.js
   ```

## 8. Complete Deployment Checklist

1. [ ] railpack.json configured with proper build steps
2. [ ] Procfile created with correct process types
3. [ ] Railway environment variables set
4. [ ] Redis addon configured and connected
5. [ ] Health check endpoint implemented
6. [ ] Scaling configuration optimized
7. [ ] Security headers and CSP configured
8. [ ] Container cleanup logic implemented
9. [ ] WebContainer API key properly secured
10. [ ] Deployment tested with staging environment

This addendum provides comprehensive details for deploying the MCP server to Railway using Railpack, addressing all specific configuration requirements, deployment workflows, and troubleshooting considerations needed for a production-ready implementation that integrates seamlessly with ChatGPT and WebContainers.

# Railway Configuration Compliance Review

After reviewing my previous PRD and Specification against the Railway Config Quick-Check, I've identified several inconsistencies that need correction. Here's a detailed compliance analysis:

## Inconsistencies Found

### 1. Port Configuration Issues

**Previous Specification Gap:**
- I correctly identified `PORT` as an environment variable but **failed to show proper implementation in server code**
- Missing binding to `0.0.0.0` in the server implementation
- No demonstration of fallback pattern for local development

**Correct Implementation Needed:**
```typescript
// src/server.ts
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
```

### 2. Inter-Service URL References

**Previous Specification Gap:**
- Used hard-coded environment variables like `ALLOWED_ORIGINS="https://chat.openai.com"`
- Did not use Railway reference variables syntax (`${{api.RAILWAY_PRIVATE_DOMAIN}}`)
- No distinction between internal vs. public traffic patterns

**Correct Implementation Needed:**
```typescript
// In container manager or API client
const containerApiUrl = process.env.CONTAINER_API_URL || 
  `http://${{webcontainer.RAILWAY_PRIVATE_DOMAIN}}:${{webcontainer.PORT}}/api/v1`;
```

### 3. CORS Implementation

**Previous Specification Gap:**
- Only mentioned setting `ALLOWED_ORIGINS` environment variable
- Did not show proper CORS middleware configuration
- No handling for credentials or production-safe origin lists

**Correct Implementation Needed:**
```typescript
// In server.ts
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
}));
```

### 4. WebSocket Configuration

**Previous Specification Gap:**
- Mentioned Socket.IO dependency but no implementation details
- No protocol matching guidance (wss:// for HTTPS sites)
- No origin validation for WebSocket connections

**Correct Implementation Needed:**
```typescript
// In server.ts
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Client-side connection (example)
const socket = io(process.env.WEBSOCKET_URL || 
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);
```

### 5. Railway TOML Configuration

**Previous Specification Gap:**
- Incorrectly set PORT to a fixed value in railway.toml
- Missing proper environment variable references

**Correct Implementation Needed:**
```toml
[build]
  dockerfile = "Dockerfile"
  start = "node dist/server.js"

[deploy]
  regions = ["us-central1", "europe-west1", "asia-southeast1"]
  min_instances = 1
  max_instances = 10

# Remove PORT from environment - Railway sets this automatically
# [environment]
#   PORT = "3000"  <-- THIS IS WRONG
```

### 6. Dockerfile Configuration (Missing)

**Previous Specification Gap:**
- No Dockerfile example provided despite discussing container deployment
- Missing EXPOSE directive with proper PORT handling

**Correct Implementation Needed:**
```dockerfile
# Dockerfile
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose the port (Railway will override with $PORT at runtime)
ARG PORT=3000
EXPOSE $PORT

# Start the application
CMD ["node", "dist/server.js"]
```

## Compliance Checklist Implementation

Here's how the MCP server implementation should align with the Railway Config Quick-Check:

### 1. Port Configuration (Node.js)
```typescript
// src/server.ts - CORRECTED
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${port}`);
});
```

### 2. Inter-Service URL References
```typescript
// CORRECTED service-to-service communication
function getWebContainerUrl() {
  // Use Railway reference variables in production
  if (process.env.RAILWAY_ENVIRONMENT) {
    return `http://${{webcontainer.RAILWAY_PRIVATE_DOMAIN}}:${{webcontainer.PORT}}/api/v1`;
  }
  // Local development fallback
  return 'http://localhost:3000/api/v1';
}
```

### 3. CORS Implementation
```typescript
// CORRECTED CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Never allow '*' in production
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS must be set in production');
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4. WebSocket Protocol Handling
```typescript
// CORRECTED WebSocket implementation
const server = app.listen(port, '0.0.0.0');
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000
  },
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### 5. Deployment Verification
```bash
# After deployment
railway logs --service mcp-server
# Product Requirements Document (PRD) and Technical Specification: MCP Server with WebContainer Integration

## 1. Executive Summary
This document outlines the requirements and specifications for developing an MCP (Model Control Plane) server that integrates with ChatGPT through Railway deployment. The solution will leverage WebContainers technology to provide a complete development environment within the browser, enabling complex coding tasks, repository interactions, and advanced tool usage directly from ChatGPT. This specification has been updated to ensure full compliance with Railway's configuration best practices.

## 2. Problem Statement
Current AI coding assistants have limited capabilities when it comes to:
- Fully interacting with code repositories
- Performing complex CLI operations
- Executing multi-step coding tasks requiring persistent environments
- Providing true agentic behavior with file system access

This solution addresses these limitations by creating a bridge between ChatGPT and a fully functional development environment powered by WebContainers.

## 3. Product Goals
1. Enable ChatGPT to interact with a complete development environment
2. Provide persistent workspace for complex coding tasks
3. Support all ChatGPT tools (Computer Use, Files, RAG, CLI coding agents)
4. Allow seamless repository interactions (clone, commit, push, etc.)
5. Maintain security while providing powerful capabilities
6. Deliver fast response times for coding operations

## 4. Target Users
- Developers using ChatGPT for coding assistance
- Technical teams implementing AI-powered development workflows
- Educators creating interactive coding tutorials
- Documentation teams building next-generation interactive documentation

## 5. Key Features and Requirements

### 5.1 Core Functionality
**MCP Server Requirements:**
- Must deploy to Railway.com with minimal configuration
- Must establish secure connection to ChatGPT's API
- Must manage WebContainer instances for user sessions
- Must handle authentication and session management
- Must provide API endpoints for ChatGPT to interact with the development environment

**WebContainer Integration:**
- Must initialize WebContainer environment on demand
- Must maintain persistent state between interactions
- Must enable full Node.js toolchain execution (Webpack, Vite, etc.)
- Must provide file system access for repository operations
- Must support CLI command execution within the container

### 5.2 Tool Support Requirements
**Computer Use Tool:**
- Must enable mouse and keyboard simulation in the WebContainer environment
- Must support taking screenshots of the development environment
- Must enable interaction with UI elements within the container

**File System Tool:**
- Must provide full CRUD operations on files within the container
- Must support file uploads/downloads between ChatGPT and WebContainer
- Must enable repository operations (clone, commit, push, pull)

**RAG (Retrieval-Augmented Generation):**
- Must index code repositories for semantic search
- Must provide relevant code snippets based on natural language queries
- Must maintain context across multiple interactions

**CLI Coding Agents:**
- Must execute complex command sequences
- Must maintain terminal state between commands
- Must capture and return command output
- Must handle interactive CLI tools requiring user input

### 5.3 User Experience Requirements
- Must provide seamless integration with ChatGPT interface
- Must show real-time progress of operations
- Must handle errors gracefully with clear explanations
- Must maintain context between interactions
- Must provide visual feedback for long-running operations

## 6. Technical Specification

### 6.1 Architecture Overview
```
ChatGPT UI → Railway-hosted MCP Server → WebContainer Instance
```

### 6.2 Technology Stack
**Backend (Railway):**
- Node.js 20+ runtime
- Express.js for API endpoints
- Socket.io for real-time communication
- JWT for authentication
- Redis for session management

**WebContainer Integration:**
- WebContainer API (v1.0+)
- StackBlitz SDK
- Custom adapter layer for ChatGPT tool interface

**Additional Services:**
- GitHub API integration for repository operations
- Code search engine for RAG capabilities
- Terminal emulation for CLI operations

### 6.3 API Specification
**Authentication Endpoint:**
```
POST /api/v1/auth
Request: { apiKey: string }
Response: { token: string, expires: number }
```

**WebContainer Management:**
```
POST /api/v1/containers
Creates a new WebContainer instance
Response: { containerId: string, status: "initializing"|"ready" }
GET /api/v1/containers/{containerId}
Checks container status
Response: { containerId: string, status: string, url: string }
DELETE /api/v1/containers/{containerId}
Terminates a container instance
```

**File System Operations:**
```
GET /api/v1/containers/{containerId}/files
List directory contents
Query: path (optional)
Response: Array<{ name: string, type: "file"|"directory", size: number }>
POST /api/v1/containers/{containerId}/files
Create or update file
Body: { path: string, content: string }
Response: { success: boolean }
GET /api/v1/containers/{containerId}/files/{path}
Download file
Response: File content
DELETE /api/v1/containers/{containerId}/files/{path}
Delete file
Response: { success: boolean }
```

**CLI Operations:**
```
POST /api/v1/containers/{containerId}/terminal
Execute command
Body: { command: string, cwd?: string }
Response: { 
  output: string, 
  exitCode: number, 
  stdout: string, 
  stderr: string 
}
POST /api/v1/containers/{containerId}/terminal/stream
Execute command with streaming output
WebSocket endpoint for real-time command output
```

**Repository Operations:**
```
POST /api/v1/containers/{containerId}/git/clone
Clone repository
Body: { url: string, branch?: string, authToken?: string }
Response: { success: boolean, message: string }
POST /api/v1/containers/{containerId}/git/commit
Commit changes
Body: { message: string, files?: string[] }
Response: { success: boolean, commitHash: string }
POST /api/v1/containers/{containerId}/git/push
Push to remote
Body: { remote?: string, branch?: string, authToken: string }
Response: { success: boolean, message: string }
```

### 6.4 Deployment Specification

**Railway Configuration:**
- Project name: mcp-server
- Region: us-central1 (or nearest to majority of users)
- Services:
  - Web service (Node.js)
  - Redis add-on for session management
  - GitHub secrets for API keys
- Environment variables:
  - `WEBCONTAINER_API_KEY`: [StackBlitz API key]
  - `GITHUB_CLIENT_ID`: [GitHub OAuth client ID]
  - `GITHUB_CLIENT_SECRET`: [GitHub OAuth client secret]
  - `JWT_SECRET`: [Randomly generated secure string]
  - `ALLOWED_ORIGINS`: https://chat.openai.com
  - `REDIS_URL`: [Railway Redis connection string]

**Server Implementation (Corrected):**
```typescript
// src/server.ts
import express from 'express';
import http from 'http';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// CORS Configuration
import cors from 'cors';
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Never allow '*' in production
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS must be set in production');
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Server setup
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${port}`);
});

// WebSocket setup
import { Server } from 'socket.io';
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000
  },
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

**Dockerfile Configuration:**
```dockerfile
# Dockerfile
FROM node:20-slim
# Set working directory
WORKDIR /app
# Copy package.json and install dependencies
COPY package.json .
RUN npm ci
# Copy application code
COPY . .
# Build the application
RUN npm run build
# Expose the port (Railway will override with $PORT at runtime)
ARG PORT=3000
EXPOSE $PORT
# Start the application
CMD ["node", "dist/server.js"]
```

**railway.toml Configuration:**
```toml
[build]
  dockerfile = "Dockerfile"
  start = "node dist/server.js"
[deploy]
  regions = ["us-central1", "europe-west1", "asia-southeast1"]
  min_instances = 1
  max_instances = 10
[environment]
  NODE_ENV = "production"
[addons]
  redis = true
[scaling]
  # Scale based on active containers
  metric = "custom:active_containers"
  target = 5
  min_instances = 1
  max_instances = 10
  cooldown_period = "5m"
  scale_in_cooldown = "10m"
```

**railpack.json Configuration:**
```json
{
  "$schema": "https://schema.railpack.com",
  "provider": "node",
  "buildAptPackages": ["git", "curl", "build-essential", "libssl-dev", "libffi-dev", "python3-dev"],
  "packages": {
    "node": "20.x"
  },
  "caches": {
    "npm-cache": {
      "directory": "/root/.npm",
      "type": "shared"
    },
    "webcontainer-cache": {
      "directory": "/root/.webcontainer",
      "type": "shared"
    }
  },
  "steps": {
    "install": {
      "commands": [
        "npm install"
      ],
      "caches": ["npm-cache"]
    },
    "build": {
      "inputs": [
        {
          "step": "install",
          "include": ["."]
        }
      ],
      "commands": [
        "npm run build"
      ]
    }
  },
  "deploy": {
    "base": {
      "image": "ghcr.io/railwayapp/railpack-runtime:node-20"
    },
    "startCommand": "node dist/server.js",
    "inputs": [
      {
        "step": "build",
        "include": ["."]
      }
    ],
    "aptPackages": ["git", "curl"]
  }
}
```

**Procfile Configuration:**
```
web: node dist/server.js
worker: node dist/worker.js
```

## 7. Security Considerations
1. **Sandboxing**: All code execution occurs within WebContainer's browser-based sandbox
2. **Authentication**: JWT tokens with short expiration (1 hour) for API access
3. **Authorization**: Each container instance is isolated and accessible only to authenticated user
4. **Input Validation**: All CLI commands and file operations undergo strict validation
5. **Rate Limiting**: API endpoints limited to prevent abuse (100 requests/minute/user)
6. **Secret Management**: GitHub tokens stored securely and never exposed to client
7. **Session Management**: Containers automatically terminate after 30 minutes of inactivity
8. **CORS Security**: Strict origin validation prevents unauthorized access
9. **Content Security**: Proper CSP headers configured to protect against XSS attacks

## 8. Implementation Roadmap
### Phase 1: Core Infrastructure (2 weeks)
- Set up Railway project and basic server with proper port binding
- Implement container management API with Railway-compliant configuration
- Integrate WebContainer API with proper error handling
- Implement basic file operations with security validation

### Phase 2: Tool Integration (3 weeks)
- Implement CLI operations with streaming and proper WebSocket configuration
- Add repository operations (Git integration) with secure token handling
- Implement Computer Use tool interface with proper CORS configuration
- Add RAG capabilities for code search with secure indexing

### Phase 3: Optimization & Security (2 weeks)
- Implement session management and auto-termination with proper cleanup
- Add comprehensive error handling with user-friendly messages
- Implement security measures including proper CORS and CSP
- Optimize performance for common operations with caching strategies

### Phase 4: Testing & Documentation (1 week)
- Create comprehensive test suite covering Railway-specific scenarios
- Document API for ChatGPT integration with Railway reference variables
- Create user documentation with deployment troubleshooting guide
- Final security review focusing on Railway environment specifics

## 9. Success Metrics
1. **Performance**: 
   - WebContainer initialization < 3 seconds
   - CLI command execution < 500ms for simple commands
   - File operations < 300ms for files < 1MB
2. **Reliability**:
   - 99.5% uptime for MCP server
   - < 1% failure rate for common operations
   - < 5% error rate for complex operations
3. **User Satisfaction**:
   - 80% of users completing complex coding tasks
   - 4.5/5 satisfaction rating for integration experience
   - 70% reduction in "I can't do this" user messages

## 10. Limitations and Future Considerations
1. **Current Limitations**:
   - WebContainers run in browser, limiting available resources
   - No direct access to user's local file system
   - Limited to Node.js environment (no other language runtimes)
2. **Future Enhancements**:
   - Support for multiple programming language environments
   - Integration with additional cloud providers
   - Enhanced collaboration features
   - Persistent workspace storage between sessions
   - Advanced debugging capabilities

# Technical Specification Addendum: ChatGPT Integration

## 1. Connection Protocol
The MCP server will connect to ChatGPT using the Remote MCP protocol as referenced in OpenAI's documentation (https://platform.openai.com/docs/guides/tools-remote-mcp).

## 2. Required Configuration in ChatGPT
To enable the MCP connector, the following configuration must be added to the ChatGPT assistant:
```json
{
  "tools": [
    {
      "type": "mcp",
      "mcp": {
        "name": "webcontainer-dev",
        "description": "Full development environment with WebContainer",
        "url": "https://[your-railway-app].up.railway.app",
        "authentication": {
          "type": "bearer_token",
          "header": "Authorization"
        }
      }
    }
  ]
}
```

## 3. Tool Capabilities Definition
The MCP server must declare its capabilities in the `/capabilities` endpoint:
```json
{
  "version": "1.0",
  "capabilities": [
    "file:read",
    "file:write",
    "file:delete",
    "file:list",
    "git:clone",
    "git:commit",
    "git:push",
    "git:pull",
    "terminal:execute",
    "terminal:stream",
    "computer-use:screenshot",
    "computer-use:click",
    "computer-use:type",
    "rag:search"
  ],
  "environment": {
    "os": "linux",
    "node_version": "20.0.0",
    "npm_version": "9.6.7"
  }
}
```

## 4. Error Handling Specification
All API responses must follow this standard format:
```json
{
  "status": "success" | "error",
  "data": { /* response data */ },
  "error": {
    "code": "INVALID_REQUEST" | "AUTH_FAILED" | "CONTAINER_NOT_FOUND" | "PERMISSION_DENIED" | "EXECUTION_ERROR",
    "message": "Human-readable error message"
  }
}
```

## 5. Service-to-Service Communication
**Correct Implementation for Inter-Service URLs:**
```typescript
// Service-to-service communication helper
function getServiceUrl(serviceName: string): string {
  // Use Railway reference variables in production
  if (process.env.RAILWAY_ENVIRONMENT) {
    return `http://${{${serviceName}.RAILWAY_PRIVATE_DOMAIN}}:${{${serviceName}.PORT}}/api/v1`;
  }
  // Local development fallback
  return `http://localhost:${process.env[`${serviceName.toUpperCase()}_PORT`] || 3000}/api/v1`;
}

// Example usage
const webcontainerUrl = getServiceUrl('webcontainer');
```

## 6. Sample Workflow: Implementing a Feature Request
1. User asks ChatGPT to implement a feature in their GitHub repository
2. ChatGPT sends request to MCP server to clone repository
3. MCP server initializes WebContainer and clones repo
4. ChatGPT sends file modification requests
5. MCP server applies changes in WebContainer
6. ChatGPT sends request to commit and push changes
7. MCP server completes Git operations
8. ChatGPT reports success to user

## 7. Performance Optimization Strategies
1. **Container Pooling**: Maintain a pool of pre-initialized containers for faster startup
2. **Caching**: Cache common dependencies to speed up environment setup
3. **Delta Updates**: Only send changed portions of files during edits
4. **Command Batching**: Allow multiple CLI commands in single request
5. **Lazy Initialization**: Only initialize full environment when needed
6. **Railway-Specific Optimizations**: 
   - Configure proper instance sizing with RAILWAY_MEMORY_MB
   - Implement health checks with HEALTHCHECK_PATH
   - Use shared caches for WebContainer dependencies

## 8. Deployment Verification
After deployment, verify with:
```bash
railway logs --service mcp-server
```
Should see:
```
✅ Server running on 0.0.0.0:52341
```

Validate public endpoint returns 200 and shows proper CORS headers:
```bash
curl -I https://[your-railway-app].up.railway.app/api/v1/capabilities
```

This PRD and specification provides a comprehensive and Railway-compliant blueprint for implementing an MCP server that connects ChatGPT with a powerful WebContainer-based development environment, enabling previously impossible coding workflows directly within the ChatGPT interface.
# Should see:
# ✅ Server running on 0.0.0.0:52341
# (NOT "Server running on localhost:3000")
```

## Critical Fixes Summary

| Issue | Previous Specification | Corrected Implementation |
|-------|------------------------|--------------------------|
| Port binding | Mentioned PORT env var but no code | `app.listen(process.env.PORT, '0.0.0.0')` |
| Inter-service URLs | Hard-coded URLs | `${{service.RAILWAY_PRIVATE_DOMAIN}}` |
| CORS | Only env var mentioned | Proper middleware with origin validation |
| WebSockets | No implementation details | Protocol-aware connection with CORS |
| Railway TOML | Hard-coded PORT=3000 | Removed PORT from environment section |
| Dockerfile | Not provided | Added with proper EXPOSE and CMD |

## Updated Deployment Checklist

1. Verify server binds to `0.0.0.0` with `process.env.PORT`
2. Replace all hardcoded URLs with Railway reference variables
3. Confirm CORS configuration uses ALLOWED_ORIGINS (not "*")
4. Ensure WebSocket connections use protocol-relative URLs
5. Remove PORT from railway.toml environment section
6. Add proper Dockerfile with EXPOSE $PORT
7. Test deployment with `railway up` and verify logs show "0.0.0.0:[port]"
8. Validate public endpoint returns 200 and shows proper CORS headers

This corrected implementation now fully complies with Railway's best practices for port handling, environment variables, and service-to-service communication. The key improvement is using Railway's reference variable syntax for inter-service communication and ensuring all network bindings follow the 0.0.0.0 convention with proper port handling.
