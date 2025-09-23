import { Server as SocketIOServer } from 'socket.io';
import {
  CollaborationManager,
  initializeCollaborationManager,
} from '../src/lib/collaborationManager';
import { createServer } from 'http';

describe('Collaboration Manager', () => {
  let collaborationManager: CollaborationManager;
  let io: SocketIOServer;
  let httpServer: any;

  beforeEach(() => {
    httpServer = createServer();
    io = new SocketIOServer(httpServer);
    collaborationManager = initializeCollaborationManager(io);
  });

  afterEach(() => {
    io.close();
    httpServer.close();
  });

  test('should initialize collaboration manager', () => {
    expect(collaborationManager).toBeDefined();
  });

  test('should get active collaborations for container', () => {
    const collaborations = collaborationManager.getActiveCollaborations('test-container');
    expect(Array.isArray(collaborations)).toBe(true);
    expect(collaborations.length).toBe(0);
  });

  test('should get session users', () => {
    const users = collaborationManager.getSessionUsers('non-existent-session');
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(0);
  });

  test('should broadcast system message without error', () => {
    expect(() => {
      collaborationManager.broadcastSystemMessage('test-container', 'Test message');
    }).not.toThrow();
  });

  test('should sync file to collaborators without error', async () => {
    await expect(
      collaborationManager.syncFileToCollaborators(
        'test-container',
        '/test/file.txt',
        'test content'
      )
    ).resolves.not.toThrow();
  });
});
