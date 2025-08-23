# Code Analysis Instructions for AI Agent

## Overview
This document provides systematic instructions for AI agents to analyze existing codebases and add new functionality effectively. Use this process when working with established code to maintain consistency and quality.

## Pre-Analysis Preparation

### 1. Codebase Discovery

**Repository Structure Analysis**
```bash
# Get overview of project structure
tree -I 'node_modules|dist|.git' -L 3

# Analyze file types and sizes
find . -name "*.ts" -o -name "*.js" -o -name "*.json" | head -20
wc -l src/**/*.ts

# Check dependencies
cat package.json | jq '.dependencies, .devDependencies'

# Review configuration files
ls -la | grep -E '\.(json|toml|yaml|yml|env)$'
```

**Documentation Review**
- [ ] README.md for setup and usage instructions
- [ ] API.md for endpoint documentation
- [ ] DEPLOYMENT.md for deployment procedures
- [ ] package.json for scripts and dependencies
- [ ] tsconfig.json for TypeScript configuration

### 2. Architecture Understanding

**Code Organization Patterns**
```
src/
├── api/           # Route handlers (Controllers)
├── lib/           # Business logic (Services)  
├── middleware/    # Cross-cutting concerns
├── types/         # TypeScript definitions
└── server.ts      # Application entry point
```

**Design Patterns Identification**
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Request/response processing
- **Factory Pattern**: Object creation (container management)
- **Observer Pattern**: Event handling (WebSocket connections)
- **Strategy Pattern**: Algorithm selection (command validation)

## Code Analysis Methodology

### 1. Static Code Analysis

**TypeScript Analysis**
```typescript
// Understand type definitions and interfaces
interface ContainerSession {
  id: string;
  userId: string;
  container: WebContainer;
  createdAt: Date;
  lastActive: Date;
  status: 'initializing' | 'ready' | 'error' | 'terminated';
}

// Analyze error handling patterns
enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  AUTH_FAILED = 'AUTH_FAILED',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  EXECUTION_ERROR = 'EXECUTION_ERROR'
}
```

**API Pattern Analysis**
```typescript
// Standard API response format
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}

// Authentication middleware pattern
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // JWT validation logic
};

// Error handling pattern
router.post('/endpoint', async (req: Request, res: Response) => {
  try {
    // Business logic
    res.json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: error.message
      }
    });
  }
});
```

### 2. Runtime Behavior Analysis

**Dependency Flow Mapping**
```typescript
// Main application flow
server.ts → Express setup → Middleware chain → Route handlers → Business logic

// Container management flow
API request → Auth middleware → Container manager → WebContainer API

// Error handling flow
Exception → Error handler middleware → Structured response → Client
```

**State Management Analysis**
```typescript
// Session state (in-memory Map)
class ContainerManager {
  private sessions: Map<string, ContainerSession> = new Map();
  
  // Pool management (optimization)
  private pool: ContainerPool = { ready: [], initializing: [] };
}

// Authentication state (JWT tokens)
interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
```

## Integration Pattern Analysis

### 1. External Service Integration

**WebContainer API Integration**
```typescript
// Current integration pattern
import { WebContainer } from '@webcontainer/api';

async getOrCreateContainer(): Promise<WebContainer> {
  // Try pool first
  if (this.pool.ready.length > 0) {
    return this.pool.ready.pop()!;
  }
  
  // Create new container
  return await WebContainer.boot();
}
```

**Redis Integration Pattern** (Currently missing - needs implementation)
```typescript
// Expected Redis integration
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

// Session storage in Redis instead of Map
async storeSession(session: ContainerSession): Promise<void> {
  await redisClient.setex(
    `session:${session.id}`,
    30 * 60, // 30 minutes TTL
    JSON.stringify(session)
  );
}
```

### 2. Security Pattern Analysis

**Current Security Implementation**
```typescript
// JWT authentication
const token = jwt.verify(tokenString, process.env.JWT_SECRET!) as JWTPayload;

// CORS configuration
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true
});
```

**Security Gaps Analysis**
- Input validation implementation (express-validator)
- Command sanitization for terminal operations
- File path validation for directory traversal prevention
- Session cleanup and timeout enforcement

## Missing Functionality Identification

### 1. Helper Function Analysis

**Files API - Fully Implemented**
```typescript
// File operations are fully implemented using WebContainer fs API
async function listFiles(container: WebContainer, path: string): Promise<FileListItem[]> {
  // ✅ IMPLEMENTED: Uses container.fs.readdir with file type detection
  const fs = container.fs;
  const entries = await fs.readdir(path, { withFileTypes: true });
  // Returns structured file list with names, types, sizes, and modification dates
}

async function writeFile(container: WebContainer, path: string, content: string, encoding: string = 'utf-8'): Promise<void> {
  // ✅ IMPLEMENTED: Uses container.fs.writeFile with directory creation
  const fs = container.fs;
  // Automatically creates parent directories if they don't exist
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(path, content, encoding);
}

async function readFile(container: WebContainer, path: string): Promise<string> {
  // ✅ IMPLEMENTED: Uses container.fs.readFile with proper error handling
  const fs = container.fs;
  return await fs.readFile(path, 'utf-8');
}

async function deleteFile(container: WebContainer, path: string): Promise<void> {
  // ✅ IMPLEMENTED: Uses container.fs.rm with error handling
  const fs = container.fs;
  await fs.rm(path);
}
```

