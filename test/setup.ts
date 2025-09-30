/**
 * Jest setup file to mock Next.js and other problematic dependencies
 */

// Import jest-dom matchers for better testing
import '@testing-library/jest-dom';

// Mock Next.js
jest.mock('next', () => {
  return jest.fn(() => ({
    prepare: jest.fn().mockResolvedValue(undefined),
    getRequestHandler: jest.fn().mockReturnValue((req: any, res: any) => {
      res.status(200).send('mocked next handler');
    }),
  }));
});

// Mock Docker-related modules if not available in test environment
jest.mock('dockerode', () => {
  return jest.fn().mockImplementation(() => ({
    listContainers: jest.fn().mockResolvedValue([]),
    createContainer: jest.fn().mockResolvedValue({
      id: 'test-container',
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    }),
  }));
});

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
  })),
}));

// Mock file system operations that might fail in test env
jest.mock('fs/promises', () => ({
  access: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('mocked file content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({ isDirectory: () => true, isFile: () => true }),
}));

// Import test utilities
import { releaseAllPorts } from './utils/port-manager';

// Global test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.WEBCONTAINER_CLIENT_ID = 'test-webcontainer-id';

// Global test cleanup
afterEach(() => {
  // Release any ports used in tests
  releaseAllPorts();
  
  // Clear any timers
  jest.clearAllTimers();
  
  // Clear any mocks
  jest.clearAllMocks();
});

// Global test teardown
afterAll(() => {
  // Ensure all async operations are cleaned up
  return new Promise(resolve => {
    setTimeout(resolve, 100);
  });
});
