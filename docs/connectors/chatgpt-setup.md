# ChatGPT Integration Setup Guide

This comprehensive guide covers setting up the Disco MCP Server for ChatGPT.com main interface connectors and custom GPT applications.

## Overview

The Disco MCP Server provides multiple integration methods with ChatGPT:
- **ChatGPT.com Connectors**: Main interface plugin integration (requires Plus/Pro/Team/Enterprise)
- **Custom GPT Actions**: GPT store applications with API integration
- **Direct API Integration**: Custom applications using OpenAI API
- **Plugin Architecture**: Traditional OpenAI plugin format

## Quick Setup (TL;DR)

### For ChatGPT.com Main Interface Connectors
```
Connector URL: https://disco-mcp.up.railway.app/openapi.json
Authentication: Automatic via GitHub OAuth
```

### For Custom GPT Actions
```
Schema URL: https://disco-mcp.up.railway.app/openapi.json
Authentication: API Key (get from https://disco-mcp.up.railway.app/)
```

### For Direct API
```
Base URL: https://disco-mcp.up.railway.app/api/v1
Auth Header: Bearer <your-jwt-token>
```

## Detailed Setup Instructions

### Prerequisites

1. **ChatGPT Plus/Pro/Team/Enterprise** (for connectors and custom GPTs)
2. **GitHub Account** (for authentication)
3. **OpenAI Account** (with appropriate subscription)
4. **Web Browser** (Chrome, Firefox, Safari, Edge)

### Method 1: ChatGPT.com Main Interface Connectors (Recommended)

This method integrates directly with ChatGPT.com's main chat interface.

#### Step 1: Access Connector Settings

1. **Open ChatGPT.com**: https://chat.openai.com/
2. **Login**: Use your ChatGPT Plus/Pro/Team/Enterprise account
3. **Open Settings**: Click your profile picture → Settings
4. **Navigate to Connectors**: Look for "Connectors" or "Plugins" section
5. **Add New Connector**: Click "Add New" or "+" button

#### Step 2: Configure the Connector

1. **Connector URL**: 
   ```
   https://disco-mcp.up.railway.app/openapi.json
   ```

2. **Name**: `Disco MCP Server`

3. **Description**: `Full development environment with WebContainer integration`

4. **Click Add/Connect**

#### Step 3: Authentication Flow

1. **Automatic Redirect**: ChatGPT will redirect you to GitHub OAuth
2. **Authorize Application**: Click "Authorize" on GitHub
3. **Return to ChatGPT**: You'll be redirected back automatically
4. **Verify Connection**: Look for green "Connected" status

#### Step 4: Test the Connection

Try these prompts in ChatGPT:

```
"List the available tools from the Disco MCP server"
"Create a new file called hello.js with a simple console.log"
"Execute the command 'node --version' in the terminal"
"Take a screenshot of the current screen"
```

### Method 2: Custom GPT with Actions

Create a custom GPT that can use the Disco MCP Server APIs.

#### Step 1: Create Custom GPT

1. **Go to GPT Builder**: https://chat.openai.com/gpts/editor
2. **Click Create**: Start a new GPT
3. **Configure Basics**:
   - **Name**: "Disco Development Assistant"
   - **Description**: "Full development environment with file operations, git, terminal, and computer use"
   - **Instructions**: "You are a development assistant with access to WebContainer environments..."

#### Step 2: Configure Actions

1. **In the Actions section**: Click "Create new action"
2. **Import from URL**: 
   ```
   https://disco-mcp.up.railway.app/openapi.json
   ```
3. **Authentication**: 
   - **Type**: API Key
   - **Auth Type**: Bearer
   - **API Key**: Get from https://disco-mcp.up.railway.app/ (login first)

#### Step 3: Test and Publish

1. **Test in Preview**: Try the same test prompts from Method 1
2. **Adjust Instructions**: Refine the GPT's behavior
3. **Publish**: Make it available to your team or publicly

### Method 3: Direct API Integration

For developers building custom applications.

#### Step 1: Get API Credentials

```bash
# Method A: GitHub OAuth Flow
curl "https://disco-mcp.up.railway.app/api/v1/auth/github"
# Follow OAuth flow to get JWT token

# Method B: Direct API Key (if available)
curl -X POST "https://disco-mcp.up.railway.app/api/v1/auth" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "your-api-key"}'
```

#### Step 2: API Usage Examples

