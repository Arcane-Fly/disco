# Webhook Setup & Environment Configuration Guide

Complete guide for setting up webhooks and configuring environment variables for optimal Disco MCP Server integration.

## Table of Contents

- [Environment Variables Setup](#environment-variables)
- [Webhook Configuration](#webhook-configuration)
- [Production Deployment](#production-deployment)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)

## Environment Variables

### Core Required Variables

#### For Basic Operation
```bash
# JWT Secret (Required)
JWT_SECRET="your-super-secret-32-character-string-here"

# Allowed Origins (Required for CORS)
ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com,https://claude.ai"

# WebContainer Integration (Required for container functionality)
WEBCONTAINER_API_KEY="your-stackblitz-webcontainer-api-key"
WEBCONTAINER_CLIENT_ID="your-stackblitz-client-id"
```

#### For GitHub OAuth Integration
```bash
# GitHub OAuth (Optional but recommended)
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
GITHUB_TOKEN="your-github-personal-access-token"

# OAuth Callback Configuration
AUTH_CALLBACK_URL="https://your-domain.com/api/v1/auth/github/callback"
GITHUB_REDIRECT_URI="https://your-domain.com/api/v1/auth/github/callback"
```

#### For Database & Caching
```bash
# Redis (Optional - improves performance)
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"

# PostgreSQL (Optional - for persistent storage)
DATABASE_URL="postgresql://user:password@localhost:5432/disco_mcp"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="disco_mcp"
POSTGRES_USER="disco_user"
POSTGRES_PASSWORD="your-db-password"
```

#### For AI Provider Integration
```bash
# OpenAI API (Optional)
OPENAI_API_KEY="sk-your-openai-api-key"

# Anthropic Claude API (Optional)
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"

# Google Gemini API (Optional)
GEMINI_API_KEY="your-gemini-api-key"
GOOGLE_API_KEY="your-google-api-key"

# Other AI Providers
PERPLEXITY_API_KEY="your-perplexity-api-key"
QWEN_ACCESS_KEY_SECRET="your-qwen-access-key"
```

#### For Monitoring & Performance
```bash
# Server Configuration
PORT="3000"
NODE_ENV="production"
LOG_LEVEL="info"
DATA_DIR="app/data"

# Performance Tuning
MAX_CONTAINERS="50"
CONTAINER_TIMEOUT_MINUTES="30"
POOL_SIZE="5"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="60000"

# Security
VALID_API_KEYS="api-key-1,api-key-2,api-key-3"
SECURITY_DATA_DIR="/data/disco/security"
```

### Environment Setup by Platform

#### Railway Deployment
```bash
# Set variables using Railway CLI
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set WEBCONTAINER_API_KEY="your-stackblitz-key"
railway variables set ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com"
railway variables set GITHUB_CLIENT_ID="your-github-client-id"
railway variables set GITHUB_CLIENT_SECRET="your-github-client-secret"

# Add Redis
railway add redis

# Add PostgreSQL  
railway add postgresql

# Deploy
railway up
```

#### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  disco-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - WEBCONTAINER_API_KEY=${WEBCONTAINER_API_KEY}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/disco_mcp
    depends_on:
      - redis
      - postgres
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=disco_mcp
      - POSTGRES_USER=disco_user
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Kubernetes Deployment
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: disco-mcp-config
data:
  ALLOWED_ORIGINS: "https://chat.openai.com,https://chatgpt.com"
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  MAX_CONTAINERS: "50"
  
---
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: disco-mcp-secrets
type: Opaque
stringData:
  JWT_SECRET: "your-jwt-secret-here"
  WEBCONTAINER_API_KEY: "your-webcontainer-api-key"
  GITHUB_CLIENT_ID: "your-github-client-id"
  GITHUB_CLIENT_SECRET: "your-github-client-secret"
  REDIS_URL: "redis://redis-service:6379"
  DATABASE_URL: "postgresql://user:password@postgres-service:5432/disco_mcp"
```

## Webhook Configuration

### Setting Up Webhooks

#### GitHub Webhooks for Repository Events
```bash
# Create webhook for repository events
curl -X POST "https://api.github.com/repos/owner/repo/hooks" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "web",
    "active": true,
    "events": ["push", "pull_request", "issues"],
    "config": {
      "url": "https://your-disco-server.com/webhooks/github",
      "content_type": "json",
      "secret": "your-webhook-secret"
    }
  }'
```

#### Configuring Webhook Endpoints in Disco MCP

Add webhook support to your server configuration:

```bash
# Environment variables for webhook security
WEBHOOK_SECRET="your-webhook-secret-key"
GITHUB_WEBHOOK_SECRET="your-github-webhook-secret"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/your-webhook-url"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/your/slack/webhook"
```

#### ChatGPT Integration Webhooks
```bash
# For ChatGPT plugin webhooks
curl -X POST "https://your-disco-server.com/api/v1/webhooks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/chatgpt-webhook",
    "events": ["container.created", "terminal.output", "file.changed"],
    "secret": "your-webhook-secret"
  }'
```

#### Claude Integration Webhooks
```bash
# For Claude API webhooks
curl -X POST "https://your-disco-server.com/api/v1/webhooks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/claude-webhook",
    "events": ["mcp.request", "mcp.response", "error"],
    "secret": "your-webhook-secret"
  }'
