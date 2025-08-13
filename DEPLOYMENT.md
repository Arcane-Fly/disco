# MCP Server Deployment Guide

This guide provides step-by-step instructions for deploying the MCP Server to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install the Railway CLI
   ```bash
   npm install -g @railway/cli
   ```
3. **GitHub Account**: For repository integration
4. **WebContainer API Key**: From StackBlitz (optional for development)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd disco
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Required for production
JWT_SECRET=your-super-secret-jwt-key-here
ALLOWED_ORIGINS=https://chat.openai.com
WEBCONTAINER_API_KEY=your-webcontainer-api-key

# Optional for development
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Build and Run Locally

```bash
# Build the project
npm run build

# Start the server
npm start

# Or run in development mode
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Test the Health Check

```bash
curl http://localhost:3000/health
```

You should see a response like:
```json
{
  "status": "healthy",
  "uptime": 10,
  "containers": { "active": 0, "max": 50 }
}
```

## Railway Deployment

### 1. Login to Railway

```bash
railway login
```

### 2. Create a New Project

```bash
railway create mcp-server
```

### 3. Link to Your Repository

If deploying from GitHub:
```bash
railway link
```

### 4. Configure Environment Variables

#### Option A: Manual Variable Setup
Set the required environment variables individually:

```bash
# Core server configuration
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set WEBCONTAINER_API_KEY=your-webcontainer-api-key
railway variables set WEBCONTAINER_CLIENT_ID=your-webcontainer-client-id
railway variables set ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com"

# GitHub integration (optional)
railway variables set GITHUB_CLIENT_ID=your-github-client-id
railway variables set GITHUB_CLIENT_SECRET=your-github-client-secret
railway variables set GITHUB_TOKEN=your-github-token

# AI provider API keys (optional)
railway variables set OPENAI_API_KEY=your-openai-api-key
railway variables set ANTHROPIC_API_KEY=your-anthropic-api-key
railway variables set GEMINI_API_KEY=your-gemini-api-key
```

#### Option B: Shared Configuration Setup (Recommended)
For better variable management across multiple services, use Railway's shared configuration:

```bash
# Set up shared variables first
railway variables set --shared JWT_SECRET=$(openssl rand -base64 32)
railway variables set --shared WEBCONTAINER_API_KEY=your-webcontainer-api-key
railway variables set --shared WEBCONTAINER_CLIENT_ID=your-webcontainer-client-id
railway variables set --shared ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com"
railway variables set --shared OPENAI_API_KEY=your-openai-api-key
railway variables set --shared ANTHROPIC_API_KEY=your-anthropic-api-key
railway variables set --shared GEMINI_API_KEY=your-gemini-api-key
railway variables set --shared GITHUB_CLIENT_ID=your-github-client-id
railway variables set --shared GITHUB_CLIENT_SECRET=your-github-client-secret
railway variables set --shared GITHUB_TOKEN=your-github-token

# Then reference them in your service
railway variables set JWT_SECRET='${{shared.JWT_SECRET}}'
railway variables set WEBCONTAINER_API_KEY='${{shared.WEBCONTAINER_API_KEY}}'
railway variables set WEBCONTAINER_CLIENT_ID='${{shared.WEBCONTAINER_CLIENT_ID}}'
railway variables set ALLOWED_ORIGINS='${{shared.ALLOWED_ORIGINS}}'
railway variables set OPENAI_API_KEY='${{shared.OPENAI_API_KEY}}'
railway variables set ANTHROPIC_API_KEY='${{shared.ANTHROPIC_API_KEY}}'
railway variables set GEMINI_API_KEY='${{shared.GEMINI_API_KEY}}'
railway variables set GITHUB_CLIENT_ID='${{shared.GITHUB_CLIENT_ID}}'
railway variables set GITHUB_CLIENT_SECRET='${{shared.GITHUB_CLIENT_SECRET}}'
railway variables set GITHUB_TOKEN='${{shared.GITHUB_TOKEN}}'
```

### 5. Add Required Services

#### Postgres Database
```bash
railway add postgresql
```

This automatically sets up the following environment variables:
- `DATABASE_URL` - Primary connection string
- `DATABASE_PUBLIC_URL` - Public connection string  
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` - Connection details
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` - Database credentials

#### Redis Cache
```bash
railway add redis
```

This automatically sets up the following environment variables:
- `REDIS_HOST`, `REDISHOST` - Redis host
- `REDIS_PORT`, `REDISPORT` - Redis port
- `REDIS_USER`, `REDISUSER` - Redis username
- `REDIS_PASSWORD`, `REDISPASSWORD` - Redis password

#### Verify Add-on Configuration
After adding services, verify the variables are properly set:
```bash
# Check all environment variables
railway variables

