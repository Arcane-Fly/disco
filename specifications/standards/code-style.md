# Code Style Guide

## General Principles

### Code Philosophy
- **Clarity over cleverness**: Write code that's easy to understand
- **Consistency is key**: Follow established patterns throughout the codebase
- **Security first**: Every decision should consider security implications
- **Performance aware**: Write efficient code without premature optimization

## TypeScript Standards

### Type Definitions
```typescript
// ✅ Prefer explicit interface definitions
interface UserSession {
  id: string;
  userId: string;
  createdAt: Date;
  lastActive: Date;
}

// ✅ Use enums for constants
enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND'
}

// ❌ Avoid any unless absolutely necessary
const data: any = {}; // Bad

// ✅ Use proper typing
const data: Record<string, unknown> = {}; // Good
```

### Function Declarations
```typescript
// ✅ Use async/await over promises
async function createContainer(userId: string): Promise<ContainerSession> {
  // Implementation
}

// ✅ Proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error(`Failed to complete operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

### Import/Export Style
```typescript
// ✅ Named imports for utilities
import { Router, Request, Response } from 'express';

// ✅ Default import for main modules
import express from 'express';

// ✅ Type-only imports when possible
import type { ContainerSession } from '../types/index.js';

// ✅ Use .js extensions for ES modules
import { containerManager } from '../lib/containerManager.js';
```

## Express.js Patterns

### Route Handlers
```typescript
// ✅ Consistent error response format
router.get('/endpoint', async (req: Request, res: Response) => {
  try {
    const result = await operation();
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});
```

### Middleware Patterns
```typescript
// ✅ Proper middleware typing
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Validation logic
  next();
};

// ✅ Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    status: 'error',
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    }
  });
};
```

## Security Coding Standards

### Input Validation
```typescript
// ✅ Always validate inputs
const { command, cwd }: TerminalCommand = req.body;

if (!command || typeof command !== 'string') {
  return res.status(400).json({
    status: 'error',
    error: {
      code: ErrorCode.INVALID_REQUEST,
      message: 'Command is required'
    }
  });
}

// ✅ Sanitize dangerous operations
if (!isCommandSafe(command)) {
  return res.status(400).json({
    status: 'error',
    error: {
      code: ErrorCode.PERMISSION_DENIED,
      message: 'Command not allowed'
    }
  });
}
```

### Environment Variables
```typescript
// ✅ Validate required environment variables at startup
const requiredEnvVars = ['WEBCONTAINER_API_KEY', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}
```

## Naming Conventions

### Variables and Functions
- Use `camelCase` for variables and functions
- Use descriptive names that explain purpose
- Prefix boolean variables with `is`, `has`, `can`, `should`

```typescript
// ✅ Good naming
const isContainerReady = true;
const hasPermission = checkUserPermission(userId);
const containerManager = new ContainerManager();

// ❌ Poor naming
const flag = true;
const perm = checkUserPermission(userId);
const cm = new ContainerManager();
```

### Classes and Interfaces
- Use `PascalCase` for classes and interfaces
- Interfaces should be descriptive of their purpose
- Avoid prefixing interfaces with 'I'

```typescript
// ✅ Good naming
interface ContainerSession {
  id: string;
  userId: string;
}

class ContainerManager {
  // Implementation
}

// ❌ Poor naming
interface IContainer {
  id: string;
}
```

### Constants and Enums
- Use `UPPER_SNAKE_CASE` for constants
- Use `PascalCase` for enum names, `UPPER_SNAKE_CASE` for values

```typescript
// ✅ Good naming
const MAX_CONTAINER_TIMEOUT = 30 * 60 * 1000;

enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND'
}
```

## File Organization

### Directory Structure
```
src/
├── api/           # Route handlers
├── lib/           # Utility classes and functions  
├── middleware/    # Express middleware
├── types/         # TypeScript type definitions
├── utils/         # Helper functions
└── server.ts      # Main server entry point
```

### File Naming
- Use `kebab-case` for file names
- Use descriptive names that indicate file purpose
- Add appropriate suffixes (`.router.ts`, `.middleware.ts`, `.types.ts`)

## Comments and Documentation

### Code Comments
```typescript
// ✅ Explain WHY, not WHAT
// Container pooling improves startup time by pre-initializing instances
const containerPool = new ContainerPool(5);

// ✅ Document complex algorithms
/**
 * Implements exponential backoff for container initialization retries.
 * Starts with 100ms delay, doubles each retry up to 5 attempts.
 */
async function retryWithBackoff<T>(operation: () => Promise<T>): Promise<T> {
  // Implementation
}
```

### JSDoc for Public APIs
```typescript
/**
 * Creates a new WebContainer session for the specified user.
 * 
 * @param userId - Unique identifier for the user
 * @returns Promise resolving to the created container session
 * @throws {Error} When container limit is reached or initialization fails
 */
async function createSession(userId: string): Promise<ContainerSession> {
  // Implementation
}
```

## Error Handling Standards

### Error Classification
```typescript
// ✅ Use specific error codes
enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  AUTH_FAILED = 'AUTH_FAILED',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  EXECUTION_ERROR = 'EXECUTION_ERROR'
}

// ✅ Consistent error response format
interface ErrorResponse {
  status: 'error';
  error: {
    code: ErrorCode;
    message: string;
  };
}
```

### Logging Standards
```typescript
// ✅ Structured logging with context
console.log(`📦 Created container session: ${sessionId} for user: ${userId}`);
console.error('Failed to create container session:', error);

// ✅ Include operation context in logs
console.log(`🔧 WebContainer integration: ${process.env.WEBCONTAINER_API_KEY ? 'Enabled' : 'Disabled'}`);
```

## Testing Standards

### Test File Naming
- Test files should end with `.test.ts` or `.spec.ts`
- Place tests adjacent to source files or in `__tests__` directories

### Test Structure
```typescript
describe('ContainerManager', () => {
  describe('createSession', () => {
    it('should create a new container session for valid user', async () => {
      // Arrange
      const userId = 'test-user-123';
      
      // Act
      const session = await containerManager.createSession(userId);
      
      // Assert
      expect(session.userId).toBe(userId);
      expect(session.id).toBeDefined();
    });
  });
});
```

## Performance Guidelines

### Async Operations
- Always use `async/await` over callbacks or raw promises
- Implement proper timeout handling for external API calls
- Use connection pooling for database/Redis connections

### Memory Management
- Clean up event listeners and timers
- Implement proper session cleanup
- Monitor memory usage in production

### Caching Strategy
- Cache frequently accessed data in Redis
- Implement proper cache invalidation
- Use ETags for HTTP caching where appropriate

## Railway Platform Specifics

### Environment Configuration
```typescript
// ✅ Railway-compliant port binding
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${port}`);
});

// ✅ Use Railway reference variables for service communication
const serviceUrl = process.env.RAILWAY_ENVIRONMENT 
  ? `http://${{webcontainer.RAILWAY_PRIVATE_DOMAIN}}:${{webcontainer.PORT}}/api/v1`
  : 'http://localhost:3000/api/v1';
```

This code style guide ensures consistency, maintainability, and security across the MCP server codebase while optimizing for the Railway deployment platform.