```javascript
// Node.js/JavaScript Example
const baseURL = 'https://disco-mcp.up.railway.app/api/v1';
const token = 'your-jwt-token';

// Create a container
const container = await fetch(`${baseURL}/containers`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Execute a command
const result = await fetch(`${baseURL}/terminal/${containerId}/execute`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'npm install express'
  })
});
```

```python
# Python Example
import requests

base_url = 'https://disco-mcp.up.railway.app/api/v1'
token = 'your-jwt-token'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Create container
response = requests.post(f'{base_url}/containers', headers=headers)
container_id = response.json()['data']['containerId']

# Execute command
response = requests.post(
    f'{base_url}/terminal/{container_id}/execute',
    headers=headers,
    json={'command': 'python --version'}
)
print(response.json())
```

### Method 4: Traditional Plugin Format

For legacy OpenAI plugin compatibility.

#### Plugin Manifest

```json
{
  "schema_version": "v1",
  "name_for_human": "Disco Code Runner",
  "name_for_model": "disco",
  "description_for_human": "Full development environment with repository access, terminal operations, and computer use capabilities.",
  "description_for_model": "Provides complete development environment through WebContainers with file operations, git integration, terminal access, and browser automation for code development and testing.",
  "auth": {
    "type": "oauth",
    "client_url": "https://disco-mcp.up.railway.app/api/v1/auth/github",
    "scope": "mcp:tools mcp:resources",
    "authorization_url": "https://disco-mcp.up.railway.app/oauth/authorize",
    "authorization_content_type": "application/json"
  },
  "api": {
    "type": "openapi",
    "url": "https://disco-mcp.up.railway.app/openapi.json"
  },
  "logo_url": "https://disco-mcp.up.railway.app/logo.png",
  "contact_email": "support@disco-mcp.dev",
  "legal_info_url": "https://disco-mcp.up.railway.app/legal"
}
```

## Available Capabilities

Once connected, ChatGPT will have access to:

### File System Operations
- **Read Files**: `GET /api/v1/files/{containerId}/content`
- **Write Files**: `POST /api/v1/files/{containerId}`
- **List Directories**: `GET /api/v1/files/{containerId}`
- **Delete Files**: `DELETE /api/v1/files/{containerId}`

### Git Operations
- **Clone Repository**: `POST /api/v1/git/{containerId}/clone`
- **Commit Changes**: `POST /api/v1/git/{containerId}/commit`
- **Push/Pull**: `POST /api/v1/git/{containerId}/push`
- **Branch Management**: `POST /api/v1/git/{containerId}/branch`

### Terminal Operations
- **Execute Commands**: `POST /api/v1/terminal/{containerId}/execute`
- **Stream Output**: `POST /api/v1/terminal/{containerId}/stream`
- **Command History**: `GET /api/v1/terminal/{containerId}/history`

### Computer Use (Experimental)
- **Screenshots**: `POST /api/v1/computer-use/screenshot`
- **Click Actions**: `POST /api/v1/computer-use/click`
- **Type Text**: `POST /api/v1/computer-use/type`
- **Key Press**: `POST /api/v1/computer-use/key`

### Container Management
- **Create Container**: `POST /api/v1/containers`
- **List Containers**: `GET /api/v1/containers`
- **Container Status**: `GET /api/v1/containers/{containerId}`
- **Delete Container**: `DELETE /api/v1/containers/{containerId}`

## Example Use Cases

### Web Development

```
"Create a new React app in a container, install dependencies, and start the development server"
```

ChatGPT will:
1. Create a new WebContainer
2. Run `npx create-react-app my-app`
3. Navigate to the app directory
4. Run `npm start`
5. Show the development server output

### Data Analysis

```
"Clone this data analysis repository, install Python dependencies, and run the analysis script"
```

ChatGPT will:
1. Clone the specified repository
2. Install Python packages from requirements.txt
3. Execute the analysis script
4. Show results and generate visualizations

### DevOps Tasks

```
"Deploy this Node.js app to Railway, set up environment variables, and verify the deployment"
```

ChatGPT will:
1. Set up Railway CLI in the container
2. Configure deployment settings
3. Deploy the application
4. Verify the deployment is working
5. Provide the live URL

### Code Review

```
"Take a screenshot of this code editor, then analyze the code for potential improvements"
```

ChatGPT will:
1. Capture a screenshot of the current screen
2. Analyze the visible code
3. Suggest improvements and best practices
4. Provide specific recommendations

## Troubleshooting

### Common Issues

#### 1. Connector Not Found

