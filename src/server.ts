import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Import route handlers
import { authRouter } from './api/auth.js';
import { containersRouter } from './api/containers.js';
import { filesRouter } from './api/files.js';
import { terminalRouter } from './api/terminal.js';
import { gitRouter } from './api/git.js';
import { healthRouter } from './api/health.js';

// Import middleware
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Import container manager
import { containerManager } from './lib/containerManager.js';

// Load environment variables
dotenv.config();

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
  : [];

// Never allow '*' in production
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS must be set in production');
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'self'", "https://chat.openai.com"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

// Health check endpoint (no auth required)
app.use('/health', healthRouter);

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/containers', authMiddleware, containersRouter);
app.use('/api/v1/files', authMiddleware, filesRouter);
app.use('/api/v1/terminal', authMiddleware, terminalRouter);
app.use('/api/v1/git', authMiddleware, gitRouter);

// MCP capabilities endpoint
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
  
  console.log('✅ Graceful shutdown complete');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server - Railway compliance with 0.0.0.0 binding
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ MCP Server running on 0.0.0.0:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 WebContainer integration: ${process.env.WEBCONTAINER_API_KEY ? 'Enabled' : 'Disabled'}`);
});

export { app, io };