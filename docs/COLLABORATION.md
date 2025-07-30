# Real-time Collaboration Features - Implementation Guide

## Overview

The Disco MCP Server now includes comprehensive real-time collaboration features that enable multiple users to work together on the same files within WebContainers. This implementation follows the Phase 4 roadmap specifications and provides WebSocket-based real-time synchronization, multi-user editing support, and conflict resolution mechanisms.

## Features Implemented

### 1. WebSocket-based Real-time Sync ✅
- Real-time file synchronization between all connected users
- Automatic propagation of file changes to collaborators
- Event-driven architecture using Socket.IO
- Session-based collaboration with automatic cleanup

### 2. Multi-user Editing Support ✅
- Multiple users can simultaneously edit files in the same container
- User presence awareness and cursor position sharing
- File locking mechanism to prevent simultaneous edits
- User join/leave notifications

### 3. Conflict Resolution Mechanisms ✅
- Version-based conflict detection
- Last-write-wins strategy for automatic resolution
- Conflict notification system for manual resolution
- Rollback capabilities for problematic changes

## API Endpoints

### Collaboration Management

#### GET `/api/v1/collaboration/{containerId}/sessions`
Get active collaboration sessions for a container.

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "filePath": "/path/to/file.txt",
      "users": ["user1", "user2"],
      "lastModified": "2024-01-26T10:30:00Z",
      "version": 5,
      "userCount": 2
    }
  ]
}
```

#### POST `/api/v1/collaboration/{containerId}/broadcast`
Broadcast a system message to all collaborators.

**Request:**
```json
{
  "message": "System maintenance in 5 minutes"
}
```

#### POST `/api/v1/collaboration/{containerId}/sync`
Manually sync file content to all collaborators.

**Request:**
```json
{
  "filePath": "/path/to/file.txt",
  "content": "updated file content",
  "excludeUserId": "user-to-exclude"
}
```

#### GET `/api/v1/collaboration/session/{sessionId}/users`
Get users in a specific collaboration session.

## WebSocket Events

### Client → Server Events

#### `join-collaboration`
Join a collaboration session for a specific file.
```javascript
socket.emit('join-collaboration', {
  containerId: 'container-123',
  filePath: '/src/index.js',
  userId: 'user-456'
});
```

#### `leave-collaboration`
Leave a collaboration session.
```javascript
socket.emit('leave-collaboration', {
  sessionId: 'session-uuid',
  userId: 'user-456'
});
```

#### `file-update`
Send file content updates to other users.
```javascript
socket.emit('file-update', {
  sessionId: 'session-uuid',
  content: 'updated file content',
  userId: 'user-456',
  version: 3
});
```

#### `file-lock`
Lock or unlock a file for editing.
```javascript
socket.emit('file-lock', {
  sessionId: 'session-uuid',
  filePath: '/src/index.js',
  userId: 'user-456',
  lock: true
});
```

#### `cursor-position`
Share cursor position with other users.
```javascript
socket.emit('cursor-position', {
  sessionId: 'session-uuid',
  userId: 'user-456',
  position: { line: 42, column: 15 }
});
```

### Server → Client Events

#### `collaboration-state`
Receive current collaboration state when joining.
```javascript
socket.on('collaboration-state', (data) => {
  console.log('Session ID:', data.sessionId);
  console.log('Current content:', data.content);
  console.log('Version:', data.version);
  console.log('Active users:', data.users);
  console.log('File locks:', data.locks);
});
```

#### `user-joined`
Notification when a user joins the session.
```javascript
socket.on('user-joined', (data) => {
  console.log(`User ${data.userId} joined session ${data.sessionId}`);
  console.log(`Total users: ${data.userCount}`);
});
```

#### `user-left`
Notification when a user leaves the session.
```javascript
socket.on('user-left', (data) => {
  console.log(`User ${data.userId} left session ${data.sessionId}`);
});
```

#### `file-updated`
Receive file updates from other users.
```javascript
socket.on('file-updated', (data) => {
  console.log('File updated by:', data.userId);
  console.log('New content:', data.content);
  console.log('Version:', data.version);
  // Update editor content
});
```

#### `conflict-detected`
Handle version conflicts.
```javascript
socket.on('conflict-detected', (data) => {
  console.log('Conflict detected in session:', data.sessionId);
  console.log('Resolution:', data.resolution);
  console.log('Current version:', data.currentVersion);
  // Handle conflict resolution
});
```

#### `file-lock-changed`
File lock status updates.
```javascript
socket.on('file-lock-changed', (data) => {
  console.log(`File ${data.filePath} ${data.locked ? 'locked' : 'unlocked'} by ${data.userId}`);
});
```

#### `cursor-moved`
Other users' cursor position updates.
```javascript
socket.on('cursor-moved', (data) => {
  console.log(`User ${data.userId} cursor at line ${data.position.line}, column ${data.position.column}`);
  // Update cursor display
});
```

## Integration with File Operations

The collaboration system automatically integrates with existing file operations:

1. **Automatic Sync**: When files are updated via REST API, changes are automatically synced to all collaborators
2. **Non-blocking**: Collaboration sync failures don't affect the main file operation
3. **User Exclusion**: The user making the change is excluded from receiving their own updates

## Usage Examples

### Basic Collaboration Setup

```javascript
import io from 'socket.io-client';

