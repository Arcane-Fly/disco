# Disco MCP IntelliJ/WebStorm Plugin

An IntelliJ IDEA and WebStorm plugin for seamless integration with the Disco Model Control Plane (MCP) server, enabling direct access to WebContainer environments from within your IDE.

## Features

### 🚀 Container Management
- **Create and manage containers** directly from your IDE
- **View container status** in dedicated tool window
- **Monitor container health** and performance
- **Delete containers** when no longer needed

### 💻 Terminal Integration
- **Native terminal access** to container environments
- **Execute commands** with real-time output
- **Command history** and persistence
- **Multiple terminal sessions** per container

### 📁 File Synchronization
- **Bidirectional file sync** between project and containers
- **Automatic sync** on file changes (configurable)
- **Manual sync** with progress tracking
- **Smart file filtering** (excludes build artifacts, dependencies)

### 🔧 Git Integration
- **Repository operations** directly on containers
- **Git status monitoring** in tool window
- **Commit, push, pull** operations
- **Branch management** and tracking

## Requirements

- **IntelliJ IDEA** 2023.1+ or **WebStorm** 2023.1+
- **Java 17** or higher
- **Disco MCP Server** running and accessible
- **Valid API key** for authentication

## Installation

### From JetBrains Marketplace (Future)

1. Open IntelliJ IDEA or WebStorm
2. Go to **File** → **Settings** → **Plugins**
3. Search for "Disco MCP"
4. Click **Install**
5. Restart your IDE

### Manual Installation

1. Download the plugin JAR file from releases
2. Open IntelliJ IDEA or WebStorm
3. Go to **File** → **Settings** → **Plugins**
4. Click the gear icon and select **Install Plugin from Disk...**
5. Select the downloaded JAR file
6. Restart your IDE

### Building from Source

```bash
# Clone the repository
git clone <repo-url>
cd disco/extensions/intellij

# Build the plugin
mvn clean package

# The plugin JAR will be in target/disco-mcp-plugin-1.0.0.jar
```

## Configuration

### Initial Setup

1. Open **File** → **Settings** → **Tools** → **Disco MCP**
2. Configure your settings:
   - **Server URL**: Your Disco MCP server endpoint
   - **API Key**: Your authentication API key
   - **Auto Sync**: Enable automatic file synchronization
   - **Sync Interval**: How often to sync (in seconds)

### Example Configuration

```
Server URL: https://disco-mcp.up.railway.app
API Key: your-api-key-here
Auto Sync: true
Sync Interval: 30
```

## Usage

### Getting Started

1. **Install and configure** the plugin with your server details
2. **Open the Disco MCP tool window** (View → Tool Windows → Disco MCP)
3. **Connect to your server** using the connect button
4. **Start managing containers** directly from your IDE

### Container Management

#### Creating Containers
1. Click the **+** button in the Disco MCP tool window
2. Enter a name for your container
3. Wait for the container to be created and appear in the list

#### Working with Containers
- **Open Terminal**: Double-click a container or right-click → Open Terminal
- **Sync Files**: Right-click a container → Sync Files
- **Git Operations**: Right-click a container → Git Status/Operations
- **Delete Container**: Right-click a container → Delete

### File Synchronization

#### Manual Sync
- Right-click on a container in the tool window
- Select "Sync Files with Container"
- Monitor progress in the IDE status bar

#### Automatic Sync
- Enable "Auto Sync" in plugin settings
- Files will automatically sync when you save changes
- Configure sync interval in settings

### Terminal Integration

- **Open Terminal**: Double-click any running container
- **Interactive terminal** opens with direct container access
- **Multiple sessions**: Open multiple terminals per container
- **Command persistence**: Terminal history is maintained

## Tool Window

The Disco MCP tool window provides:

### Container List
- **Status indicators**: Running (green), stopped (red), error (yellow)
- **Container details**: Name, ID, creation time
- **Context menu**: Right-click for available actions

### Toolbar Actions
- **Connect/Disconnect**: Manage server connection
- **Create Container**: Add new containers
- **Refresh**: Update container list
- **Settings**: Quick access to configuration

## Actions and Shortcuts

### Menu Actions
Access via **Tools** → **Disco MCP**:
- Connect to Disco MCP Server
- Disconnect from Server
- Create New Container
- Sync Files with Container
- Open Container Terminal

### Context Menu Actions
Right-click on containers for:
- Open Terminal
- Sync Files
- Git Status
- Delete Container

## Development

### Project Structure

```
src/main/kotlin/io/disco/mcp/plugin/
├── api/                 # API client and data classes
├── actions/            # IDE actions and commands
├── config/             # Configuration and settings
├── services/           # Application and project services
├── sync/               # File synchronization logic
├── terminal/           # Terminal integration
├── ui/                 # User interface components
└── listeners/          # Event listeners
```

### Building and Testing

```bash
# Compile the plugin
mvn compile

# Run tests
mvn test

# Package for distribution
mvn package

# Run in development IDE
mvn intellij:run
```

### Development Environment

- **Kotlin** for plugin implementation
- **Maven** for build management
- **IntelliJ Platform SDK** for IDE integration
- **OkHttp** for HTTP client
- **Gson** for JSON serialization

## Troubleshooting

### Connection Issues

1. **Verify server URL** is correct and accessible
2. **Check API key** is valid and not expired
3. **Test network connectivity** to the Disco MCP server
4. **Review IDE logs** for detailed error messages

### Sync Issues

1. **Check file permissions** in your project
2. **Verify container is running** before attempting sync
3. **Review sync settings** in plugin configuration
4. **Check available disk space** on both local and container

### Plugin Issues

1. **Restart your IDE** if plugin becomes unresponsive
2. **Check IDE compatibility** (2023.1+ required)
3. **Review plugin logs** in IDE log directory
4. **Reinstall plugin** if problems persist

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests where appropriate
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

**Built for seamless WebContainer development workflows in JetBrains IDEs**