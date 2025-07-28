# Disco MCP IntelliJ Plugin

This plugin provides seamless integration between IntelliJ IDEA/WebStorm and the Disco Model Control Plane (MCP) server for WebContainer development environments.

## Features

### ✅ Completed Core Features
- **Container Management** - Create, list, and monitor WebContainers
- **API Integration** - Complete HTTP client with all MCP endpoints
- **Settings Panel** - Native IntelliJ configuration interface
- **Tool Window** - Dedicated UI for container operations
- **Terminal Integration** - Custom command handlers for container access
- **File Synchronization** - Automatic and manual file sync with containers
- **Project Services** - Proper IntelliJ service architecture

### 🎯 Key Components

#### API Client (`DiscoMCPClient`)
- Full HTTP client implementation
- Container lifecycle management (create, delete, list)
- File operations (read, write, delete, list)
- Command execution with output streaming
- Git integration for repository operations

#### UI Components
- **Tool Window**: Container tree view with status indicators
- **Settings Panel**: Server configuration and API key management
- **Toolbar Actions**: Connect, disconnect, create container, sync files

#### Services Architecture
- **Application Service**: Global plugin state and configuration
- **Project Service**: Project-specific container selection and sync settings

#### Terminal Integration
- Custom command handler for `disco exec <container-id> <command>`
- Direct container command execution from IDE terminal

#### File Synchronization
- Automatic sync on file save (when enabled)
- Manual sync actions through context menus
- Bidirectional file operations with conflict detection

## Installation

### Method 1: Manual Installation (Current)

1. **Download Plugin JAR**
   ```bash
   # The built plugin is located at:
   extensions/intellij/dist/disco-mcp-plugin.jar
   ```

2. **Install in IntelliJ**
   - Open IntelliJ IDEA or WebStorm
   - Go to `File > Settings > Plugins`
   - Click the gear icon (⚙️) and select `Install Plugin from Disk...`
   - Navigate to and select `disco-mcp-plugin.jar`
   - Click `OK` and restart the IDE

3. **Verify Installation**
   - After restart, check `Tools > Disco MCP` menu
   - Look for "Disco MCP" tool window on the right panel

### Method 2: JetBrains Marketplace (Future)
*The plugin will be published to the JetBrains Plugin Repository for easy installation.*

## Configuration

### Initial Setup

1. **Open Settings**
   - Go to `File > Settings > Tools > Disco MCP`

2. **Configure Server Connection**
   - **Server URL**: Your Disco MCP server URL (e.g., `http://localhost:3000`)
   - **API Key**: Your authentication key for the MCP server
   - **Auto-Sync**: Enable automatic file synchronization (optional)

3. **Test Connection**
   - Click `Test Connection` to verify server connectivity
   - Save settings when connection is successful

### Project Configuration

1. **Select Container**
   - Open the "Disco MCP" tool window
   - Click `Connect` to establish server connection
   - Select a container from the list for your current project

2. **Configure Sync Settings**
   - Enable/disable auto-sync per project
   - Set sync exclusions if needed

## Usage

### Container Management

#### Creating Containers
```
Tools > Disco MCP > Create New Container
```
- Enter container name
- Container will be created and appear in the tool window

#### Connecting to Containers
```
Disco MCP Tool Window > Select Container > Connect
```
- Choose container from the list
- Container becomes active for the current project

#### Container Operations
- **Status Monitoring**: Real-time container status in tool window
- **Terminal Access**: Right-click container → "Open Terminal"
- **File Management**: Browse and manage container files

### File Synchronization

#### Automatic Sync
When enabled, files are automatically synced to the selected container on save:
```kotlin
// File changes are automatically detected and synced
// No manual intervention required
```

#### Manual Sync
```
Right-click in Project View > Disco MCP > Sync Files with Container
```
or
```
Tools > Disco MCP > Sync Files with Container
```

#### Sync Behavior
- **Upload**: Local changes pushed to container
- **Conflict Detection**: Warns about conflicting changes
- **Selective Sync**: Sync specific files or directories

### Terminal Integration

#### Using Disco Commands
In the IntelliJ terminal, use custom disco commands:
```bash
# Execute command in selected container
disco exec <container-id> ls -la

# Example: Run npm install in container
disco exec myapp-container npm install

# Example: Start development server
disco exec myapp-container npm run dev
```

#### Standard Terminal
Regular terminal commands work normally alongside disco commands.

### Development Workflow

#### Typical Workflow
1. **Setup**: Configure server connection and select container
2. **Development**: Write code with automatic file sync
3. **Testing**: Use terminal integration to run commands in container
4. **Monitoring**: Track container status through tool window

#### Best Practices
- **Container Selection**: Choose appropriate container per project
- **Sync Management**: Use auto-sync for active development
- **Terminal Usage**: Leverage disco commands for container operations
- **Status Monitoring**: Keep an eye on container health

## Troubleshooting

### Connection Issues
- **Server Unreachable**: Check server URL and network connectivity
- **Authentication Failed**: Verify API key is correct
- **Timeout**: Increase timeout in advanced settings

### Sync Problems
- **File Not Syncing**: Check auto-sync is enabled and container is selected
- **Permission Errors**: Verify container file permissions
- **Conflicts**: Resolve conflicts manually through the UI

### Plugin Issues
- **Menu Missing**: Verify plugin is installed and enabled
- **Tool Window Not Visible**: Check View > Tool Windows > Disco MCP
- **Actions Disabled**: Ensure server connection is established

## Architecture Notes

### Service Layer
The plugin follows IntelliJ Platform patterns:
- **Application Service**: Global state management
- **Project Service**: Project-specific operations
- **Configuration Components**: Persistent settings

### API Integration
- **HTTP Client**: OkHttp-based implementation
- **JSON Serialization**: Gson for data marshaling
- **Coroutines**: Asynchronous operations with Kotlin coroutines

### UI Framework
- **Tool Window**: Custom factory and content provider
- **Actions**: Standard IntelliJ action framework
- **Settings**: Native configuration UI components

## Development

### Building from Source
```bash
cd extensions/intellij
./build.sh
```

### Project Structure
```
src/main/kotlin/io/disco/mcp/plugin/
├── api/                 # HTTP client and data models
├── actions/             # IDE actions (Connect, Sync, etc.)
├── config/              # Settings and configuration
├── services/            # Application and project services
├── ui/                  # Tool window and UI components
├── terminal/            # Terminal command handlers
├── sync/                # File synchronization logic
└── listeners/           # Event listeners
```

## Requirements

- **IntelliJ IDEA**: 2023.1+ (Community or Ultimate)
- **WebStorm**: 2023.1+
- **Java**: 17+
- **Disco MCP Server**: Running and accessible instance

## Support

For issues and feature requests, please refer to the main Disco MCP repository:
- **Repository**: https://github.com/Arcane-Fly/disco
- **Issues**: https://github.com/Arcane-Fly/disco/issues

## Roadmap

### Completed (Phase 4 - Week 3-4)
- ✅ Core plugin architecture
- ✅ Complete API integration
- ✅ UI framework and tool window
- ✅ Terminal integration framework
- ✅ File sync implementation
- ✅ Build system and packaging

### Future Enhancements
- 🔄 JetBrains Marketplace publication
- 🔄 Advanced conflict resolution
- 🔄 Real-time collaboration features
- 🔄 Enhanced debugging integration
- 🔄 Performance optimizations