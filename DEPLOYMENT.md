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

Set the required environment variables:

```bash
# Required variables
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set WEBCONTAINER_API_KEY=your-webcontainer-api-key
railway variables set ALLOWED_ORIGINS="https://chat.openai.com"

# Optional variables
railway variables set GITHUB_CLIENT_ID=your-github-client-id
railway variables set GITHUB_CLIENT_SECRET=your-github-client-secret
railway variables set VALID_API_KEYS="api-key-1,api-key-2"
```

### 5. Add Redis Add-on

```bash
railway add redis
```

This will automatically set the `REDIS_URL` environment variable.

### 6. Deploy

```bash
railway up
```

The deployment will:
1. Install dependencies using npm
2. Build the TypeScript code
3. Start the server on Railway's assigned port

### 7. Verify Deployment

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

## Production Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Railway sets this automatically |
| `NODE_ENV` | No | Set to "production" automatically |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `WEBCONTAINER_API_KEY` | Yes | StackBlitz WebContainer API key |
| `ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins |
| `REDIS_URL` | Yes | Redis connection string (auto-set by Railway) |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `VALID_API_KEYS` | No | Comma-separated valid API keys |

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