# Test database connection
railway run -- node -e "console.log('DB URL:', process.env.DATABASE_URL)"

# Test Redis connection  
railway run -- node -e "console.log('Redis Host:', process.env.REDIS_HOST)"
```

### 6. Deploy

```bash
railway up
```

The deployment will:
1. Install dependencies using npm
2. Build the TypeScript code
3. Start the server on Railway's assigned port

### 7. Configure OAuth Callback URL (Optional)

If using GitHub OAuth integration, you need to register the callback URL:

```bash
# Get your Railway domain
RAILWAY_DOMAIN=$(railway variables get RAILWAY_PUBLIC_DOMAIN 2>/dev/null || echo "your-app.up.railway.app")

# Set the GitHub redirect URI
railway variables set GITHUB_REDIRECT_URI="https://${RAILWAY_DOMAIN}/oauth/github/callback"

# Auto-configure GitHub OAuth callback (requires GitHub CLI)
if command -v gh &> /dev/null; then
  echo "Configuring GitHub OAuth callback URL..."
  gh api -X PATCH \
    /apps/{YOUR_GITHUB_APP_ID}/callback_urls \
    -f add="https://${RAILWAY_DOMAIN}/oauth/github/callback"
else
  echo "GitHub CLI not found. Manually add callback URL to your GitHub App:"
  echo "  https://${RAILWAY_DOMAIN}/oauth/github/callback"
fi
```

### 8. Configure WebSocket URL

Set the WebSocket URL for ChatGPT integration:

```bash
# Auto-configure WebSocket URL
RAILWAY_DOMAIN=$(railway variables get RAILWAY_PUBLIC_DOMAIN 2>/dev/null || echo "your-app.up.railway.app")
railway variables set WEBSOCKET_URL="wss://${RAILWAY_DOMAIN}/socket.io"
```

### 9. Verify Deployment

Check the deployment status:
```bash
railway status
```

Get the public URL:
```bash
railway domain
```

Test the health endpoint:
```bash
curl https://your-app.up.railway.app/health
```

## Railway-Specific Configuration

### Volume Configuration for Security Persistence

The MCP Server includes a security compliance manager that logs audit trails and security events. In Railway's containerized environment, you need to configure persistent storage for these logs:

#### Option 1: Using Railway Volumes (Recommended)

1. **Attach a Railway Volume**:
   - Go to your Railway project dashboard
   - Click on your service
   - Navigate to the "Volumes" tab
   - Click "Attach Volume"
   - Set Mount Path to `/data`
   - Choose appropriate size (e.g., 1GB for audit logs)

2. **Configure Security Data Directory**:
   ```bash
   railway variables set SECURITY_DATA_DIR=/data/disco/security
   ```

#### Option 2: Using Environment Variable Configuration

Configure the security data directory to use Railway's volume mount path:

```bash
railway variables set RAILWAY_VOLUME_MOUNT_PATH=/data
```

The server will automatically resolve the security directory to `/data/disco/security`.

#### Option 3: Fallback Configuration

If no volume is attached, the server gracefully falls back to:
1. `/tmp/disco/security` (ephemeral storage in production)
2. In-memory logging only if filesystem is completely read-only

This ensures the server remains operational even without persistent storage, though audit logs won't persist between deployments.

#### Verification

After deployment with volume configuration:

```bash
# Check if security directory is properly configured
curl https://your-app.up.railway.app/api/v1/security/metrics

# Check server logs for security initialization messages
railway logs --filter "Security compliance"
```

You should see log messages like:
```
🛡️ Security compliance data directory initialized { dir: '/data/disco/security' }
```

### Favicon and Static Asset Configuration

The MCP Server includes proper favicon handling to prevent validation errors in Railway deployments:

#### Verification

Test that favicon requests return proper responses:

```bash
# Should return 200 OK with image/png content-type
curl -I https://your-app.up.railway.app/favicon.ico