**Git Operations - Fully Implemented**
```typescript
// Git operations are fully implemented using container.spawn()
async function cloneRepository(
  container: WebContainer,
  options: GitCloneRequest
): Promise<GitResponse> {
  // ✅ IMPLEMENTED: Uses container.spawn('git', ['clone', ...]) with authentication
  const args = ['clone'];
  if (branch) args.push('-b', branch);
  
  // Handles GitHub token authentication by modifying URL
  const authenticatedUrl = url.includes('github.com') 
    ? url.replace('https://github.com/', `https://${authToken}@github.com/`)
    : url;
  
  const cloneProcess = await container.spawn('git', [...args, authenticatedUrl, directory]);
  return await cloneProcess.exit;
}

async function commitChanges(
  container: WebContainer,
  options: GitCommitRequest
): Promise<GitResponse> {
  // ✅ IMPLEMENTED: Full git add, commit sequence with author configuration
  if (author) {
    await container.spawn('git', ['config', 'user.name', author.name]);
    await container.spawn('git', ['config', 'user.email', author.email]);
  }
  
  // Stage files and commit
  await container.spawn('git', ['add', ...files]);
  const commitProcess = await container.spawn('git', ['commit', '-m', message]);
  return { success: true, commitHash: await getLatestCommitHash(container) };
}

async function pushChanges(container: WebContainer, options: GitPushRequest): Promise<GitResponse> {
  // ✅ IMPLEMENTED: Git push with authentication and branch specification
  const pushProcess = await container.spawn('git', ['push', remote, branch]);
  return { success: exitCode === 0, message: 'Push completed' };
}

async function pullChanges(container: WebContainer, options: GitPullRequest): Promise<GitResponse> {
  // ✅ IMPLEMENTED: Git pull with merge handling
  const pullProcess = await container.spawn('git', ['pull', remote, branch]);
  return { success: exitCode === 0, message: 'Pull completed' };
}
```

**Terminal Operations - Missing Implementations**
```typescript
// Terminal command execution needing real implementation
async function executeCommand(
  container: WebContainer,
  command: string,
  options: CommandOptions
): Promise<TerminalResponse> {
  // TODO: Use container.spawn() with proper error handling
  return {
    output: "Command executed (stub)",
    exitCode: 0,
    stdout: "",
    stderr: ""
  };
}
```

### 2. Missing API Endpoints

**Computer Use Capabilities** (Not implemented)
```typescript
// Missing endpoints for computer-use tool
// POST /api/v1/containers/:id/screenshot
// POST /api/v1/containers/:id/click
// POST /api/v1/containers/:id/type
```

**RAG Search Capability** (Not implemented)
```typescript
// Missing endpoint for code search
// POST /api/v1/rag/search
```

## Implementation Strategy for Adding Features

### 1. Incremental Development Approach

**Phase 1: Core Function Implementation**
1. Implement real WebContainer API calls
2. Add proper error handling and validation
3. Test with simple use cases
4. Add comprehensive logging

**Phase 2: Missing Endpoint Addition**
1. Add computer-use endpoints
2. Implement RAG search functionality
3. Add proper authentication and authorization
4. Write comprehensive tests

**Phase 3: Infrastructure Enhancement**
1. Integrate Redis for session management
2. Add background worker for cleanup
3. Implement proper monitoring and metrics
4. Optimize performance and caching

### 2. Code Integration Patterns

**Following Existing Patterns**
```typescript
// Follow established error handling pattern
try {
  const result = await realImplementation();
  res.json({
    status: 'success',
    data: result
  });
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({
    status: 'error',
    error: {
      code: ErrorCode.EXECUTION_ERROR,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  });
}

// Follow established validation pattern
if (!containerId || typeof containerId !== 'string') {
  return res.status(400).json({
    status: 'error',
    error: {
      code: ErrorCode.INVALID_REQUEST,
      message: 'Container ID is required'
    }
  });
}

// Follow established session pattern
const session = containerManager.getSession(containerId);
if (!session) {
  return res.status(404).json({
    status: 'error',
    error: {
      code: ErrorCode.CONTAINER_NOT_FOUND,
      message: 'Container not found'
    }
  });
}

if (session.userId !== userId) {
  return res.status(403).json({
    status: 'error',
    error: {
      code: ErrorCode.PERMISSION_DENIED,
      message: 'Access denied to this container'
    }
  });
}
```

### 3. Testing Integration Strategy

**Follow Existing Test Patterns**
```typescript
// Unit test pattern for new functions
describe('FileOperations', () => {
  let mockContainer: jest.Mocked<WebContainer>;

  beforeEach(() => {
    mockContainer = {
      fs: {
        writeFile: jest.fn(),
        readFile: jest.fn(),
        readdir: jest.fn()
      }
    } as any;
  });

  describe('listFiles', () => {
    it('should return file list from container filesystem', async () => {
      // Arrange
      mockContainer.fs.readdir.mockResolvedValue([
        { name: 'file1.txt', type: 'file' },
        { name: 'dir1', type: 'directory' }
      ]);

      // Act
      const files = await listFiles(mockContainer, '/');

      // Assert
      expect(files).toHaveLength(2);
      expect(mockContainer.fs.readdir).toHaveBeenCalledWith('/');
    });
  });
});

// Integration test pattern for new endpoints
describe('Computer Use API', () => {
  it('should capture screenshot of container', async () => {
    const response = await request(app)
      .post(`/api/v1/containers/${containerId}/screenshot`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'success',
      data: {
        screenshot: expect.any(String), // base64 image
        timestamp: expect.any(String)
      }
    });
  });
});
```

## Code Quality and Consistency

### 1. Style Consistency Analysis

**Naming Conventions Observed**
- camelCase for variables and functions: `containerId`, `createSession`
- PascalCase for classes and interfaces: `ContainerManager`, `ContainerSession`
- UPPER_SNAKE_CASE for constants: `ErrorCode.CONTAINER_NOT_FOUND`
- kebab-case for file names: `container-manager.ts`, `error-handler.ts`

**Code Organization Patterns**
- One class per file in lib/
- One router per domain in api/
- Shared types in types/index.ts
- Middleware in middleware/ directory

### 2. Documentation Standards

**JSDoc Pattern for Public APIs**
```typescript
/**
 * Creates a new WebContainer session for the specified user.
 * 
 * @param userId - Unique identifier for the user
 * @returns Promise resolving to the created container session
 * @throws {Error} When container limit is reached or initialization fails
 */
