# Task Execution Instructions for AI Agent

## Overview
This document provides comprehensive instructions for AI agents to execute development tasks efficiently and effectively. Follow these guidelines when building, shipping, and maintaining software features.

## Pre-Execution Preparation

### 1. Environment Setup Verification

**Development Environment Checklist**
- [ ] Node.js 20+ installed and configured
- [ ] TypeScript compiler available
- [ ] Required dependencies installed (npm install)
- [ ] Environment variables configured (.env file)
- [ ] Database connections tested (Redis, WebContainer API)
- [ ] Git repository properly initialized

**Railway Environment Setup**
```bash
# Verify Railway CLI installation
railway --version

# Login to Railway
railway login

# Link to project
railway link --project <project-id>

# Verify environment variables
railway variables
```

### 2. Task Analysis and Planning

**Task Breakdown Process**
1. **Understand Requirements**: Read specification thoroughly
2. **Identify Dependencies**: List all prerequisite tasks and services
3. **Plan Implementation**: Break down into smaller, manageable steps
4. **Estimate Effort**: Assess complexity and time requirements
5. **Risk Assessment**: Identify potential blockers and mitigation strategies

**Implementation Strategy**
- Start with smallest viable implementation
- Build incrementally with frequent testing
- Implement error handling from the beginning
- Write tests alongside code development
- Document decisions and assumptions

## Development Execution Guidelines

### 1. Code Implementation Standards

**File Structure and Organization**
```
src/
├── api/              # API route handlers
│   ├── auth.ts       # Authentication endpoints
│   ├── containers.ts # Container management
│   ├── files.ts      # File operations
│   ├── git.ts        # Git operations
│   └── terminal.ts   # Terminal operations
├── lib/              # Core business logic
│   ├── containerManager.ts
│   ├── fileHandler.ts
│   └── gitOperations.ts
├── middleware/       # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── requestLogger.ts
├── types/           # TypeScript type definitions
│   └── index.ts
└── server.ts        # Main application entry point
```

**Implementation Workflow**
1. **Create Types First**: Define interfaces and types
2. **Implement Core Logic**: Business logic in lib/ directory
3. **Add API Endpoints**: Route handlers in api/ directory
4. **Add Middleware**: Cross-cutting concerns
5. **Write Tests**: Unit and integration tests
6. **Update Documentation**: API docs and comments

### 2. Security Implementation

**Authentication Flow**
```typescript
// JWT token validation middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Authorization token required'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      error: {
        code: ErrorCode.AUTH_FAILED,
        message: 'Invalid or expired token'
      }
    });
  }
};
```

**Input Validation Implementation**
```typescript
import { body, param, validationResult } from 'express-validator';

// Validation rules for file operations
export const validateFileCreate = [
  param('containerId').isAlphanumeric().isLength({ min: 1, max: 100 }),
  body('path').matches(/^[a-zA-Z0-9/._-]+$/).isLength({ min: 1, max: 1000 }),
  body('content').isString().isLength({ max: 10 * 1024 * 1024 }), // 10MB limit
];

// Validation middleware
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: ErrorCode.INVALID_REQUEST,
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};
```

### 3. Error Handling Implementation

**Centralized Error Handling**
```typescript
// Custom error classes
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Global error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      status: 'error',
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  // Default error response
  res.status(500).json({
    status: 'error',
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    }
  });
};
```

## Testing Implementation

### 1. Unit Testing Strategy

**Test Structure Template**
```typescript
import { ContainerManager } from '../lib/containerManager';
import { WebContainer } from '@webcontainer/api';

// Mock external dependencies
jest.mock('@webcontainer/api');
const MockWebContainer = WebContainer as jest.MockedClass<typeof WebContainer>;

describe('ContainerManager', () => {
  let containerManager: ContainerManager;
  let mockContainer: jest.Mocked<WebContainer>;

  beforeEach(() => {
    mockContainer = {
      spawn: jest.fn(),
      fs: {
        writeFile: jest.fn(),
        readFile: jest.fn(),
        readdir: jest.fn()
      },
      teardown: jest.fn()
    } as any;

    MockWebContainer.boot.mockResolvedValue(mockContainer);
    containerManager = new ContainerManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create new container session for valid user', async () => {
      // Arrange
      const userId = 'test-user-123';

      // Act
      const session = await containerManager.createSession(userId);

      // Assert
      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.id).toMatch(/^test-user-123-/);
      expect(MockWebContainer.boot).toHaveBeenCalledTimes(1);
    });

    it('should reject when user exceeds container limit', async () => {
      // Test container limit enforcement
    });
  });
});
```

