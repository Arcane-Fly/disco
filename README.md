# Disco - MCP Server with WebContainer Integration

MCP (Model Control Plane) server that integrates with ChatGPT through Railway deployment. The solution leverages WebContainers technology to provide a complete development environment within the browser, enabling complex coding tasks, repository interactions, and advanced tool usage directly from ChatGPT.

## 🚀 Quick Start

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd disco
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and run:**
   ```bash
   npm run build
   npm start
   ```

4. **Test the server:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/capabilities
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

See [API.md](./API.md) for complete API documentation.

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configurable origin restrictions
- **Rate Limiting**: 100 requests/minute per user
- **Input Validation**: All inputs validated for security
- **Container Isolation**: Each user gets isolated environments
- **Command Filtering**: Dangerous commands blocked

## 📊 Monitoring

### Health Endpoints

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /health/metrics` - Detailed metrics

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

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `WEBCONTAINER_API_KEY` | Yes | StackBlitz WebContainer API key |
| `ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins |
| `REDIS_URL` | No | Redis connection string |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |

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
- [PRD.md](./prd.md) - Product requirements

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
