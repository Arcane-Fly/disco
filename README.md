# Disco - MCP Server with WebContainer Integration

MCP (Model Control Plane) server that integrates with ChatGPT through Railway deployment. The solution leverages WebContainers technology to provide a complete development environment within the browser, enabling complex coding tasks, repository interactions, and advanced tool usage directly from ChatGPT.

## 🚀 Quick Start

### Local Development

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/Arcane-Fly/disco.git
   cd disco
   corepack enable
   corepack prepare yarn@4.9.2 --activate
   yarn install
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and run:**

   ```bash
   yarn build
   yarn start
   ```

4. **Test the server:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/capabilities
   ```

### Production Testing

You can also test the live Railway deployment:

```bash
curl https://disco-mcp.up.railway.app/health
curl https://disco-mcp.up.railway.app/capabilities
```

### Railway Deployment

1. **Install Railway CLI:**

   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy to Railway:**
   ```bash
   railway login
   railway create mcp-server
   railway variables set JWT_SECRET=$(openssl rand -base64 32)
   railway variables set WEBCONTAINER_API_KEY=your-key
   railway variables set ALLOWED_ORIGINS="https://chat.openai.com"
   railway add redis
   railway up
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📋 Features

- ✅ **Railway-compliant deployment** with proper port binding and environment handling
- ✅ **WebContainer integration** with pooling and auto-cleanup
- ✅ **JWT authentication** with token refresh and validation
- ✅ **Complete REST API** for all MCP operations
- ✅ **File system operations** with security validation
- ✅ **Terminal operations** with streaming support
- ✅ **Git integration** for repository operations
- ✅ **Real-time collaboration** with multi-user editing and WebSocket sync
- ✅ **Health monitoring** with metrics and probes
- ✅ **Background worker** for maintenance tasks

## 🏗️ Architecture

The MCP server provides a bridge between ChatGPT and WebContainer instances:

```
ChatGPT → Railway-hosted MCP Server → WebContainer Instance (Browser)
```

### Key Components

- **Server** (`src/server.ts`): Main Express application
- **Container Manager** (`src/lib/containerManager.ts`): WebContainer lifecycle management
- **API Routes** (`src/api/`): RESTful endpoints for all operations
- **Worker** (`src/worker.ts`): Background tasks and cleanup
- **Middleware** (`src/middleware/`): Authentication, logging, error handling

## 🔧 API Documentation

The server provides a comprehensive REST API for:

- **Authentication**: JWT-based user authentication
- **Container Management**: Create, list, terminate containers
- **File Operations**: CRUD operations on files within containers
- **Terminal Operations**: Execute commands with streaming support
- **Git Operations**: Clone, commit, push, pull repositories
- **Health Checks**: Monitoring and diagnostics
- **Contract Demo**: JSON Schema validated MCP operations

See [API.md](./API.md) for complete API documentation.

### 🛠️ MCP Tools for AI Clients

The server exposes **10 high-level development operation tools** to AI clients via the Model Context Protocol (MCP):

1. **file_read** - Read file contents with encoding detection
2. **file_write** - Write files with atomic operations
3. **file_search** - Search for files and content with advanced filtering
4. **terminal_execute** - Execute commands with streaming output
5. **git_clone** - Clone repositories with authentication support
6. **git_commit** - Create Git commits with files and messages
7. **computer_use_screenshot** - Take screenshots using browser automation
8. **computer_use_click** - Perform click actions on web elements
9. **ai_complete** - Request AI completions from connected language models
10. **code_analyze** - Analyze code structure, dependencies, and quality metrics

These tools are abstracted as high-level development operations rather than generic utilities, providing AI clients (ChatGPT, Claude, etc.) with powerful capabilities for code development, testing, and automation without requiring direct knowledge of WebContainer internals.

Access via MCP protocol:
- **Endpoint**: `https://disco-mcp.up.railway.app/mcp`
- **Protocol**: JSON-RPC 2.0 over HTTP/SSE
- **Methods**: `tools/list`, `tools/call`
- **Authentication**: Bearer token (JWT)

### 📜 MCP Contracts

The server includes JSON Schema contracts for all MCP operations, providing:

- ✅ **Type-safe validation** for requests and responses
- ✅ **Standardized error codes** across all operations
- ✅ **Self-documenting APIs** with examples
- ✅ **Contract testing** to ensure compatibility

Supported MCP services:
- **Pinecone** (vector database): `upsert`, `query`
- **Supabase** (database): `sql`
- **Browserbase** (browser automation): `navigate`
- **GitHub** (API operations): `searchIssues`

See [contracts/README.md](./contracts/README.md) for detailed contract documentation.

Demo endpoints with validation:
```bash
# Validate and execute Pinecone upsert
curl -X POST https://disco-mcp.up.railway.app/api/v1/contract-demo/pinecone/upsert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"namespace":"default","vectors":[{"id":"vec1","values":[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8]}]}'

# Get contract schema
curl https://disco-mcp.up.railway.app/api/v1/contract-demo/pinecone/upsert/request

# List all available contracts
curl https://disco-mcp.up.railway.app/api/v1/contract-demo/contracts
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configurable origin restrictions
- **Rate Limiting**: 100 requests/minute per user
- **Input Validation**: All inputs validated for security
- **Container Isolation**: Each user gets isolated environments
- **Command Filtering**: Dangerous commands blocked

## 📊 Monitoring & Validation

### Railway Configuration Validation

The project includes a comprehensive Railway Configuration Validation Agent that automatically checks:

- **Railway Configuration**: Validates `railpack.json`, deployment settings, and build configuration
- **Environment Variables**: Ensures all required variables are documented and properly configured
- **Authentication & Security**: Validates GitHub OAuth setup, CORS configuration, and security headers
- **Domain Configuration**: Confirms callback URLs and allowed origins for production deployment

#### Running Validation Locally

```bash
# Run all validations
npm run railway:check-all

# Individual validation checks
npm run railway:validate        # Railway configuration
npm run railway:validate-env    # Environment variables
npm run railway:validate-auth   # Authentication & CORS

# Generate comprehensive report
npm run railway:report
```

#### Automated Validation

- **GitHub Actions**: Validation runs automatically on pushes and pull requests
- **CI/CD Integration**: Deployment blocked if critical validation errors are found
- **PR Comments**: Validation results automatically posted to pull requests

### Health Endpoints

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /health/metrics` - Detailed metrics

### Documentation Health

- **Link Validation**: All documentation links automatically checked weekly
- **Broken Link Reports**: GitHub Actions generate reports for broken links
- **Documentation Registry**: Centralized link management in `docs/references/`

### Logging

The server provides comprehensive logging for:

- Request/response cycles
- Container operations
- Authentication events
- Error conditions

## 🔄 Background Tasks

The worker process handles:

- Container cleanup (inactive containers)
- Pool pre-warming (faster startup)
- Memory monitoring
- Health checks

## ⚠️ Important Notes

### WebContainer Limitations

WebContainer is designed to run in browser environments. The server provides the API interface, but actual WebContainer instances run client-side. The server includes mock implementations for development and testing.

### Production Deployment

For production use:

1. **Set strong JWT secrets**
2. **Configure proper CORS origins**
3. **Set up Redis for session management**
4. **Configure monitoring and alerts**
5. **Review security settings**

## 📝 Environment Variables

| Variable               | Required | Description                     |
| ---------------------- | -------- | ------------------------------- |
| `JWT_SECRET`           | Yes      | Secret for JWT token signing    |
| `WEBCONTAINER_API_KEY` | Yes      | StackBlitz WebContainer API key |
| `ALLOWED_ORIGINS`      | Yes      | Comma-separated allowed origins |
| `REDIS_URL`            | No       | Redis connection string         |
| `GITHUB_CLIENT_ID`     | No       | GitHub OAuth client ID          |
| `GITHUB_CLIENT_SECRET` | No       | GitHub OAuth client secret      |

## 🧪 Testing

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build project
npm run build
```

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [API.md](./API.md) - API documentation
- [PRD.md](./docs/prd.md) - Product requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the deployment guide
2. Review API documentation
3. Check server logs
4. Test health endpoints
5. Open an issue on GitHub

---

Built with ❤️ for seamless ChatGPT integration with WebContainers.