### 2. Integration Testing

**API Integration Tests**
```typescript
import request from 'supertest';
import { app } from '../server';
import jwt from 'jsonwebtoken';

describe('Files API', () => {
  let authToken: string;
  let containerId: string;

  beforeAll(async () => {
    // Setup test database and authentication
    authToken = jwt.sign(
      { userId: 'test-user', email: 'test@example.com' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    // Create test container
    const containerResponse = await request(app)
      .post('/api/v1/containers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);
    
    containerId = containerResponse.body.data.containerId;
  });

  afterEach(async () => {
    // Cleanup test container
    await request(app)
      .delete(`/api/v1/containers/${containerId}`)
      .set('Authorization', `Bearer ${authToken}`);
  });

  describe('POST /api/v1/containers/:id/files', () => {
    it('should create file successfully', async () => {
      const fileData = {
        path: '/test/example.txt',
        content: 'Hello, World!'
      };

      const response = await request(app)
        .post(`/api/v1/containers/${containerId}/files`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(fileData)
        .expect(201);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          fileId: expect.any(String),
          size: expect.any(Number)
        }
      });
    });
  });
});
```

## Deployment and Shipping

### 1. Pre-Deployment Checklist

**Code Quality Verification**
```bash
# Lint code
npm run lint

# Type checking
npm run build

# Run tests
npm test

# Security audit
npm audit

# Check for unused dependencies
npx depcheck
```

**Environment Configuration**
- [ ] All required environment variables set
- [ ] Secrets properly configured in Railway
- [ ] Database connections tested
- [ ] External API keys validated
- [ ] CORS settings configured for production

### 2. Railway Deployment Process

**Deployment Configuration**
```toml
# railway.toml
[build]
  dockerfile = "Dockerfile"

[deploy]
  healthcheckPath = "/health"
  healthcheckTimeout = 30
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 3

[environment]
  NODE_ENV = "production"

[addons]
  redis = true
```

**Deployment Steps**
```bash
# 1. Verify local build
npm run build

# 2. Run tests locally
npm test

# 3. Deploy to Railway
railway up

# 4. Monitor deployment
railway logs --follow

# 5. Verify health check
curl https://your-app.up.railway.app/health

# 6. Test critical endpoints
curl -H "Authorization: Bearer $TOKEN" \
     https://your-app.up.railway.app/api/v1/capabilities
```

### 3. Post-Deployment Verification

**Health Check Implementation**
```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    checks: {
      server: 'healthy',
      redis: 'unknown',
      webcontainer: 'unknown',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };

  try {
    // Test Redis connection
    if (redisClient) {
      await redisClient.ping();
      health.checks.redis = 'healthy';
    }

    // Test WebContainer API
    if (process.env.WEBCONTAINER_API_KEY) {
      health.checks.webcontainer = 'configured';
    }

    res.json(health);
  } catch (error) {
    health.status = 'degraded';
    health.checks.redis = 'unhealthy';
    res.status(503).json(health);
  }
});
```

**Monitoring Setup**
```typescript
// Custom metrics for Railway
const activeContainersGauge = new Map<string, number>();

export function reportActiveContainers(count: number) {
  // Report to Railway metrics
  console.log(`METRIC active_containers ${count}`);
}

export function reportApiResponseTime(endpoint: string, duration: number) {
  console.log(`METRIC api_response_time_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')} ${duration}`);
}
```

## Performance Optimization

### 1. Code Optimization

**Database Query Optimization**
```typescript
// Use connection pooling
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectDelay: 1000,
    connectTimeout: 5000
  },
  retry_delay_on_failover: 100
});