const socket = io('https://disco-mcp.up.railway.app');

// Join collaboration for a file
socket.emit('join-collaboration', {
  containerId: 'my-container',
  filePath: '/src/app.js',
  userId: 'alice'
});

// Listen for file updates
socket.on('file-updated', (data) => {
  if (data.userId !== 'alice') {
    // Update editor with new content
    editor.setValue(data.content);
  }
});

// Send file updates
function updateFile(content) {
  socket.emit('file-update', {
    sessionId: currentSessionId,
    content: content,
    userId: 'alice',
    version: currentVersion
  });
}
```

### File Locking

```javascript
// Lock file before editing
socket.emit('file-lock', {
  sessionId: sessionId,
  filePath: '/src/app.js',
  userId: 'alice',
  lock: true
});

// Listen for lock failures
socket.on('lock-failed', (data) => {
  alert(`File is locked by ${data.lockedBy}`);
});

// Unlock when done editing
socket.emit('file-lock', {
  sessionId: sessionId,
  filePath: '/src/app.js',
  userId: 'alice',
  lock: false
});
```

## Technical Implementation

### Architecture
- **CollaborationManager**: Central service managing all collaboration sessions
- **Session Management**: Per-file collaboration sessions with user tracking
- **Event-driven**: WebSocket events for real-time communication
- **Integration**: Hooks into existing file operations for automatic sync

### Conflict Resolution
Currently implements a "last-write-wins" strategy with:
- Version-based conflict detection
- Automatic resolution for simple conflicts
- Notification system for complex conflicts
- Future: Support for more sophisticated merge strategies

### Performance Considerations
- **Memory Usage**: Sessions are cleaned up when empty
- **Network**: Only sends diffs for large files (planned enhancement)
- **Scalability**: Designed to work with Redis for multi-instance deployments

## Roadmap Status Update

✅ **Phase 4, Week 3-4: Developer Experience - Real-time Collaboration Complete**
- WebSocket-based real-time sync: ✅ Implemented
- Multi-user editing support: ✅ Implemented
- Conflict resolution mechanisms: ✅ Basic implementation

**Next Steps:**
- [ ] Code Synchronization and Conflict Resolution (advanced merge strategies)
- [ ] Integration Testing and Documentation
- [ ] Enhanced merge conflict resolution UI
- [ ] Performance optimization for large files

This implementation significantly enhances the developer experience by enabling seamless real-time collaboration within the Disco MCP platform, advancing the roadmap toward complete Phase 4 objectives.