# Should return 204 No Content (alternative response)
curl -I https://your-app.up.railway.app/favicon.ico
```

#### Troubleshooting

If you encounter 400 errors on favicon requests:

1. **Check Security Middleware Configuration**:
   ```bash
   railway logs --filter "INVALID_INPUT"
   ```

2. **Verify Excluded Paths**:
   The security middleware automatically excludes favicon requests. Check that this is working:
   ```bash
   railway logs --filter "favicon"
   ```

#### Custom Favicon

To serve a custom favicon instead of the default transparent PNG:

1. Add your favicon file to the `public` directory
2. Update the favicon handler in `server.ts` or add static file serving:
   ```bash
   railway variables set SERVE_STATIC_FILES=true
   ```

## Production Configuration

### Environment Variables

#### Core Server Configuration
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Railway sets this automatically |
| `NODE_ENV` | No | Set to "production" automatically |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins |
| `DATA_DIR` | No | Data directory path (default: "app/data") |
| `LOG_LEVEL` | No | Logging level (default: "info") |

#### WebContainer Integration
| Variable | Required | Description |
|----------|----------|-------------|
| `WEBCONTAINER_API_KEY` | Yes | StackBlitz WebContainer API key |
| `WEBCONTAINER_CLIENT_ID` | Yes | StackBlitz WebContainer client ID |
| `WEBSOCKET_URL` | No | WebSocket URL (auto-generated for Railway) |

#### Database Configuration (Postgres Add-on)
| Variable | Auto-Set by Railway | Description |
|----------|---------------------|-------------|
| `DATABASE_URL` | Yes | Primary Postgres connection string |
| `DATABASE_PUBLIC_URL` | Yes | Public Postgres connection string |
| `PGHOST` | Yes | Postgres host |
| `PGPORT` | Yes | Postgres port |
| `PGDATABASE` | Yes | Postgres database name |
| `PGUSER` | Yes | Postgres username |
| `POSTGRES_DB` | Yes | Postgres database name |
| `POSTGRES_USER` | Yes | Postgres user |
| `POSTGRES_PASSWORD` | Yes | Postgres password |

#### Redis Configuration (Redis Add-on)
| Variable | Auto-Set by Railway | Description |
|----------|---------------------|-------------|
| `REDIS_HOST` | Yes | Redis host |
| `REDIS_PORT` | Yes | Redis port |
| `REDIS_USER` | Yes | Redis username |
| `REDIS_PASSWORD` | Yes | Redis password |
| `REDISHOST` | Yes | Redis host (alternative) |
| `REDISPORT` | Yes | Redis port (alternative) |
| `REDISUSER` | Yes | Redis user (alternative) |
| `REDISPASSWORD` | Yes | Redis password (alternative) |

#### AI Provider API Keys
| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for GPT models |
| `ANTHROPIC_API_KEY` | No | Anthropic API key for Claude models |
| `GEMINI_API_KEY` | No | Google Gemini API key |
| `GOOGLE_API_KEY` | No | Google API key for various services |
| `PERPLEXITY_API_KEY` | No | Perplexity AI API key |
| `QWEN_ACCESS_KEY_SECRET` | No | Qwen/Alibaba Cloud API key |

#### GitHub Integration
| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `GITHUB_TOKEN` | No | GitHub personal access token |
| `GITHUB_USERNAME` | No | GitHub username |
| `GITHUB_USEREMAIL` | No | GitHub user email |
| `AUTH_CALLBACK_URL` | No | OAuth callback URL |

#### Container & Rate Limiting
| Variable | Required | Description |
|----------|----------|-------------|
| `MAX_CONTAINERS` | No | Maximum number of containers (default: 50) |
| `CONTAINER_TIMEOUT_MINUTES` | No | Container timeout in minutes (default: 30) |
| `POOL_SIZE` | No | Connection pool size (default: 5) |
| `RATE_LIMIT_MAX` | No | Rate limit max requests (default: 100) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default: 60000) |
| `VALID_API_KEYS` | No | Comma-separated valid API keys |

#### Production Configuration
| Variable | Required | Description |
|----------|----------|-------------|
| `NPM_CONFIG_PRODUCTION` | No | NPM production mode (default: false) |

### Railway Variable References

Railway uses a variable reference system to automatically populate environment variables from shared configurations and add-on services. In production, these variables are automatically set using the following pattern:

#### Shared Variables (from Railway shared configuration)
```bash
ALLOWED_ORIGINS="${{shared.ALLOWED_ORIGINS}}"
ANTHROPIC_API_KEY="${{shared.ANTHROPIC_API_KEY}}"
JWT_SECRET="${{shared.JWT_SECRET}}"
OPENAI_API_KEY="${{shared.OPENAI_API_KEY}}"
# ... other shared variables
```

#### Postgres Add-on Variables
```bash
DATABASE_URL="${{Postgres.DATABASE_URL}}"
DATABASE_PUBLIC_URL="${{Postgres.DATABASE_PUBLIC_URL}}"
PGHOST="${{Postgres.PGHOST}}"
PGPORT="${{Postgres.PGPORT}}"
PGUSER="${{Postgres.PGUSER}}"
POSTGRES_PASSWORD="${{Postgres.POSTGRES_PASSWORD}}"
# ... other Postgres variables
```

#### Redis Add-on Variables
```bash
REDIS_HOST="${{Redis.REDISHOST}}"
REDISPASSWORD="${{Redis.REDISPASSWORD}}"
REDISPORT="${{Redis.REDISPORT}}"
REDISUSER="${{Redis.REDISUSER}}"
# ... other Redis variables
```

This system ensures that:
1. **Add-on variables** are automatically updated when services are modified
2. **Shared variables** can be reused across multiple services
3. **Environment consistency** is maintained across deployments
4. **Secret rotation** is simplified through centralized management

### Setting Up Railway Variable References

#### 1. Configure Shared Variables
```bash
# Set shared variables that can be referenced across services
railway variables set --shared JWT_SECRET=$(openssl rand -base64 32)
railway variables set --shared WEBCONTAINER_API_KEY=your-webcontainer-api-key
railway variables set --shared OPENAI_API_KEY=your-openai-api-key
railway variables set --shared ANTHROPIC_API_KEY=your-anthropic-api-key
```

#### 2. Add Database and Redis Services
```bash
# Add Postgres database
railway add postgresql

