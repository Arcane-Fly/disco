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
const requiredEnvVars = ['JWT_SECRET'];
// WebContainer API key is only required in browser environments where containers are supported
const optionalEnvVars = ['WEBCONTAINER_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Log optional environment variables status
for (const envVar of optionalEnvVars) {
  if (!process.env[envVar]) {
    console.log(`⚠️  Optional environment variable not set: ${envVar} (WebContainer features will be disabled)`);
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

// Root discovery endpoint with web interface
/**
 * @swagger
 * /:
 *   get:
 *     tags: [Discovery]
 *     summary: Service discovery endpoint
 *     description: Returns basic service information and available endpoints for ChatGPT integration. Also serves a web interface for human users.
 *     parameters:
 *       - in: header
 *         name: Accept
 *         schema:
 *           type: string
 *         description: Accept header determines response format (application/json for API, text/html for web interface)
 *     responses:
 *       200:
 *         description: Service information (JSON) or web interface (HTML)
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
 *           text/html:
 *             schema:
 *               type: string
 *               description: HTML web interface
 */
app.get('/', (req, res) => {
  const serviceInfo = {
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
  };

  // Return JSON for API clients or explicit JSON requests
  if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
    return res.json(serviceInfo);
  }

  // Return web interface for browser requests
  const domain = process.env.NODE_ENV === 'production' 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}`
    : 'http://localhost:3000';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Disco MCP Server</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f8fafc;
            color: #334155;
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .status { 
            display: inline-block;
            padding: 4px 12px;
            background: #10b981;
            color: white;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .auth-section {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .auth-section.authenticated {
            background: #d1fae5;
            border-color: #10b981;
        }
        .login-btn, .logout-btn {
            display: inline-block;
            padding: 12px 24px;
            background: #1f2937;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 8px;
            border: none;
            cursor: pointer;
        }
        .login-btn:hover { background: #374151; }
        .logout-btn { background: #dc2626; }
        .logout-btn:hover { background: #b91c1c; }
        .user-info {
            background: white;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            display: none;
        }
        .platform-urls {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        .platform-url {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 6px;
            margin: 12px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: monospace;
            font-size: 0.875rem;
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px;
            margin-bottom: 40px;
        }
        .card { 
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-2px); }
        .card h3 { 
            margin: 0 0 12px 0;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .card p { margin: 0 0 16px 0; color: #64748b; }
        .card a { 
            display: inline-block;
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .card a:hover { background: #2563eb; }
        .mcp-section {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
            position: relative;
        }
        .copy-btn {
            background: #64748b;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            cursor: pointer;
            position: absolute;
            top: 8px;
            right: 8px;
        }
        .copy-btn:hover { background: #475569; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #64748b;
            font-size: 0.875rem;
        }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎵 Disco MCP Server</h1>
        <p>Model Control Plane server with WebContainer integration</p>
        <div class="status">Running - ${serviceInfo.environment}</div>
    </div>

    <div class="auth-section" id="auth-section">
        <div id="login-section">
            <h3>🔐 Authentication Required</h3>
            <p>Login with GitHub to get your personalized configuration URLs and tokens</p>
            <a href="/api/v1/auth/github?redirect_to=${encodeURIComponent('/')}" class="login-btn">
                Login with GitHub
            </a>
        </div>
        <div id="authenticated-section" class="hidden">
            <h3>✅ Authenticated</h3>
            <div class="user-info" id="user-info"></div>
            <button onclick="logout()" class="logout-btn">Logout</button>
        </div>
    </div>

    <div class="platform-urls">
        <h3>🌐 Platform Integration URLs</h3>
        <p>Copy these URLs directly into ChatGPT Custom GPTs, Claude Projects, or other AI platforms:</p>
        
        <div>
            <strong>ChatGPT Custom GPT Actions URL:</strong>
            <div class="platform-url">
                <span>${domain}/openapi.json</span>
                <button class="copy-btn" onclick="copyText('${domain}/openapi.json')">Copy</button>
            </div>
        </div>

        <div>
            <strong>Claude/Anthropic API Base URL:</strong>
            <div class="platform-url">
                <span>${domain}/api/v1</span>
                <button class="copy-btn" onclick="copyText('${domain}/api/v1')">Copy</button>
            </div>
        </div>

        <div>
            <strong>MCP JSON-RPC Endpoint:</strong>
            <div class="platform-url">
                <span>${domain}/mcp</span>
                <button class="copy-btn" onclick="copyText('${domain}/mcp')">Copy</button>
            </div>
        </div>

        <div>
            <strong>Authentication Endpoint:</strong>
            <div class="platform-url" id="auth-endpoint">
                <span>${domain}/api/v1/auth/github</span>
                <button class="copy-btn" onclick="copyText('${domain}/api/v1/auth/github')">Copy</button>
            </div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h3>📚 API Documentation</h3>
            <p>Interactive Swagger UI documentation for all API endpoints</p>
            <a href="/docs" target="_blank">Open API Docs</a>
        </div>

        <div class="card">
            <h3>🔧 Service Configuration</h3>
            <p>Runtime configuration and capabilities for integration</p>
            <a href="/config?format=json" target="_blank">View Config</a>
        </div>

        <div class="card">
            <h3>💚 Health Status</h3>
            <p>Real-time service health and system metrics</p>
            <a href="/health" target="_blank">Check Health</a>
        </div>

        <div class="card">
            <h3>⚡ Capabilities</h3>
            <p>Available MCP capabilities and supported operations</p>
            <a href="/capabilities" target="_blank">View Capabilities</a>
        </div>
    </div>

    <div class="mcp-section">
        <h3>🔗 MCP Client Configuration</h3>
        <p id="config-description">Login with GitHub to get your personalized configuration with authentication tokens:</p>
        
        <div id="authenticated-configs" class="hidden">
            <h4>For Warp Terminal:</h4>
            <div class="code-block">
                <button class="copy-btn" onclick="copyToClipboard('warp-config')">Copy</button>
                <pre id="warp-config">{
  "servers": {
    "disco": {
      "url": "${domain}/mcp",
      "transport": "http",
      "auth": {
        "type": "bearer",
        "token": "YOUR_JWT_TOKEN_HERE"
      }
    }
  }
}</pre>
            </div>

            <h4>For VSCode/IDE MCP Extension:</h4>
            <div class="code-block">
                <button class="copy-btn" onclick="copyToClipboard('vscode-config')">Copy</button>
                <pre id="vscode-config">{
  "mcpServers": {
    "disco": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "-H", "Authorization: Bearer YOUR_JWT_TOKEN_HERE",
        "-d", "@-",
        "${domain}/mcp"
      ]
    }
  }
}</pre>
            </div>

            <h4>Environment Variables:</h4>
            <div class="code-block">
                <button class="copy-btn" onclick="copyToClipboard('env-vars')">Copy</button>
                <pre id="env-vars"># Add to your shell profile
export DISCO_MCP_URL="${domain}"
export DISCO_MCP_TOKEN="YOUR_JWT_TOKEN_HERE"
export DISCO_API_BASE="${domain}/api/v1"</pre>
            </div>
        </div>

        <div id="unauthenticated-configs">
            <h4>Sample Configuration (Login Required for Tokens):</h4>
            <div class="code-block">
                <button class="copy-btn" onclick="copyToClipboard('sample-config')">Copy</button>
                <pre id="sample-config">{
  "servers": {
    "disco": {
      "url": "${domain}/mcp",
      "transport": "http",
      "auth": {
        "type": "bearer",
        "token": "Login with GitHub to get your token"
      }
    }
  }
}</pre>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Built with ❤️ for seamless ChatGPT and Claude integration</p>
        <p>Version ${serviceInfo.version} • ${serviceInfo.timestamp}</p>
    </div>

    <script>
        let currentToken = null;
        let currentUser = null;

        // Check for authentication token in URL fragment
        function checkAuth() {
            const hash = window.location.hash;
            if (hash.includes('token=')) {
                const params = new URLSearchParams(hash.substring(1));
                currentToken = params.get('token');
                currentUser = params.get('user');
                
                if (currentToken) {
                    localStorage.setItem('disco_token', currentToken);
                    localStorage.setItem('disco_user', currentUser || '');
                    window.location.hash = ''; // Clear URL
                }
            } else {
                // Check localStorage
                currentToken = localStorage.getItem('disco_token');
                currentUser = localStorage.getItem('disco_user');
            }

            updateUI();
        }

        function updateUI() {
            const authSection = document.getElementById('auth-section');
            const loginSection = document.getElementById('login-section');
            const authenticatedSection = document.getElementById('authenticated-section');
            const userInfo = document.getElementById('user-info');
            const authenticatedConfigs = document.getElementById('authenticated-configs');
            const unauthenticatedConfigs = document.getElementById('unauthenticated-configs');

            if (currentToken) {
                // Update auth section
                authSection.classList.add('authenticated');
                loginSection.classList.add('hidden');
                authenticatedSection.classList.remove('hidden');
                
                // Show user info
                userInfo.innerHTML = \`<strong>Logged in as:</strong> \${currentUser || 'Unknown'}\`;
                userInfo.style.display = 'block';

                // Show authenticated configs
                authenticatedConfigs.classList.remove('hidden');
                unauthenticatedConfigs.classList.add('hidden');

                // Update token placeholders
                updateTokenPlaceholders();
            } else {
                // Show login UI
                authSection.classList.remove('authenticated');
                loginSection.classList.remove('hidden');
                authenticatedSection.classList.add('hidden');
                authenticatedConfigs.classList.add('hidden');
                unauthenticatedConfigs.classList.remove('hidden');
            }
        }

        function updateTokenPlaceholders() {
            if (!currentToken) return;

            const elements = ['warp-config', 'vscode-config', 'env-vars'];
            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = element.textContent.replace(/YOUR_JWT_TOKEN_HERE/g, currentToken);
                }
            });
        }

        function logout() {
            localStorage.removeItem('disco_token');
            localStorage.removeItem('disco_user');
            currentToken = null;
            currentUser = null;
            updateUI();
        }

        function copyToClipboard(elementId) {
            const element = document.getElementById(elementId);
            const text = element.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = element.parentElement.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = originalText; }, 2000);
            });
        }

        function copyText(text) {
            navigator.clipboard.writeText(text).then(() => {
                // Find the button that was clicked and update it
                event.target.textContent = 'Copied!';
                setTimeout(() => { event.target.textContent = 'Copy'; }, 2000);
            });
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', checkAuth);
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
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

// MCP transport endpoint for stdio/http bridge
/**
 * @swagger
 * /mcp:
 *   post:
 *     tags: [MCP]
 *     summary: MCP JSON-RPC transport endpoint
 *     description: HTTP transport layer for MCP JSON-RPC protocol, allowing remote MCP clients to connect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jsonrpc:
 *                 type: string
 *                 example: "2.0"
 *               id:
 *                 type: number
 *                 example: 1
 *               method:
 *                 type: string
 *                 example: "initialize"
 *               params:
 *                 type: object
 *     responses:
 *       200:
 *         description: MCP JSON-RPC response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jsonrpc:
 *                   type: string
 *                   example: "2.0"
 *                 id:
 *                   type: number
 *                   example: 1
 *                 result:
 *                   type: object
 */
app.post('/mcp', express.json(), (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;

    // Validate JSON-RPC format
    if (jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || null,
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: 'jsonrpc must be "2.0"'
        }
      });
    }

    // Handle MCP protocol methods
    switch (method) {
      case 'initialize':
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {
                listChanged: true
              },
              resources: {
                subscribe: true,
                listChanged: true
              },
              prompts: {
                listChanged: true
              },
              logging: {}
            },
            serverInfo: {
              name: 'Disco MCP Server',
              version: '1.0.0'
            }
          }
        });

      case 'tools/list':
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'file_read',
                description: 'Read file contents from WebContainer',
                inputSchema: {
                  type: 'object',
                  properties: {
                    path: { type: 'string', description: 'File path to read' }
                  },
                  required: ['path']
                }
              },
              {
                name: 'file_write',
                description: 'Write content to file in WebContainer',
                inputSchema: {
                  type: 'object',
                  properties: {
                    path: { type: 'string', description: 'File path to write' },
                    content: { type: 'string', description: 'Content to write' }
                  },
                  required: ['path', 'content']
                }
              },
              {
                name: 'terminal_execute',
                description: 'Execute command in WebContainer terminal',
                inputSchema: {
                  type: 'object',
                  properties: {
                    command: { type: 'string', description: 'Command to execute' }
                  },
                  required: ['command']
                }
              },
              {
                name: 'git_clone',
                description: 'Clone repository in WebContainer',
                inputSchema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', description: 'Repository URL' },
                    path: { type: 'string', description: 'Target path' }
                  },
                  required: ['url']
                }
              }
            ]
          }
        });

      case 'tools/call':
        // For tool calls, we need authentication
        if (!req.headers.authorization) {
          return res.status(401).json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32001,
              message: 'Authentication required',
              data: 'Bearer token required for tool calls'
            }
          });
        }

        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: 'Tool call received. Use the REST API endpoints directly for full functionality.'
              }
            ]
          }
        });

      default:
        return res.status(400).json({
          jsonrpc: '2.0',
          id: id || null,
          error: {
            code: -32601,
            message: 'Method not found',
            data: `Unknown method: ${method}`
          }
        });
    }
  } catch (error) {
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Health check endpoint (no auth required)
app.use('/health', healthRouter);

// MCP client configuration guide
/**
 * @swagger
 * /mcp-setup:
 *   get:
 *     tags: [Discovery]
 *     summary: MCP client setup guide
 *     description: Provides detailed instructions for configuring MCP clients to connect to this server
 *     responses:
 *       200:
 *         description: Configuration guide and examples
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 server_url:
 *                   type: string
 *                 transport_options:
 *                   type: object
 *                 configuration_examples:
 *                   type: object
 */
app.get('/mcp-setup', (_req, res) => {
  const domain = process.env.NODE_ENV === 'production' 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'disco-mcp.up.railway.app'}`
    : 'http://localhost:3000';

  res.json({
    server_info: {
      name: 'Disco MCP Server',
      url: domain,
      version: '1.0.0',
      protocol_version: '2024-11-05'
    },
    transport_options: {
      http: {
        url: `${domain}/mcp`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer <your-jwt-token>'
        }
      },
      websocket: {
        url: `${domain.replace('https://', 'wss://').replace('http://', 'ws://')}/socket.io`,
        protocol: 'socket.io'
      }
    },
    configuration_examples: {
      warp_terminal: {
        file_location: '~/.local/state/warp-terminal/mcp/servers.json',
        config: {
          servers: {
            disco: {
              url: `${domain}/mcp`,
              transport: 'http',
              auth: {
                type: 'bearer',
                endpoint: `${domain}/api/v1/auth/github`
              }
            }
          }
        }
      },
      mcp_client_json: {
        file_location: '~/.config/mcp/servers.json',
        config: {
          mcpServers: {
            disco: {
              command: 'curl',
              args: [
                '-X', 'POST',
                '-H', 'Content-Type: application/json',
                '-H', 'Authorization: Bearer ${DISCO_MCP_TOKEN}',
                '-d', '@-',
                `${domain}/mcp`
              ],
              env: {
                DISCO_MCP_TOKEN: '<your-jwt-token>'
              }
            }
          }
        }
      },
      local_development: {
        steps: [
          'git clone https://github.com/Arcane-Fly/disco.git',
          'cd disco',
          'npm install',
          'npm run build',
          'npm start'
        ],
        config: {
          servers: {
            disco: {
              command: 'node',
              args: ['/path/to/disco/dist/server.js'],
              env: {
                PORT: '3000',
                NODE_ENV: 'development'
              }
            }
          }
        }
      }
    },
    authentication: {
      description: 'Authentication via GitHub OAuth or API key',
      github_oauth_endpoint: `${domain}/api/v1/auth/github`,
      legacy_login_endpoint: `${domain}/api/v1/auth/login`,
      oauth_example: {
        description: 'Login with GitHub OAuth',
        url: `${domain}/api/v1/auth/github`,
        method: 'GET',
        response: 'Redirects to GitHub OAuth, returns with JWT token'
      },
      api_key_example: {
        method: 'POST',
        url: `${domain}/api/v1/auth/login`,
        body: {
          apiKey: 'your-api-key'
        },
        response: {
          token: 'jwt-token-here',
          expires: 1640995200000
        }
      }
    },
    troubleshooting: {
      common_issues: [
        {
          issue: 'MODULE_NOT_FOUND error with placeholder path',
          solution: 'Replace /home/braden/path/to/disco/server with actual server URL or local path',
          fix: `Update your MCP client configuration to use: ${domain}/mcp`
        },
        {
          issue: 'Connection refused',
          solution: 'Ensure server is running and accessible',
          fix: `Test with: curl ${domain}/health`
        },
        {
          issue: 'Authentication failed',
          solution: 'Use GitHub OAuth or obtain valid API key',
          fix: `Visit ${domain}/api/v1/auth/github for OAuth or POST to ${domain}/api/v1/auth/login with API key`
        }
      ]
    }
  });
});

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