**Symptoms**: ChatGPT can't find the connector
**Solutions**:
- ✅ Verify URL: `https://disco-mcp.up.railway.app/openapi.json`
- ✅ Check your ChatGPT subscription (Plus/Pro/Team/Enterprise required)
- ✅ Try incognito/private browsing mode
- ✅ Clear browser cache and cookies

#### 2. Authentication Failed

**Symptoms**: OAuth flow fails or returns errors
**Solutions**:
- ✅ Ensure you have a GitHub account
- ✅ Check if GitHub OAuth app is properly configured
- ✅ Try logging out and back into both ChatGPT and GitHub
- ✅ Disable browser extensions that might interfere

#### 3. API Calls Timeout

**Symptoms**: Commands take too long or fail
**Solutions**:
- ✅ Check server status: https://disco-mcp.up.railway.app/health
- ✅ Try simpler commands first
- ✅ Check your internet connection
- ✅ Wait and retry (server might be scaling up)

#### 4. Tools Not Available

**Symptoms**: ChatGPT says tools are not accessible
**Solutions**:
- ✅ Refresh the ChatGPT page
- ✅ Reconnect the connector
- ✅ Check if your token has expired
- ✅ Verify the OpenAPI specification loads correctly

### Debug Information

#### Check Server Status
```bash
curl https://disco-mcp.up.railway.app/health
```

#### Verify OpenAPI Specification
```bash
curl https://disco-mcp.up.railway.app/openapi.json | jq .
```

#### Test Authentication
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://disco-mcp.up.railway.app/api/v1/containers
```

#### Browser Developer Tools
1. Open DevTools (F12)
2. Go to Network tab
3. Attempt to use the connector
4. Look for failed requests or errors
5. Check Console tab for JavaScript errors

### Getting Help

If you continue to experience issues:

1. **Check Documentation**: https://disco-mcp.up.railway.app/docs
2. **Server Health**: https://disco-mcp.up.railway.app/health
3. **GitHub Issues**: https://github.com/Arcane-Fly/disco/issues
4. **OpenAI Support**: For ChatGPT-specific connector issues

## Advanced Configuration

### Rate Limiting

The server implements rate limiting to ensure fair usage:
- **100 requests per minute** per user
- **10 concurrent containers** per user
- **30 minute timeout** for inactive containers

### Custom Environment Variables

When creating containers, you can specify environment variables:

```json
{
  "options": {
    "env": {
      "NODE_ENV": "development",
      "API_KEY": "your-api-key",
      "DATABASE_URL": "your-database-url"
    }
  }
}
```

### Webhook Integration

For real-time updates, you can configure webhooks:

```bash
curl -X POST "https://disco-mcp.up.railway.app/api/v1/webhooks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["container.created", "terminal.output", "file.changed"]
  }'
```

### Security Best Practices

1. **Token Management**:
   - Use environment variables for tokens
   - Rotate tokens regularly
   - Never commit tokens to version control

2. **Access Control**:
   - Use least privilege principle
   - Monitor usage patterns
   - Revoke unused tokens

3. **Network Security**:
   - Always use HTTPS
   - Validate SSL certificates
   - Monitor for unusual activity

## API Reference

### Authentication Endpoints
- `GET /api/v1/auth/github` - GitHub OAuth flow
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/verify` - Verify token validity

### Container Management
- `POST /api/v1/containers` - Create container
- `GET /api/v1/containers` - List containers
- `GET /api/v1/containers/{id}` - Get container details
- `DELETE /api/v1/containers/{id}` - Delete container

### File Operations
- `GET /api/v1/files/{containerId}` - List files
- `GET /api/v1/files/{containerId}/content` - Read file
- `POST /api/v1/files/{containerId}` - Create/update file
- `DELETE /api/v1/files/{containerId}` - Delete file

### Terminal Operations
- `POST /api/v1/terminal/{containerId}/execute` - Execute command
- `POST /api/v1/terminal/{containerId}/stream` - Stream command
- `GET /api/v1/terminal/{containerId}/history` - Command history

### Git Operations
- `POST /api/v1/git/{containerId}/clone` - Clone repository
- `POST /api/v1/git/{containerId}/commit` - Commit changes
- `POST /api/v1/git/{containerId}/push` - Push changes
- `POST /api/v1/git/{containerId}/pull` - Pull changes

---

**Last Updated**: {{ current_date }}  
**Server Version**: 2.0.0  
**OpenAPI Version**: 3.0.0  
**Status**: ✅ Production Ready