# Add Redis cache
railway add redis
```

#### 3. Reference Variables in Service Configuration
In your Railway service, set environment variables using references:
```bash
# Reference shared variables
railway variables set JWT_SECRET='${{shared.JWT_SECRET}}'
railway variables set WEBCONTAINER_API_KEY='${{shared.WEBCONTAINER_API_KEY}}'

# Reference add-on variables  
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables set REDIS_HOST='${{Redis.REDISHOST}}'
```

**Note**: When setting variables via CLI, use single quotes to prevent shell interpretation of the `${{}}` syntax.

For production deployments, sensitive variables should be properly managed:

#### Railway Environment Variables
```bash
# Generate and set secure JWT secret
railway variables set JWT_SECRET=$(openssl rand -base64 32)

# Set API keys
railway variables set WEBCONTAINER_API_KEY=your-stackblitz-key
railway variables set VALID_API_KEYS=$(openssl rand -hex 16),$(openssl rand -hex 16)
```

#### GitHub Environment Secrets
To sync secrets to GitHub environments for CI/CD:

```bash
# Install GitHub CLI if not available
brew install gh  # macOS
# or
sudo apt install gh  # Ubuntu

# Login and sync secrets
gh auth login

# Sync to production environment
gh secret set WEBCONTAINER_API_KEY --body "$WEBCONTAINER_API_KEY" --env production
gh secret set JWT_SECRET --body "$(openssl rand -base64 32)" --env production
gh secret set ALLOWED_ORIGINS --body "https://chat.openai.com,https://chatgpt.com" --env production

# Sync to staging environment (if applicable)
gh secret set WEBCONTAINER_API_KEY --body "$WEBCONTAINER_API_KEY" --env staging
gh secret set JWT_SECRET --body "$(openssl rand -base64 32)" --env staging
```

#### Secret Rotation Schedule
- **JWT_SECRET**: Rotate monthly
- **API_KEYS**: Rotate quarterly
- **GITHUB_CLIENT_SECRET**: Rotate annually or on compromise
- **WEBCONTAINER_API_KEY**: Rotate when StackBlitz requires

### ChatGPT Integration Verification

After deployment, verify ChatGPT compliance:

```bash
# Test discovery endpoints
curl https://your-app.up.railway.app/
curl https://your-app.up.railway.app/config
curl https://your-app.up.railway.app/.well-known/ai-plugin.json
curl https://your-app.up.railway.app/.well-known/mcp.json