```

### Webhook Event Types

#### Container Events
```javascript
// container.created
{
  "event": "container.created",
  "timestamp": "2025-01-01T12:00:00Z",
  "data": {
    "containerId": "user-123-456",
    "userId": "user-123",
    "template": "node",
    "status": "ready"
  }
}

// container.terminated
{
  "event": "container.terminated",
  "timestamp": "2025-01-01T12:30:00Z",
  "data": {
    "containerId": "user-123-456",
    "reason": "timeout",
    "duration": 1800
  }
}
```

#### File System Events
```javascript
// file.created
{
  "event": "file.created",
  "timestamp": "2025-01-01T12:05:00Z",
  "data": {
    "containerId": "user-123-456",
    "path": "/src/app.js",
    "size": 1024
  }
}

// file.modified
{
  "event": "file.modified", 
  "timestamp": "2025-01-01T12:10:00Z",
  "data": {
    "containerId": "user-123-456",
    "path": "/src/app.js",
    "oldSize": 1024,
    "newSize": 1536
  }
}
```

#### Terminal Events
```javascript
// terminal.command
{
  "event": "terminal.command",
  "timestamp": "2025-01-01T12:15:00Z",
  "data": {
    "containerId": "user-123-456",
    "command": "npm install express",
    "exitCode": 0,
    "duration": 5000
  }
}

// terminal.output
{
  "event": "terminal.output",
  "timestamp": "2025-01-01T12:15:00Z",
  "data": {
    "containerId": "user-123-456",
    "type": "stdout",
    "content": "added 50 packages in 5s"
  }
}
```

### Webhook Handler Examples

#### Node.js Webhook Handler
```javascript
// webhook-handler.js
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Webhook verification middleware
function verifyWebhook(secret) {
  return (req, res, next) => {
    const signature = req.headers['x-disco-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== `sha256=${expectedSignature}`) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    next();
  };
}

// Container events handler
app.post('/disco-webhooks/containers', verifyWebhook(process.env.WEBHOOK_SECRET), (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'container.created':
      console.log(`Container created: ${data.containerId}`);
      // Notify team, update dashboard, etc.
      break;
      
    case 'container.terminated':
      console.log(`Container terminated: ${data.containerId}, reason: ${data.reason}`);
      // Clean up resources, log metrics, etc.
      break;
  }
  
  res.json({ status: 'received' });
});

// File system events handler
app.post('/disco-webhooks/files', verifyWebhook(process.env.WEBHOOK_SECRET), (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'file.created':
    case 'file.modified':
      console.log(`File ${event.split('.')[1]}: ${data.path}`);
      // Trigger builds, run linters, update documentation, etc.
      break;
  }
  
  res.json({ status: 'received' });
});

app.listen(3001, () => {
  console.log('Webhook handler listening on port 3001');
});
```

#### Python Webhook Handler
```python
# webhook_handler.py
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)

