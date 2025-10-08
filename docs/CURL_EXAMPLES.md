# Curl Examples & SDK Integration Samples

Complete collection of practical examples for integrating with the Disco MCP Server using curl commands and various SDKs.

## Table of Contents

- [Authentication Examples](#authentication)
- [Container Management](#container-management) 
- [File Operations](#file-operations)
- [Terminal Commands](#terminal-commands)
- [Git Operations](#git-operations)
- [Computer Use](#computer-use)
- [SDK Integration Examples](#sdk-integration)

## Authentication

### GitHub OAuth Flow
```bash
# Step 1: Initiate OAuth flow
curl -I "https://disco-mcp.up.railway.app/api/v1/auth/github"

# Step 2: After completing OAuth in browser, verify token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/auth/verify"
```

### Token Refresh
```bash
# Refresh an expired token
curl -X POST "https://disco-mcp.up.railway.app/api/v1/auth/refresh" \
  -H "Authorization: Bearer YOUR_EXPIRED_TOKEN" \
  -H "Content-Type: application/json"
```

## Container Management

### Create Container
```bash
# Basic container creation
curl -X POST "https://disco-mcp.up.railway.app/api/v1/containers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "preWarm": true,
      "template": "node"
    }
  }'
```

### List Containers
```bash
# Get all containers for authenticated user
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/containers"
```

### Get Container Status
```bash
# Check specific container status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/containers/CONTAINER_ID"
```

### Delete Container
```bash
# Clean up container
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/containers/CONTAINER_ID"
```

## File Operations

### List Files
```bash
# List files in container root
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/files/CONTAINER_ID?path=/"

# List files in specific directory
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/files/CONTAINER_ID?path=/src"
```

### Read File
```bash
# Read file contents
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/files/CONTAINER_ID/content?path=/package.json"
```

### Create/Update File
```bash
# Create a new file
curl -X POST "https://disco-mcp.up.railway.app/api/v1/files/CONTAINER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/src/hello.js",
    "content": "console.log(\"Hello, World!\");",
    "encoding": "utf-8"
  }'

# Create a package.json
curl -X POST "https://disco-mcp.up.railway.app/api/v1/files/CONTAINER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/package.json",
    "content": "{\n  \"name\": \"my-project\",\n  \"version\": \"1.0.0\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"start\": \"node index.js\",\n    \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"\n  }\n}",
    "encoding": "utf-8"
  }'
```

### Delete File
```bash
# Delete a file
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/files/CONTAINER_ID?path=/src/old-file.js"
```

## Terminal Commands

### Execute Command
```bash
# Run a simple command
curl -X POST "https://disco-mcp.up.railway.app/api/v1/terminal/CONTAINER_ID/execute" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "node --version",
    "cwd": "/"
  }'

# Install npm packages
curl -X POST "https://disco-mcp.up.railway.app/api/v1/terminal/CONTAINER_ID/execute" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "npm install express cors",
    "cwd": "/",
    "env": {
      "NODE_ENV": "development"
    }
  }'

# Run a development server
curl -X POST "https://disco-mcp.up.railway.app/api/v1/terminal/CONTAINER_ID/execute" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "npm run dev",
    "cwd": "/"
  }'
```

### Stream Command Output
```bash
# Stream a long-running command (use Server-Sent Events)
curl -X POST "https://disco-mcp.up.railway.app/api/v1/terminal/CONTAINER_ID/stream" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "command": "npm run build",
    "cwd": "/"
  }'
```

### Get Command History
```bash
# View terminal history
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/terminal/CONTAINER_ID/history"
```

## Git Operations

### Clone Repository
```bash
# Clone a public repository
curl -X POST "https://disco-mcp.up.railway.app/api/v1/git/CONTAINER_ID/clone" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/microsoft/vscode.git",
    "branch": "main",
    "directory": "."
  }'

# Clone a private repository with token
curl -X POST "https://disco-mcp.up.railway.app/api/v1/git/CONTAINER_ID/clone" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/user/private-repo.git",
    "branch": "main",
    "authToken": "ghp_xxxxxxxxxxxx",
    "directory": "."
  }'
```

### Commit Changes
```bash
# Stage and commit files
curl -X POST "https://disco-mcp.up.railway.app/api/v1/git/CONTAINER_ID/commit" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add new feature implementation",
    "files": ["src/feature.js", "README.md"],
    "author": {
      "name": "Developer Name",
      "email": "developer@example.com"
    }
  }'
```

### Push Changes
```bash
# Push to remote repository
curl -X POST "https://disco-mcp.up.railway.app/api/v1/git/CONTAINER_ID/push" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "remote": "origin",
    "branch": "main",
    "authToken": "ghp_xxxxxxxxxxxx"
  }'
```

### Pull Changes
```bash
# Pull latest changes
curl -X POST "https://disco-mcp.up.railway.app/api/v1/git/CONTAINER_ID/pull" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "remote": "origin",
    "branch": "main"
  }'
```

### Get Repository Status
```bash
# Check git status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://disco-mcp.up.railway.app/api/v1/git/CONTAINER_ID/status"
```

## Computer Use

### Take Screenshot
```bash
# Capture current screen
curl -X POST "https://disco-mcp.up.railway.app/api/v1/computer-use/screenshot" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "png",
    "quality": 80
  }'
```

### Click Action
```bash
# Click at coordinates
curl -X POST "https://disco-mcp.up.railway.app/api/v1/computer-use/click" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "x": 100,
    "y": 200,
    "button": "left"
  }'
```

### Type Text
```bash
# Type text into active element
curl -X POST "https://disco-mcp.up.railway.app/api/v1/computer-use/type" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, World!"
  }'
```

### Send Key Press
```bash
# Send keyboard shortcut
curl -X POST "https://disco-mcp.up.railway.app/api/v1/computer-use/key" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "ctrl+s"
  }'
```

## Health and Status

### Server Health
```bash
# Basic health check
curl "https://disco-mcp.up.railway.app/health"

# Detailed metrics
curl "https://disco-mcp.up.railway.app/health/metrics"

# Readiness probe
curl "https://disco-mcp.up.railway.app/health/ready"

# Liveness probe  
curl "https://disco-mcp.up.railway.app/health/live"
```

### Service Capabilities
```bash
# Get supported capabilities
curl "https://disco-mcp.up.railway.app/capabilities"
```

## SDK Integration Examples

### Node.js SDK

```javascript
// mcp-client.js
const axios = require('axios');

class DiscoMCPClient {
  constructor(baseUrl = 'https://disco-mcp.up.railway.app', token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.containerId = null;
  }

  // Authentication
  async authenticate(token) {
    this.token = token;
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Container management
  async createContainer(options = {}) {
    const response = await axios.post(`${this.baseUrl}/api/v1/containers`, 
      { options },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    this.containerId = response.data.data.containerId;
    return response.data;
  }

  async listContainers() {
    const response = await axios.get(`${this.baseUrl}/api/v1/containers`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  // File operations
  async writeFile(path, content, containerId = this.containerId) {
    const response = await axios.post(`${this.baseUrl}/api/v1/files/${containerId}`, {
      path,
      content,
      encoding: 'utf-8'
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  async readFile(path, containerId = this.containerId) {
    const response = await axios.get(`${this.baseUrl}/api/v1/files/${containerId}/content`, {
      params: { path },
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  async listFiles(path = '/', containerId = this.containerId) {
    const response = await axios.get(`${this.baseUrl}/api/v1/files/${containerId}`, {
      params: { path },
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  // Terminal operations
  async executeCommand(command, cwd = '/', env = {}, containerId = this.containerId) {
    const response = await axios.post(`${this.baseUrl}/api/v1/terminal/${containerId}/execute`, {
      command,
      cwd,
      env
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  // Git operations
  async cloneRepository(url, branch = 'main', directory = '.', authToken = null, containerId = this.containerId) {
    const payload = { url, branch, directory };
    if (authToken) payload.authToken = authToken;

    const response = await axios.post(`${this.baseUrl}/api/v1/git/${containerId}/clone`, payload, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  async commitChanges(message, files = [], author = {}, containerId = this.containerId) {
    const response = await axios.post(`${this.baseUrl}/api/v1/git/${containerId}/commit`, {
      message,
      files,
      author
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }

  // Development workflow helper
  async createReactApp(projectName) {
    await this.createContainer();
    
    // Create React app
    await this.executeCommand(`npx create-react-app ${projectName}`);
    
    // Navigate to project directory
    await this.executeCommand(`cd ${projectName} && npm start`);
    
    return { containerId: this.containerId, projectName };
  }

  // Express.js setup helper
  async setupExpressApp(appName) {
    await this.createContainer();
    
    // Initialize npm project
    await this.executeCommand('npm init -y');
    
    // Install Express
    await this.executeCommand('npm install express cors helmet');
    
    // Create basic server file
    const serverCode = `
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from ${appName}!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
`;

    await this.writeFile('server.js', serverCode);
    
    // Update package.json scripts
    const packageJson = await this.readFile('package.json');
    const pkg = JSON.parse(packageJson.data.content);
    pkg.scripts.start = 'node server.js';
    pkg.scripts.dev = 'nodemon server.js';
    
    await this.writeFile('package.json', JSON.stringify(pkg, null, 2));
    
    return { containerId: this.containerId, appName };
  }
}

module.exports = DiscoMCPClient;

// Usage example
async function example() {
  const client = new DiscoMCPClient();
  
  try {
    // Authenticate
    await client.authenticate('your-jwt-token-here');
    
    // Create Express app
    const app = await client.setupExpressApp('my-api');
    console.log('Express app created:', app);
    
    // Start the server
    const result = await client.executeCommand('npm start');
    console.log('Server started:', result.data.output);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Python SDK

```python
# disco_mcp_client.py
import requests
import json
from typing import Optional, Dict, List, Any

class DiscoMCPClient:
    def __init__(self, base_url: str = 'https://disco-mcp.up.railway.app', token: Optional[str] = None):
        self.base_url = base_url
        self.token = token
        self.container_id = None
        self.session = requests.Session()
    
    def authenticate(self, token: str) -> Dict[str, Any]:
        """Authenticate with the MCP server"""
        self.token = token
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        response = self.session.get(f'{self.base_url}/api/v1/auth/verify')
        response.raise_for_status()
        return response.json()
    
    def create_container(self, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a new container"""
        if options is None:
            options = {"preWarm": True, "template": "node"}
        
        response = self.session.post(f'{self.base_url}/api/v1/containers', json={"options": options})
        response.raise_for_status()
        
        data = response.json()
        self.container_id = data['data']['containerId']
        return data
    
    def list_containers(self) -> Dict[str, Any]:
        """List all containers"""
        response = self.session.get(f'{self.base_url}/api/v1/containers')
        response.raise_for_status()
        return response.json()
    
    def write_file(self, path: str, content: str, container_id: Optional[str] = None) -> Dict[str, Any]:
        """Write content to a file"""
        cid = container_id or self.container_id
        payload = {
            "path": path,
            "content": content,
            "encoding": "utf-8"
        }
        
        response = self.session.post(f'{self.base_url}/api/v1/files/{cid}', json=payload)
        response.raise_for_status()
        return response.json()
    
    def read_file(self, path: str, container_id: Optional[str] = None) -> Dict[str, Any]:
        """Read file contents"""
        cid = container_id or self.container_id
        response = self.session.get(f'{self.base_url}/api/v1/files/{cid}/content', params={"path": path})
        response.raise_for_status()
        return response.json()
    
    def list_files(self, path: str = '/', container_id: Optional[str] = None) -> Dict[str, Any]:
        """List files in directory"""
        cid = container_id or self.container_id
        response = self.session.get(f'{self.base_url}/api/v1/files/{cid}', params={"path": path})
        response.raise_for_status()
        return response.json()
    
    def execute_command(self, command: str, cwd: str = '/', env: Dict[str, str] = None, 
                       container_id: Optional[str] = None) -> Dict[str, Any]:
        """Execute a command in the container"""
        cid = container_id or self.container_id
        payload = {
            "command": command,
            "cwd": cwd,
            "env": env or {}
        }
        
        response = self.session.post(f'{self.base_url}/api/v1/terminal/{cid}/execute', json=payload)
        response.raise_for_status()
        return response.json()
    
    def clone_repository(self, url: str, branch: str = 'main', directory: str = '.', 
                        auth_token: Optional[str] = None, container_id: Optional[str] = None) -> Dict[str, Any]:
        """Clone a git repository"""
        cid = container_id or self.container_id
        payload = {
            "url": url,
            "branch": branch,
            "directory": directory
        }
        if auth_token:
            payload["authToken"] = auth_token
        
        response = self.session.post(f'{self.base_url}/api/v1/git/{cid}/clone', json=payload)
        response.raise_for_status()
        return response.json()
    
    def setup_fastapi_app(self, app_name: str) -> Dict[str, Any]:
        """Helper method to set up a FastAPI application"""
        self.create_container()
        
        # Create requirements.txt
        requirements = """fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
"""
        self.write_file('requirements.txt', requirements)
        
        # Create main.py
        main_py = f'''
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="{app_name}", version="1.0.0")

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/")
async def root():
    return {{"message": "Hello from {app_name}!"}}

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="healthy", message="Service is running")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''
        self.write_file('main.py', main_py)
        
        # Install dependencies
        self.execute_command('pip install -r requirements.txt')
        
        return {"container_id": self.container_id, "app_name": app_name}

# Usage example
if __name__ == "__main__":
    client = DiscoMCPClient()
    
    # Authenticate
    client.authenticate('your-jwt-token-here')
    
    # Create FastAPI app
    app_info = client.setup_fastapi_app('my-api')
    print(f"FastAPI app created: {app_info}")
    
    # Start the server
    result = client.execute_command('python main.py')
    print(f"Server output: {result['data']['output']}")
```

### Bash/Shell Integration

```bash
#!/bin/bash
# disco-mcp-helper.sh - Shell helper functions

# Configuration
DISCO_BASE_URL="https://disco-mcp.up.railway.app"
DISCO_TOKEN="${DISCO_MCP_TOKEN}"

# Helper function to make authenticated requests
disco_api() {
  local method="$1"
  local endpoint="$2"
  local data="$3"
  
  if [ "$method" = "GET" ]; then
    curl -s -H "Authorization: Bearer $DISCO_TOKEN" \
      "$DISCO_BASE_URL$endpoint"
  else
    curl -s -X "$method" \
      -H "Authorization: Bearer $DISCO_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$DISCO_BASE_URL$endpoint"
  fi
}

# Create and setup a new container
disco_create_container() {
  local template="${1:-node}"
  echo "Creating container with template: $template"
  
  local response=$(disco_api "POST" "/api/v1/containers" "{\"options\":{\"template\":\"$template\"}}")
  local container_id=$(echo "$response" | jq -r '.data.containerId')
  
  if [ "$container_id" != "null" ]; then
    echo "Container created: $container_id"
    echo "$container_id" > ~/.disco_container_id
    export DISCO_CONTAINER_ID="$container_id"
  else
    echo "Failed to create container: $response"
    return 1
  fi
}

# Execute command in current container
disco_exec() {
  local container_id="${DISCO_CONTAINER_ID:-$(cat ~/.disco_container_id 2>/dev/null)}"
  local command="$*"
  
  if [ -z "$container_id" ]; then
    echo "No container ID found. Create a container first with disco_create_container"
    return 1
  fi
  
  local data=$(jq -n --arg cmd "$command" '{command: $cmd, cwd: "/"}')
  local response=$(disco_api "POST" "/api/v1/terminal/$container_id/execute" "$data")
  
  echo "$response" | jq -r '.data.output'
}

# Upload file to container
disco_upload() {
  local local_file="$1"
  local remote_path="$2"
  local container_id="${DISCO_CONTAINER_ID:-$(cat ~/.disco_container_id 2>/dev/null)}"
  
  if [ ! -f "$local_file" ]; then
    echo "File not found: $local_file"
    return 1
  fi
  
  local content=$(cat "$local_file")
  local data=$(jq -n --arg path "$remote_path" --arg content "$content" \
    '{path: $path, content: $content, encoding: "utf-8"}')
  
  disco_api "POST" "/api/v1/files/$container_id" "$data"
}

# Download file from container
disco_download() {
  local remote_path="$1"
  local local_file="$2"
  local container_id="${DISCO_CONTAINER_ID:-$(cat ~/.disco_container_id 2>/dev/null)}"
  
  local response=$(disco_api "GET" "/api/v1/files/$container_id/content?path=$remote_path")
  local content=$(echo "$response" | jq -r '.data.content')
  
  if [ "$content" != "null" ]; then
    echo "$content" > "$local_file"
    echo "Downloaded: $remote_path -> $local_file"
  else
    echo "Failed to download file: $response"
    return 1
  fi
}

# Quick project setup functions
disco_setup_react() {
  local project_name="$1"
  disco_create_container "node"
  disco_exec "npx create-react-app $project_name"
  disco_exec "cd $project_name && npm start"
}

disco_setup_express() {
  local project_name="$1"
  disco_create_container "node"
  disco_exec "mkdir $project_name && cd $project_name"
  disco_exec "cd $project_name && npm init -y"
  disco_exec "cd $project_name && npm install express cors helmet"
  
  # Create basic server file
  cat > "/tmp/server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF
  
  disco_upload "/tmp/server.js" "/$project_name/server.js"
  disco_exec "cd $project_name && node server.js"
}

# Usage examples:
# disco_create_container
# disco_exec "node --version"
# disco_setup_react "my-react-app"
# disco_setup_express "my-api"
```

## Complete Workflow Examples

### Full Stack Development Workflow
```bash
# 1. Authenticate and create container
export DISCO_MCP_TOKEN="your-jwt-token-here"
curl -X POST "https://disco-mcp.up.railway.app/api/v1/containers" \
  -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"options":{"template":"node"}}' | jq .

# 2. Clone repository
curl -X POST "https://disco-mcp.up.railway.app/api/v1/git/CONTAINER_ID/clone" \
  -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/user/project.git",
    "branch": "main"
  }'

# 3. Install dependencies
curl -X POST "https://disco-mcp.up.railway.app/api/v1/terminal/CONTAINER_ID/execute" \
  -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "npm install"}'

# 4. Run tests
curl -X POST "https://disco-mcp.up.railway.app/api/v1/terminal/CONTAINER_ID/execute" \
  -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "npm test"}'

# 5. Start development server
curl -X POST "https://disco-mcp.up.railway.app/api/v1/terminal/CONTAINER_ID/execute" \
  -H "Authorization: Bearer $DISCO_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "npm run dev"}'
```

---

**📋 Note**: Replace `YOUR_JWT_TOKEN` and `CONTAINER_ID` with actual values from your authenticated session.

**🔗 Get your token**: Visit https://disco-mcp.up.railway.app/ and login with GitHub.