# Test OpenAPI documentation
curl https://your-app.up.railway.app/openapi.json
# Open in browser: https://your-app.up.railway.app/docs

# Test CORS headers
curl -H "Origin: https://chat.openai.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS https://your-app.up.railway.app/api/v1/auth/login
```

### Data Directory Configuration

The server uses a persistent data directory for storing application data. This is configured via the `DATA_DIR` environment variable:

**Default Configuration:**
- `DATA_DIR="app/data"` 
- Container path: `/app/data`

**For Docker Deployment:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  disco:
    build: .
    environment:
      - DATA_DIR=app/data
    volumes:
      - ./local_data:/app/data  # Mount host directory to container
```

**For Railway Deployment:**
1. Set the `DATA_DIR` environment variable (optional, defaults to "app/data"):
   ```bash
   railway variables set DATA_DIR=app/data
   ```

2. In Railway's volumes UI, set:
   - **Mount Path**: `/app/data`
   - **Size**: Choose appropriate size for your data needs

**Using Different Data Paths:**
If you want to use a different path:
```bash
# For /data mount point
railway variables set DATA_DIR=data

# For /app/storage mount point  
railway variables set DATA_DIR=app/storage
```

The mount path in your container will be `/${DATA_DIR}` (e.g., `/data`, `/app/storage`).

### Scaling Configuration

Railway will automatically scale based on:
- CPU usage
- Memory usage  
- Active connections

You can configure scaling in `railway.toml`:

```toml
[scaling]
min_instances = 1
max_instances = 10
target = 5
cooldown_period = "5m"
```

### Health Checks

Railway uses the following endpoints for health monitoring:

- **Healthcheck**: `GET /health`
- **Readiness**: `GET /health/ready`
- **Liveness**: `GET /health/live`

## Troubleshooting

### Common Issues

#### 1. Port Binding Error

**Error**: Server fails to start with port binding error

**Solution**: Ensure your server binds to `0.0.0.0` and uses `process.env.PORT`:

```typescript
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${port}`);
});
```

#### 2. CORS Issues

**Error**: ChatGPT cannot connect due to CORS

**Solution**: Verify `ALLOWED_ORIGINS` includes the correct domains:

```bash
railway variables set ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com"
```

#### 3. WebContainer Initialization Fails

**Error**: Container creation fails

**Solutions**:
1. Increase memory allocation:
   ```bash
   railway variables set RAILWAY_MEMORY_MB=2048
   ```

2. Check WebContainer API key:
   ```bash
   railway variables set WEBCONTAINER_API_KEY=your-valid-key
   ```

#### 4. High Memory Usage

**Error**: Application runs out of memory

**Solutions**:
1. Enable garbage collection:
   ```bash
   railway variables set NODE_OPTIONS="--expose-gc"
   ```

2. Adjust container limits:
   ```bash
   railway variables set MAX_CONTAINERS=25
   railway variables set CONTAINER_TIMEOUT_MINUTES=15
   ```

### Monitoring

#### View Logs

```bash
railway logs --service mcp-server
```

#### Monitor Metrics

```bash
curl https://your-app.up.railway.app/health/metrics
```

#### Check Container Stats

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-app.up.railway.app/api/v1/containers/stats
```

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **API Keys**: Implement proper API key validation
3. **CORS**: Restrict origins to necessary domains only
4. **Rate Limiting**: Configure appropriate rate limits
5. **Input Validation**: All inputs are validated server-side
6. **Container Isolation**: Each user gets isolated containers

## Performance Optimization

1. **Container Pooling**: Pre-warm containers for faster startup
2. **Caching**: Use Redis for session and data caching
3. **Memory Management**: Enable garbage collection
4. **Resource Limits**: Set appropriate container limits

## Monitoring and Alerting

Set up monitoring for:
- Container count and usage
- Memory usage
- Response times
- Error rates
- Health check failures

## Backup and Recovery

1. **Code**: Repository is backed up in GitHub
2. **Configuration**: Environment variables can be exported
3. **Sessions**: Redis data should be backed up for production

## Support

For issues:
1. Check logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Test health endpoints
4. Check Railway status page
5. Review the troubleshooting section above