async createSession(userId: string): Promise<ContainerSession> {
  // Implementation
}
```

**Inline Comment Standards**
```typescript
// Use for explaining WHY, not WHAT
// Container pooling improves startup time by pre-initializing instances
const containerPool = new ContainerPool(5);

// Explain complex business logic
// Cleanup inactive containers every 5 minutes to prevent resource leaks
this.cleanupInterval = setInterval(() => this.cleanupInactive(), 5 * 60 * 1000);
```

## Performance and Security Analysis

### 1. Performance Bottlenecks

**Current Performance Issues**
- In-memory session storage (doesn't scale)
- No connection pooling for external APIs
- Lack of caching for frequently accessed data
- Sequential container initialization

**Optimization Opportunities**
- Redis session storage
- Connection pooling
- Response caching
- Container pre-warming

### 2. Security Vulnerability Assessment

**Current Security Measures**
- JWT authentication
- CORS configuration
- Rate limiting
- Helmet.js security headers

**Security Gaps**
- No input sanitization for terminal commands
- No file path validation for directory traversal
- Session timeout not enforced
- No audit logging for sensitive operations

## Migration and Upgrade Strategy

### 1. Database Migration Pattern

**Session Storage Migration**
```typescript
// Current: In-memory Map
private sessions: Map<string, ContainerSession> = new Map();

// Target: Redis-backed storage
class RedisSessionStore {
  async storeSession(session: ContainerSession): Promise<void> {
    await redisClient.setex(
      `session:${session.id}`,
      this.maxInactiveMinutes * 60,
      JSON.stringify(session)
    );
  }

  async getSession(sessionId: string): Promise<ContainerSession | null> {
    const data = await redisClient.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
}
```

### 2. API Versioning Strategy

**Current API Structure**
```
/api/v1/auth
/api/v1/containers
/api/v1/files
/api/v1/terminal
/api/v1/git
```

**Future API Extensions**
```
/api/v1/computer-use     # New computer use endpoints
/api/v1/rag             # New RAG search endpoints
/api/v2/containers      # Enhanced container management
```

## Conclusion and Recommendations

### 1. Priority Implementation Order

**High Priority (Core Functionality)**
1. Implement real WebContainer API calls for file operations
2. Add real Git operations using container.spawn()
3. Implement real terminal command execution
4. Add proper input validation and sanitization

**Medium Priority (Missing Features)**
1. Add computer-use endpoints (screenshot, click, type)
2. Implement RAG search functionality
3. Add Redis session management
4. Implement background worker process

**Low Priority (Optimizations)**
1. Add comprehensive caching strategy
2. Implement container pooling optimizations
3. Add advanced monitoring and metrics
4. Performance tuning and optimization

### 2. Development Guidelines for New Code

**Consistency Requirements**
- Follow existing error handling patterns
- Use established type definitions
- Maintain current API response format
- Follow existing authentication/authorization patterns

**Quality Standards**
- Add comprehensive tests for all new functionality
- Include proper error handling and logging
- Document all public APIs with JSDoc
- Follow security best practices for input validation

**Integration Principles**
- Minimize changes to existing working code
- Add functionality incrementally with feature flags
- Maintain backward compatibility
- Test thoroughly before deploying

This analysis framework ensures that new code integrates seamlessly with existing patterns while identifying and addressing gaps in functionality and security.