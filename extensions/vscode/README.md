# Disco MCP VS Code Extension

A Visual Studio Code extension that provides seamless integration with the Disco MCP (Model Control Plane) server, enabling direct access to WebContainer environments from within VS Code.

## Features

### 🚀 Container Management
- **Create containers** directly from VS Code
- **View all containers** in a dedicated tree view
- **Delete containers** when no longer needed
- **Real-time status monitoring** (running, stopped, error)

### 💻 Integrated Terminal
- **Native terminal integration** with Disco containers
- **Interactive command execution** with real-time output
- **Persistent terminal sessions** across VS Code restarts
- **Command history** and autocomplete support

### 📁 File Synchronization
- **Bidirectional file sync** between VS Code workspace and containers
- **Automatic sync** on file changes (configurable)
- **Manual sync** with progress indicators
- **Smart file filtering** (ignores node_modules, .git, etc.)

### 🔧 Git Integration
- **Repository operations** directly on containers
- **Git status** monitoring
- **Commit and push** capabilities
- **Clone repositories** into containers

## Installation

### From VSIX Package

1. Download the `.vsix` package from releases
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click the `...` menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

### Manual Installation

1. Clone this repository
2. Navigate to the extension directory:
   ```bash
   cd extensions/vscode
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Compile the extension:
   ```bash
   npm run compile
   ```
5. Press F5 to launch a new VS Code window with the extension loaded

## Configuration

### Required Settings

Configure the extension in VS Code settings (Ctrl+,):

```json
{
  "disco.serverUrl": "https://disco-mcp.up.railway.app",
  "disco.apiKey": "your-api-key-here"
}
```

### Optional Settings

```json
{
  "disco.autoSync": true,           // Auto-sync files on change
  "disco.syncInterval": 30          // Auto-sync interval in seconds
}
```

## Usage

### Getting Started

1. **Install and configure** the extension with your Disco MCP server URL and API key
2. **Connect to server** using Command Palette: `Disco: Connect to Disco MCP Server`
3. **View containers** in the Explorer sidebar under "Disco Containers"

### Creating Containers

1. Click the `+` icon in the Disco Containers view
2. Enter a name for your container
3. Wait for the container to be created and appear in the list

### Working with Containers

- **Open Terminal**: Click the terminal icon next to a container
- **Sync Files**: Click the sync icon to synchronize your workspace
- **Git Operations**: Access git functionality through the git icon
- **Delete Container**: Click the trash icon to remove a container

### File Synchronization

#### Manual Sync
- Right-click on a container and select "Sync Files"
- Or click the sync icon in the container tree view

#### Automatic Sync
- Enable `disco.autoSync` in settings
- Files will automatically sync whenever you save changes
- Configure sync interval with `disco.syncInterval`

### Terminal Integration

- Click the terminal icon next to any running container
- Interactive terminal opens with direct access to the container
- All commands execute in the container environment
- Terminal sessions persist across VS Code restarts

## Commands

Access these commands via Command Palette (Ctrl+Shift+P):

- `Disco: Connect to Disco MCP Server` - Establish connection
- `Disco: Disconnect from Server` - Close connection
- `Disco: Create New Container` - Create a new container
- `Disco: Refresh Containers` - Refresh the container list
- `Disco: Sync Files with Container` - Manual file synchronization

## Tree View Actions

The Disco Containers tree view provides quick access to:

- **Container Actions**:
  - Open Terminal
  - Sync Files
  - Git Status
  - File Explorer

- **Container Management**:
  - Create New Container
  - Delete Container
  - Refresh List

## Requirements

- **VS Code** version 1.74.0 or higher
- **Disco MCP Server** running and accessible
- **Valid API key** for authentication

## Development

### Building from Source

```bash
# Clone the repository
git clone <repo-url>
cd disco/extensions/vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch
```

### Extension Structure

```
src/
├── extension.ts          # Main extension entry point
├── client.ts            # Disco MCP API client
├── containerProvider.ts # Tree view provider for containers
├── terminalManager.ts   # Terminal integration
└── fileSyncManager.ts   # File synchronization logic
```

## API Integration

The extension integrates with the following Disco MCP API endpoints:

- **Authentication**: `/api/v1/auth/*`
- **Containers**: `/api/v1/containers/*`
- **Files**: `/api/v1/files/*`
- **Terminal**: `/api/v1/terminal/*`
- **Git**: `/api/v1/git/*`

## Troubleshooting

### Connection Issues

1. **Verify server URL** is correct and accessible
2. **Check API key** is valid and not expired
3. **Ensure network connectivity** to the Disco MCP server
4. **Review VS Code Output** panel for error messages

### Sync Issues

1. **Check file permissions** in your workspace
2. **Verify container is running** before attempting sync
3. **Review ignored file patterns** if files aren't syncing
4. **Check disk space** on both local and container environments

### Terminal Issues

1. **Ensure container is running** before opening terminal
2. **Check API connectivity** if commands don't execute
3. **Verify container status** in the tree view
4. **Restart VS Code** if terminal becomes unresponsive

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see the main project LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting guide above
2. Review the main project documentation
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ for seamless development workflows**