# Enhanced ChatGPT Integration Setup Guide

This comprehensive guide covers setting up the Disco MCP Server for ChatGPT.com main interface connectors, custom GPT applications, and direct API integration with detailed troubleshooting and visual guides.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Setup (TL;DR)](#quick-setup-tldr)
- [Method 1: ChatGPT.com Connectors](#method-1-chatgptcom-connectors)
- [Method 2: Custom GPT Actions](#method-2-custom-gpt-actions)
- [Method 3: Direct API Integration](#method-3-direct-api-integration)
- [Platform-Specific Configuration](#platform-specific-configuration)
- [Connection Testing](#connection-testing)
- [Troubleshooting](#troubleshooting)
- [Success Indicators](#success-indicators)

## Overview

The Disco MCP Server provides multiple integration methods with ChatGPT:

### ChatGPT.com Main Interface Connectors
- **Requirements**: ChatGPT Plus/Pro/Team/Enterprise
- **Protocol**: OpenAPI 3.0 with automatic OAuth
- **Benefits**: Native integration, automatic authentication, real-time updates
- **Setup Time**: 2-3 minutes

### Custom GPT Actions
- **Requirements**: ChatGPT Plus and GPT Builder access
- **Protocol**: OpenAPI schema with Bearer authentication
- **Benefits**: Custom GPT store integration, shareable GPTs
- **Setup Time**: 5-10 minutes

### Direct API Integration
- **Requirements**: OpenAI API access
- **Protocol**: RESTful API with JWT authentication  
- **Benefits**: Full programmatic control, custom applications
- **Setup Time**: 10-15 minutes

## Prerequisites

### Required
1. **ChatGPT Account** with appropriate subscription:
   - **Plus** ($20/month) - For connectors and custom GPTs
   - **Pro** ($20/month) - Enhanced features  
   - **Team** ($25/user/month) - Team management
   - **Enterprise** (Custom pricing) - Advanced features

2. **GitHub Account** - For authentication and token generation

3. **Modern Web Browser** - Chrome, Firefox, Safari, or Edge (latest versions)

### Recommended
- **Stable Internet Connection** - For real-time integration
- **Basic JSON Knowledge** - For custom configurations
- **OpenAI API Key** (for direct integration method)

## Quick Setup (TL;DR)

### For ChatGPT.com Connectors (Recommended)

1. **Open ChatGPT**: Visit https://chat.openai.com/
2. **Access Settings**: Profile picture → Settings
3. **Navigate to Connectors**: Find "Connectors" or "Features" section
4. **Add Connector**: 
   - URL: `https://disco-mcp.up.railway.app/openapi.json`
   - Authentication: Will be handled automatically via OAuth
5. **Test**: Start new chat and ask "List available tools from Disco"

### For Custom GPT Actions

1. **Open GPT Builder**: https://chat.openai.com/gpts/editor
2. **Create New GPT**: Click "Create a GPT"
3. **Add Actions**: 
   - Import schema: `https://disco-mcp.up.railway.app/openapi.json`
   - Auth type: Bearer token
   - Get token: Visit https://disco-mcp.up.railway.app/
4. **Test & Publish**: Test functionality and publish to GPT store

## Method 1: ChatGPT.com Connectors

This is the recommended method for most users as it provides the best integration experience.

### Step 1: Access ChatGPT Settings

1. **Open ChatGPT.com**: Navigate to https://chat.openai.com/
2. **Login**: Use your ChatGPT Plus/Pro/Team/Enterprise account
3. **Open Settings**: 
   - Click your **profile picture** in the bottom left
   - Select **"Settings"** from the dropdown menu

**Visual Indicators to Look For:**
- Profile picture or avatar in bottom left corner
- Gear icon (⚙️) near your profile
- Settings menu with multiple options

### Step 2: Navigate to Connectors

1. **Find Connectors Section**: 
   - Look for **"Connectors"**, **"Features"**, or **"Beta Features"**
   - This may be under a **"Beta"** or **"Labs"** section
   - Click on the **Connectors** option

2. **Open Connector Management**:
   - You should see a list of connected services
   - Look for **"Add New Connector"** or **"+"** button
   - Click to add a new connector

**Expected Interface Elements:**
- List of currently connected services (may be empty)
- "Add New Connector" button (usually blue)
- Search or URL input field

### Step 3: Add Disco MCP Connector

1. **Enter Connector URL**:
   ```
   https://disco-mcp.up.railway.app/openapi.json
   ```

2. **Configure Connection**:
   - **Name**: Disco MCP Server (auto-detected)
   - **Description**: WebContainer development environment
   - **URL**: The URL above
   - **Authentication**: Will be configured automatically

3. **Add Connector**: Click **"Add Connector"**, **"Connect"**, or **"Import"**

### Step 4: Complete Authentication Flow

The authentication will happen automatically through OAuth:

1. **GitHub Redirect**: You'll be redirected to GitHub for authentication
2. **Authorize Application**: 
   - Review the permissions requested
   - Click **"Authorize"** to grant access
3. **Return to ChatGPT**: You'll be redirected back automatically
4. **Verify Connection**: Look for **green "Connected"** status

**Authentication Flow Diagram:**
```
ChatGPT.com → GitHub OAuth → User Authorization → Back to ChatGPT → Connected ✅
```

### Step 5: Verify Integration

1. **Start New Chat**: Create a new conversation in ChatGPT
2. **Test Basic Integration**:
   ```
   "List the available tools from the Disco MCP server"
   ```

3. **Expected Response**: ChatGPT should list available capabilities:
   - File operations (read, write, delete, list)
   - Git operations (clone, commit, push, pull)
   - Terminal operations (execute commands, stream output)
   - Computer use operations (screenshots, clicks, typing)
   - WebContainer management

4. **Test Functionality**:
   ```
   "Create a new container and list its contents"
   "Create a file called hello.js with a simple console.log"
   "Execute the command 'node --version' in the terminal"
   ```

## Method 2: Custom GPT Actions

This method allows you to create custom GPTs that use Disco MCP Server functionality.

### Step 1: Access GPT Builder

1. **Open GPT Builder**: Navigate to https://chat.openai.com/gpts/editor
2. **Create New GPT**: Click **"Create a GPT"** button
3. **Choose Build Method**: Select **"Configure"** for manual setup

### Step 2: Basic GPT Configuration

1. **Name Your GPT**:
   - **Name**: "Disco Development Environment"
   - **Description**: "A development environment with WebContainers, file operations, git integration, and terminal access"

2. **Set Instructions**:
   ```
   You are a development assistant with access to a complete WebContainer environment through the Disco MCP Server. You can:
   
   - Create and manage development containers
   - Perform file operations (read, write, delete, list)
   - Execute terminal commands and stream output
   - Manage git repositories (clone, commit, push, pull)
   - Take screenshots and perform computer use actions
   
   Always explain what you're doing before performing actions, and provide clear feedback about the results.
   ```

3. **Add Conversation Starters**:
   - "Create a new Node.js project with Express"
   - "Clone a repository and install dependencies"
   - "Help me debug this code by running tests"
   - "Set up a development environment for React"

### Step 3: Configure Actions

1. **Open Actions Panel**: Click **"Actions"** in the configuration panel
2. **Add New Action**: Click **"Create new action"**
3. **Import Schema**: 
   - Select **"Import from URL"**
   - Enter: `https://disco-mcp.up.railway.app/openapi.json`
   - Click **"Import"**

### Step 4: Configure Authentication

1. **Set Authentication Type**: Choose **"Bearer"**
2. **Get Authentication Token**:
   - Visit https://disco-mcp.up.railway.app/
   - Click **"Login with GitHub"**
   - Copy your JWT token
3. **Enter Token**: Paste your JWT token in the authentication field

### Step 5: Test and Publish

1. **Test Actions**: Use the test panel to verify functionality
2. **Save Configuration**: Save your GPT configuration
3. **Publish GPT**: 
   - Choose **"Only me"** for private use
   - Choose **"Anyone with a link"** for sharing
   - Choose **"Public"** for GPT store listing

## Method 3: Direct API Integration

This method is for developers who want to integrate Disco MCP Server into their own applications.

### Step 1: Get API Credentials

1. **Get JWT Token**: Visit https://disco-mcp.up.railway.app/ and authenticate
2. **Get OpenAI API Key**: From https://platform.openai.com/api-keys
3. **Review API Documentation**: https://disco-mcp.up.railway.app/docs

### Step 2: Basic Integration

```javascript
// Example: OpenAI Integration with Disco MCP
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'your-openai-api-key',
});

const discoBaseUrl = 'https://disco-mcp.up.railway.app/api/v1';
const discoToken = 'your-disco-jwt-token';

// Function to call Disco MCP API
async function callDiscoAPI(endpoint, data) {
  const response = await fetch(`${discoBaseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${discoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Example: Create container and execute command
async function developmentWorkflow() {
  // Create container
  const container = await callDiscoAPI('/containers', {});
  const containerId = container.data.containerId;
  
  // Execute command
  const result = await callDiscoAPI(`/terminal/${containerId}/execute`, {
    command: 'npm init -y && npm install express'
  });
  
  console.log('Command output:', result.data.output);
}
```

### Step 3: OpenAI Function Integration

```javascript
// Define Disco MCP functions for OpenAI
const functions = [
  {
    name: 'create_container',
    description: 'Create a new development container',
    parameters: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          description: 'Container template (node, python, etc.)'
        }
      }
    }
  },
  {
    name: 'execute_command',
    description: 'Execute a command in a container',
    parameters: {
      type: 'object',
      properties: {
        containerId: {
          type: 'string',
          description: 'Container ID'
        },
        command: {
          type: 'string', 
          description: 'Command to execute'
        }
      },
      required: ['containerId', 'command']
    }
  }
];

// Chat completion with function calling
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'user',
      content: 'Create a new Node.js project and install Express'
    }
  ],
  functions: functions,
  function_call: 'auto'
});
```

## Platform-Specific Configuration

### ChatGPT.com Advanced Settings

#### Custom Headers Configuration
```json
{
  "connector_name": "Disco MCP Server",
  "base_url": "https://disco-mcp.up.railway.app",
  "openapi_url": "https://disco-mcp.up.railway.app/openapi.json",
  "authentication": {
    "type": "oauth",
    "oauth_url": "https://disco-mcp.up.railway.app/api/v1/auth/github"
  },
  "headers": {
    "User-Agent": "ChatGPT-Connector/1.0",
    "X-Client-Name": "chatgpt-connector",
    "X-Client-Version": "1.0.0"
  }
}
```

#### Rate Limiting Configuration
```json
{
  "rate_limits": {
    "requests_per_minute": 100,
    "concurrent_requests": 10,
    "timeout": 30000
  },
  "retry": {
    "attempts": 3,
    "delay": 1000,
    "backoff": "exponential"
  }
}
```

### Custom GPT Advanced Configuration

#### Enhanced Instructions Template
```
You are an AI assistant with access to a complete development environment through the Disco MCP Server. Your capabilities include:

CONTAINER MANAGEMENT:
- Create and manage WebContainer instances
- Switch between multiple development environments
- Monitor container resource usage

FILE OPERATIONS:
- Read, write, edit, and delete files
- Navigate directory structures
- Handle multiple file formats (text, JSON, markdown, code)

TERMINAL ACCESS:
- Execute shell commands with real-time output
- Install packages and dependencies
- Run development servers and build processes

GIT INTEGRATION:
- Clone repositories from GitHub
- Commit changes and push updates
- Manage branches and merge requests

COMPUTER USE:
- Take screenshots of current state
- Perform automated testing
- Monitor application behavior

GUIDELINES:
1. Always explain what you're doing before performing actions
2. Provide clear feedback about results and any errors
3. Suggest best practices for development workflows
4. Ask for clarification if commands might be destructive
5. Keep track of the current project state and context

SAFETY:
- Avoid executing potentially harmful commands
- Confirm before making significant changes
- Backup important data when appropriate
- Respect rate limits and resource constraints
```

## Connection Testing

### Basic Connectivity Tests

#### Test 1: Connector Status
```
"What's the status of the Disco MCP connector?"
```

**Expected Response**: Information about connection status, available tools, and server health.

#### Test 2: Container Creation
```
"Create a new development container and show me its initial state"
```

**Expected Response**: Container creation confirmation with container ID and initial directory listing.

#### Test 3: File Operations
```
"Create a file called test.js with a simple 'Hello World' console.log statement"
```

**Expected Response**: File creation confirmation and content verification.

#### Test 4: Terminal Operations
```
"Execute the command 'node --version' and show me the output"
```

**Expected Response**: Node.js version information from the container.

### Advanced Integration Tests

#### Test 5: Git Integration
```
"Clone the repository https://github.com/microsoft/TypeScript-Node-Starter and list its contents"
```

#### Test 6: Development Workflow
```
"Create a new React app, install dependencies, and start the development server"
```

#### Test 7: File Management
```
"Read the package.json file from the current project and explain its structure"
```

## Troubleshooting

### Common Issues

#### 1. Connector Not Found or Invalid URL

**Symptoms:**
- "Connector not found" error
- "Invalid URL" message
- Unable to add connector

**Solutions:**
✅ **Verify URL**: Ensure exact URL: `https://disco-mcp.up.railway.app/openapi.json`  
✅ **Check Subscription**: Confirm you have ChatGPT Plus/Pro/Team/Enterprise  
✅ **Try Incognito Mode**: Use private/incognito browsing to avoid cache issues  
✅ **Clear Cache**: Clear browser cache and cookies for ChatGPT  
✅ **Test URL Directly**: Open the URL in a new tab to verify it loads  
✅ **Check Server Status**: Visit https://disco-mcp.up.railway.app/health  

#### 2. Authentication Loop or Failure

**Symptoms:**
- Redirected to GitHub repeatedly
- "Authentication failed" messages
- OAuth errors

**Solutions:**
✅ **Clear Cookies**: Clear cookies for both ChatGPT and GitHub  
✅ **Try Different Browser**: Use a different browser or incognito mode  
✅ **Check GitHub Status**: Verify GitHub is accessible and functioning  
✅ **Disable Extensions**: Temporarily disable browser extensions  
✅ **Wait and Retry**: Sometimes OAuth needs a few minutes to propagate  

#### 3. Tools Not Available

**Symptoms:**
- Connector shows as connected but tools don't work
- "No tools available" responses
- Partial functionality

**Solutions:**
✅ **Restart Chat**: Start a new conversation in ChatGPT  
✅ **Verify Token**: Check token hasn't expired (tokens last 1 hour)  
✅ **Test Direct API**: Use curl to test API endpoints directly  
✅ **Check Permissions**: Ensure GitHub OAuth permissions were granted  
✅ **Regenerate Token**: Get a fresh token from the server  

#### 4. Rate Limiting Issues

**Symptoms:**
- "Rate limit exceeded" errors
- Slow response times
- Intermittent failures

**Solutions:**
✅ **Reduce Request Frequency**: Space out requests more  
✅ **Check Usage**: Monitor your API usage patterns  
✅ **Wait for Reset**: Rate limits reset every minute  
✅ **Contact Support**: For persistent rate limiting issues  

#### 5. Custom GPT Issues

**Symptoms:**
- Actions not working in custom GPT
- Authentication errors in GPT
- Schema import failures

**Solutions:**
✅ **Re-import Schema**: Delete and re-import the OpenAPI schema  
✅ **Update Token**: Refresh your JWT token in GPT settings  
✅ **Check Action Configuration**: Verify all actions are properly configured  
✅ **Test Individual Actions**: Test each action separately  

### Advanced Debugging

#### Enable Debug Mode
For detailed logging, add debug parameters to your requests:

```bash
# Test connector URL with debug info
curl -v "https://disco-mcp.up.railway.app/openapi.json"

# Test authentication
curl -H "Authorization: Bearer your-token" \
  "https://disco-mcp.up.railway.app/api/v1/auth/status"

# Test container creation
curl -X POST \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  "https://disco-mcp.up.railway.app/api/v1/containers"
```

#### Browser Developer Tools
1. **Open DevTools**: F12 or right-click → Inspect
2. **Check Network Tab**: Look for failed requests
3. **Check Console**: Look for JavaScript errors
4. **Check Application Tab**: Verify cookies and localStorage

## Success Indicators

### ChatGPT.com Connectors
- ✅ **Green "Connected" status** in ChatGPT connector settings
- ✅ **Disco appears in connector list** with proper name and description
- ✅ **No authentication errors** during OAuth flow
- ✅ **Tools are accessible** when ChatGPT lists available functions
- ✅ **API responses work correctly** when testing functionality

### Custom GPT Actions
- ✅ **All actions imported successfully** from OpenAPI schema
- ✅ **Authentication configured** with valid JWT token
- ✅ **Test runs pass** in GPT builder interface
- ✅ **GPT responds correctly** to development requests
- ✅ **No action execution errors** during normal usage

### General Health Checks
- ✅ **Server health endpoint** returns healthy status
- ✅ **OpenAPI schema loads** without errors
- ✅ **Authentication endpoint** validates tokens
- ✅ **No CORS errors** in browser console
- ✅ **Proper response times** (< 5 seconds for most operations)

## Performance Optimization

### Best Practices
1. **Batch Operations**: Combine multiple file operations when possible
2. **Reuse Containers**: Don't create new containers for every task
3. **Cache Tokens**: Store and reuse JWT tokens until expiration
4. **Monitor Usage**: Keep track of API usage to avoid rate limits
5. **Error Handling**: Implement proper retry logic for transient failures

### Rate Limiting Guidelines
- **Maximum 100 requests per minute** per user
- **Maximum 10 concurrent containers** per user
- **Container timeout**: 30 minutes of inactivity
- **Token expiry**: 1 hour (automatic refresh available)

## Getting Help

If you continue experiencing issues after following this guide:

1. **Check Server Status**: https://disco-mcp.up.railway.app/health
2. **Review Documentation**: https://disco-mcp.up.railway.app/docs
3. **Test API Endpoints**: Use the curl commands provided above
4. **GitHub Issues**: https://github.com/Arcane-Fly/disco/issues
5. **OpenAI Support**: For ChatGPT-specific connector issues

## Reference Links

- **Live Server**: https://disco-mcp.up.railway.app/
- **API Documentation**: https://disco-mcp.up.railway.app/docs
- **OpenAPI Schema**: https://disco-mcp.up.railway.app/openapi.json
- **Health Status**: https://disco-mcp.up.railway.app/health
- **GitHub Repository**: https://github.com/Arcane-Fly/disco
- **ChatGPT Help**: https://help.openai.com/en/articles/6825453-chatgpt-plugins

---

**Last Updated**: 2024-01-26  
**API Version**: 1.0.0  
**OpenAPI Version**: 3.0.0  
**Supported ChatGPT Plans**: Plus, Pro, Team, Enterprise