// Implement caching
const cache = new Map<string, { data: any; expires: number }>();

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300000 // 5 minutes
): Promise<T> {
  const cached = cache.get(key);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, expires: Date.now() + ttl });
  
  return data;
}
```

**Memory Management**
```typescript
// Implement proper cleanup
export class ContainerManager {
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up inactive containers every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveContainers();
    }, 5 * 60 * 1000);
  }

  async shutdown(): Promise<void> {
    clearInterval(this.cleanupInterval);
    
    // Clean up all active containers
    const cleanupPromises = Array.from(this.sessions.values()).map(
      session => session.container.teardown()
    );
    
    await Promise.allSettled(cleanupPromises);
    this.sessions.clear();
  }

  private async cleanupInactiveContainers(): Promise<void> {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActive.getTime() > inactiveThreshold) {
        await this.terminateSession(sessionId);
      }
    }
  }
}
```

### 2. API Performance

**Response Caching**
```typescript
import compression from 'compression';

// Enable gzip compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Cache static responses
const staticCache = new Map<string, { data: any; etag: string }>();

app.get('/api/v1/capabilities', (req, res) => {
  const cacheKey = 'capabilities';
  const cached = staticCache.get(cacheKey);
  
  if (cached && req.headers['if-none-match'] === cached.etag) {
    return res.status(304).end();
  }

  const capabilities = getCapabilities();
  const etag = generateETag(capabilities);
  
  staticCache.set(cacheKey, { data: capabilities, etag });
  
  res.set('ETag', etag);
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  res.json(capabilities);
});
```

## Monitoring and Maintenance

### 1. Logging Implementation

**Structured Logging**
```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export const logger = {
  info: (message: string, metadata: Record<string, unknown> = {}) => {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    console.log(JSON.stringify(entry));
  },

  error: (message: string, error?: Error, metadata: Record<string, unknown> = {}) => {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        error: error?.message,
        stack: error?.stack
      }
    };
    console.error(JSON.stringify(entry));
  }
};
```

### 2. Error Tracking

**Error Reporting**
```typescript
// Track error patterns
const errorStats = new Map<string, number>();

export function trackError(error: Error, context: Record<string, unknown> = {}) {
  const errorKey = `${error.name}:${error.message}`;
  errorStats.set(errorKey, (errorStats.get(errorKey) || 0) + 1);

  logger.error('Application error', error, {
    context,
    errorCount: errorStats.get(errorKey)
  });

  // Alert if error occurs frequently
  if (errorStats.get(errorKey)! > 10) {
    console.log(`ALERT High error frequency: ${errorKey}`);
  }
}
```

## Documentation and Knowledge Transfer

### 1. Code Documentation

**Inline Documentation**
```typescript
/**
 * Creates a new WebContainer session for the specified user.
 * 
 * The container is initialized with a clean environment and pre-configured
 * with Node.js runtime. Session is automatically cleaned up after 30 minutes
 * of inactivity.
 * 
 * @param userId - Unique identifier for the user requesting the container
 * @returns Promise resolving to the created container session
 * @throws {ApiError} When user exceeds container limit or initialization fails
 * 
 * @example
 * ```typescript
 * const session = await containerManager.createSession('user-123');
 * console.log(`Container ready: ${session.id}`);
 * ```
 */
async createSession(userId: string): Promise<ContainerSession> {
  // Implementation
}
```

### 2. Deployment Documentation

**Operations Runbook**
```markdown
# MCP Server Operations Guide

## Deployment Process
1. Verify tests pass: `npm test`
2. Build application: `npm run build`
3. Deploy to Railway: `railway up`
4. Monitor deployment: `railway logs --follow`
5. Verify health: `curl https://app.up.railway.app/health`

## Common Issues and Solutions

### Container Creation Failures
**Symptoms**: 500 errors on POST /api/v1/containers
**Diagnosis**: Check WebContainer API key and Redis connection
**Resolution**: Verify WEBCONTAINER_API_KEY environment variable

### High Memory Usage
**Symptoms**: App restarts frequently, memory alerts
**Diagnosis**: Check container cleanup and session management
**Resolution**: Reduce CONTAINER_TIMEOUT_MINUTES or MAX_CONTAINERS

## Monitoring Dashboards
- Health Check: https://app.up.railway.app/health
- Railway Metrics: Railway dashboard > Metrics tab
- Application Logs: `railway logs --follow`
```

This comprehensive execution guide ensures consistent, high-quality implementation and deployment of features while maintaining security, performance, and reliability standards.