def verify_webhook(secret):
    def decorator(f):
        def wrapper(*args, **kwargs):
            signature = request.headers.get('X-Disco-Signature')
            payload = request.get_data()
            expected_signature = 'sha256=' + hmac.new(
                secret.encode(),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            if signature != expected_signature:
                return jsonify({'error': 'Invalid signature'}), 401
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

@app.route('/disco-webhooks/containers', methods=['POST'])
@verify_webhook(os.environ['WEBHOOK_SECRET'])
def handle_container_events():
    data = request.json
    event = data['event']
    
    if event == 'container.created':
        print(f"Container created: {data['data']['containerId']}")
        # Handle container creation
        
    elif event == 'container.terminated':
        print(f"Container terminated: {data['data']['containerId']}")
        # Handle container termination
        
    return jsonify({'status': 'received'})

@app.route('/disco-webhooks/terminal', methods=['POST'])
@verify_webhook(os.environ['WEBHOOK_SECRET'])
def handle_terminal_events():
    data = request.json
    event = data['event']
    
    if event == 'terminal.command':
        command_data = data['data']
        print(f"Command executed: {command_data['command']}")
        
        # Log command execution
        # Update metrics
        # Trigger alerts if needed
        
    return jsonify({'status': 'received'})

if __name__ == '__main__':
    app.run(port=3001)
```

## Production Deployment

### Railway Production Setup
```bash
# 1. Set production environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set WEBCONTAINER_API_KEY="your-production-key"
railway variables set ALLOWED_ORIGINS="https://chat.openai.com,https://chatgpt.com,https://claude.ai"

# 2. Configure GitHub OAuth for production
railway variables set GITHUB_CLIENT_ID="your-production-github-client-id"
railway variables set GITHUB_CLIENT_SECRET="your-production-github-client-secret"
railway variables set AUTH_CALLBACK_URL="https://your-app.up.railway.app/api/v1/auth/github/callback"

# 3. Add production services
railway add redis
railway add postgresql

# 4. Configure webhook endpoints
railway variables set WEBHOOK_SECRET=$(openssl rand -base64 32)
railway variables set GITHUB_WEBHOOK_SECRET=$(openssl rand -base64 32)

# 5. Deploy
railway up
```

### Environment Validation Script
```bash
#!/bin/bash
# validate-environment.sh

echo "🔍 Validating Disco MCP Environment Configuration..."

# Required variables
REQUIRED_VARS=(
  "JWT_SECRET"
  "WEBCONTAINER_API_KEY"
  "ALLOWED_ORIGINS"
)

# Optional but recommended variables
RECOMMENDED_VARS=(
  "GITHUB_CLIENT_ID"
  "GITHUB_CLIENT_SECRET"
  "REDIS_URL"
  "DATABASE_URL"
)

# Check required variables
echo "Checking required variables..."
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

# Check recommended variables
echo "Checking recommended variables..."
for var in "${RECOMMENDED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  Recommended variable not set: $var"
  else
    echo "✅ $var is set"
  fi
done

# Validate JWT secret strength
if [ ${#JWT_SECRET} -lt 32 ]; then
  echo "⚠️  JWT_SECRET should be at least 32 characters long"
fi

# Validate CORS origins
if [[ "$ALLOWED_ORIGINS" == *"localhost"* ]] && [ "$NODE_ENV" = "production" ]; then
  echo "⚠️  ALLOWED_ORIGINS contains localhost in production environment"
fi

echo "🎉 Environment validation complete!"
```

## Local Development

### Local Development Setup
```bash
# 1. Clone repository
git clone https://github.com/Arcane-Fly/disco.git
cd disco

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env file
cat > .env << 'EOF'
# Core Configuration
JWT_SECRET="development-secret-key-change-in-production"
WEBCONTAINER_API_KEY="your-stackblitz-api-key"
ALLOWED_ORIGINS="http://localhost:3000,https://chat.openai.com"

# GitHub OAuth (optional for development)
GITHUB_CLIENT_ID="your-dev-github-client-id"
GITHUB_CLIENT_SECRET="your-dev-github-client-secret"
AUTH_CALLBACK_URL="http://localhost:3000/api/v1/auth/github/callback"

# Local services
REDIS_URL="redis://localhost:6379"
DATABASE_URL="postgresql://localhost:5432/disco_mcp_dev"

# Development settings
NODE_ENV="development"
LOG_LEVEL="debug"
PORT="3000"
EOF

# 4. Install dependencies
npm install

# 5. Start development services (optional)
docker-compose -f docker-compose.dev.yml up -d

# 6. Build and start
npm run build
npm run dev
```

### Development Docker Compose
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=disco_mcp_dev
      - POSTGRES_USER=dev_user
      - POSTGRES_PASSWORD=dev_password
    ports:
      - "5432:5432"
    volumes:
      - dev_postgres_data:/var/lib/postgresql/data

volumes:
  dev_postgres_data:
```

## Troubleshooting

### Common Environment Issues

#### 1. JWT Secret Issues
```bash
# Problem: JWT_SECRET not set or too weak
# Solution: Generate strong secret
export JWT_SECRET=$(openssl rand -base64 32)

# Verify secret strength
echo "JWT_SECRET length: ${#JWT_SECRET}"
```

#### 2. CORS Configuration Issues
```bash
# Problem: CORS errors in browser
# Solution: Check ALLOWED_ORIGINS
echo "Current ALLOWED_ORIGINS: $ALLOWED_ORIGINS"

# For development, include localhost
export ALLOWED_ORIGINS="http://localhost:3000,https://chat.openai.com,https://chatgpt.com"
```

#### 3. GitHub OAuth Issues
```bash
# Problem: OAuth callback fails
# Solution: Verify callback URL matches GitHub app settings

# Check current callback URL
echo "AUTH_CALLBACK_URL: $AUTH_CALLBACK_URL"

# Should match: https://github.com/settings/applications/YOUR_APP_ID
```

#### 4. WebContainer API Issues
```bash
# Problem: Container creation fails
# Solution: Verify WebContainer API key

# Test API key
curl -H "Authorization: Bearer $WEBCONTAINER_API_KEY" \
  "https://api.stackblitz.com/v1/test"
```

### Debugging Commands

#### Check Environment Variables
```bash
# List all Disco-related environment variables
env | grep -E "(DISCO|JWT|GITHUB|WEBCONTAINER|REDIS|DATABASE)" | sort

# Check specific variables
echo "JWT_SECRET length: ${#JWT_SECRET}"
echo "ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
echo "NODE_ENV: $NODE_ENV"
```

#### Test Configuration
```bash
# Test server health with current config
curl http://localhost:3000/health

# Test authentication endpoint
curl http://localhost:3000/api/v1/auth/status

# Test CORS headers
curl -I -H "Origin: https://chat.openai.com" \
  http://localhost:3000/health
```

#### Validate Services
```bash
# Test Redis connection
redis-cli -u "$REDIS_URL" ping

# Test PostgreSQL connection
psql "$DATABASE_URL" -c "SELECT version();"

# Test GitHub API access
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
```

### Environment-Specific Troubleshooting

#### Railway Issues
```bash
# Check Railway variables
railway variables

# View Railway logs
railway logs

# Test Railway deployment
curl https://your-app.up.railway.app/health
```

#### Docker Issues
```bash
# Check container environment
docker exec -it disco-mcp env | grep -E "(DISCO|JWT|GITHUB)"

# View container logs
docker logs disco-mcp

# Test container networking
docker exec -it disco-mcp curl http://localhost:3000/health
```

#### Kubernetes Issues
```bash
# Check pod environment
kubectl exec -it disco-mcp-pod -- env | grep -E "(DISCO|JWT)"

# View pod logs
kubectl logs disco-mcp-pod

# Check config maps and secrets
kubectl get configmap disco-mcp-config -o yaml
kubectl get secret disco-mcp-secrets -o yaml
```

---

**🔧 Need Help?**
- **Documentation**: https://github.com/Arcane-Fly/disco/tree/master/docs
- **Health Check**: https://disco-mcp.up.railway.app/health
- **Issues**: https://github.com/Arcane-Fly/disco/issues