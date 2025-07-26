import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

// Import route handlers
import { authRouter } from './api/auth.js';
import { containersRouter } from './api/containers.js';
import { filesRouter } from './api/files.js';
import { terminalRouter } from './api/terminal.js';
import { gitRouter } from './api/git.js';
import { healthRouter } from './api/health.js';
import { computerUseRouter } from './api/computer-use.js';
import { ragRouter } from './api/rag.js';

// Import middleware
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Import container manager, browser automation, and Redis session manager
import { containerManager } from './lib/containerManager.js';
import { browserAutomationManager } from './lib/browserAutomation.js';
import { redisSessionManager } from './lib/redisSession.js';
import { specs } from './lib/openapi.js';

// Load environment variables
dotenv.config();

// Data directory configuration
const DATA_DIR = process.env.DATA_DIR || 'app/data';
const dataPath = path.resolve(DATA_DIR);

// Ensure data directory exists
const ensureDataDirectory = async () => {
  try {
    await fs.access(dataPath);
    console.log(`✅ Data directory exists: ${dataPath}`);
  } catch {
    try {
      await fs.mkdir(dataPath, { recursive: true });
      console.log(`📁 Created data directory: ${dataPath}`);
    } catch (error) {
      console.error(`❌ Failed to create data directory ${dataPath}:`, error);
      process.exit(1);
    }
  }
};

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Validate required environment variables
const requiredEnvVars = ['WEBCONTAINER_API_KEY', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// CORS Configuration - Railway compliance
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['https://chat.openai.com', 'https://chatgpt.com'];

// Never allow '*' in production
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS must be set in production');
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'self'", "https://chat.openai.com", "https://chatgpt.com"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Root discovery endpoint
/**
 * @swagger
 * /:
 *   get:
 *     tags: [Discovery]
 *     summary: Service discovery endpoint
 *     description: Returns basic service information and available endpoints for ChatGPT integration
 *     responses:
 *       200:
 *         description: Service information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                   example: disco
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 name:
 *                   type: string
 *                   example: "Disco MCP Server"
 *                 description:
 *                   type: string
 *                   example: "MCP (Model Control Plane) server with WebContainer integration for ChatGPT"
 *                 docs:
 *                   type: string
 *                   example: "/docs"
 *                 openapi:
 *                   type: string
 *                   example: "/openapi.json"
 *                 config:
 *                   type: string
 *                   example: "/config"
 *                 capabilities:
 *                   type: string
 *                   example: "/capabilities"
 *                 health:
 *                   type: string
 *                   example: "/health"
 *                 environment:
 *                   type: string
 *                   example: "production"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/', (_req, res) => {
  res.json({
    service: 'disco',
    version: '1.0.0',
    name: 'Disco MCP Server',
    description: 'MCP (Model Control Plane) server with WebContainer integration for ChatGPT',
    docs: '/docs',
    openapi: '/openapi.json',
    config: '/config',
    capabilities: '/capabilities',
    health: '/health',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// OpenAPI documentation endpoints
app.get('/openapi.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Disco MCP Server API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Configuration endpoint for ChatGPT integration
app.get('/config', (_req, res) => {
  const websocketUrl = process.env.WEBSOCKET_URL || 
    (process.env.NODE_ENV === 'production' 
      ? `wss://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}/socket.io`
      : 'ws://localhost:3000/socket.io');
  
  res.json({
    websocket: websocketUrl,
    api_url: process.env.NODE_ENV === 'production' 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}/api/v1`
      : 'http://localhost:3000/api/v1',
    auth_required: true,
    rate_limit: {
      max: 100,
      window_ms: 60000
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// ChatGPT plugin manifest
app.get('/.well-known/ai-plugin.json', (_req, res) => {
  const domain = process.env.NODE_ENV === 'production' 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}`
    : 'http://localhost:3000';
    
  res.json({
    schema_version: 'v1',
    name_for_human: 'Disco Code Runner',
    name_for_model: 'disco',
    description_for_human: 'Full development environment with repository access, terminal operations, and computer use capabilities.',
    description_for_model: 'Provides complete development environment through WebContainers with file operations, git integration, terminal access, and browser automation for code development and testing.',
    auth: {
      type: 'none'
    },
    api: {
      type: 'openapi',
      url: `${domain}/openapi.json`
    },
    logo_url: `${domain}/logo.png`,
    contact_email: 'support@disco-mcp.dev',
    legal_info_url: `${domain}/legal`
  });
});

// MCP configuration endpoint
app.get('/.well-known/mcp.json', (_req, res) => {
  const domain = process.env.NODE_ENV === 'production' 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}`
    : 'http://localhost:3000';
    
  res.json({
    version: '1.0',
    name: 'WebContainer Development',
    description: 'Secure development environment with repository access',
    api_url: `${domain}/api/v1`,
    authentication: {
      type: 'bearer_token',
      header: 'Authorization'
    },
    capabilities: [
      'file:read',
      'file:write',
      'terminal:execute',
      'git:clone',
      'computer-use:screenshot'
    ],
    environment: {
      os: 'linux',
      node_version: process.version
    },
    risks: {
      data_processing: 'All code execution occurs in browser sandbox',
      security_model: 'No persistent storage between sessions'
    }
  });
});

// Health check endpoint (no auth required)
app.use('/health', healthRouter);

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/containers', authMiddleware, containersRouter);
app.use('/api/v1/files', authMiddleware, filesRouter);
app.use('/api/v1/terminal', authMiddleware, terminalRouter);
app.use('/api/v1/git', authMiddleware, gitRouter);
app.use('/api/v1/computer-use', authMiddleware, computerUseRouter);
app.use('/api/v1/rag', authMiddleware, ragRouter);

// MCP capabilities endpoint
/**
 * @swagger
 * /capabilities:
 *   get:
 *     tags: [Discovery]
 *     summary: MCP capabilities
 *     description: Returns the list of supported MCP capabilities and environment information
 *     responses:
 *       200:
 *         description: MCP capabilities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *                 capabilities:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["file:read", "file:write", "git:clone", "terminal:execute"]
 *                 environment:
 *                   type: object
 *                   properties:
 *                     os:
 *                       type: string
 *                       example: "linux"
 *                     node_version:
 *                       type: string
 *                       example: "v20.10.0"
 *                     npm_version:
 *                       type: string
 *                       example: "9.6.7"
 */
app.get('/capabilities', (_req, res) => {
  res.json({
    version: "1.0",
    capabilities: [
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
    environment: {
      os: "linux",
      node_version: process.version,
      npm_version: process.env.npm_version || "9.6.7"
    }
  });
});

// Catch-all route
app.use('*', (_req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server and Socket.IO server
const server = http.createServer(app);

// WebSocket setup with proper CORS
const io = new SocketIOServer(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io available to other modules
app.set('io', io);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🔄 Starting graceful shutdown...');
  
  // Stop accepting new connections
  server.close(() => {
    console.log('📡 HTTP server closed');
  });
  
  // Close Socket.IO connections
  io.close(() => {
    console.log('🔌 Socket.IO server closed');
  });
  
  // Cleanup container manager
  await containerManager.shutdown();
  console.log('🗃️  Container manager shutdown complete');
  
  // Cleanup browser automation manager
  await browserAutomationManager.shutdown();
  console.log('🌐 Browser automation manager shutdown complete');
  
  // Cleanup Redis session manager
  await redisSessionManager.shutdown();
  console.log('📝 Redis session manager shutdown complete');
  
  console.log('✅ Graceful shutdown complete');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server - Railway compliance with 0.0.0.0 binding
server.listen(port, '0.0.0.0', async () => {
  // Ensure data directory exists before starting
  await ensureDataDirectory();
  
  console.log(`✅ MCP Server running on 0.0.0.0:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Data directory: ${dataPath}`);
  console.log(`🔧 WebContainer integration: ${process.env.WEBCONTAINER_API_KEY ? 'Enabled' : 'Disabled'}`);
});

export { app, io, dataPath };