/**
 * Test environment configuration
 * Sets up environment variables and test-specific configurations
 */

// Test environment variables
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true
});
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.WEBCONTAINER_CLIENT_ID = 'test-webcontainer-id';
process.env.PORT = '0'; // Use random port for tests
process.env.TEST_PORT_RANGE_START = '4000';
process.env.TEST_PORT_RANGE_END = '9000';

// Disable rate limiting in tests
process.env.DISABLE_RATE_LIMITING = 'true';

// Disable file persistence in tests
process.env.DISABLE_FILE_PERSISTENCE = 'true';

// Mock WebContainer API in test environment
process.env.MOCK_WEBCONTAINER = 'true';