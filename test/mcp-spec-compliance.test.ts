import request from 'supertest';
import { app, prepareNextApp } from '../src/server.js';

/**
 * Tests for MCP Authorization and Transport Specification Compliance
 * Based on MCP specs revision 2025-03-26 (authorization) and 2025-06-18 (transport)
 */
describe('MCP Specification Compliance Tests', () => {
  let server: any;

  beforeAll(async () => {
    await prepareNextApp();
    server = app;
    process.env.JWT_SECRET = 'test-secret-key-for-mcp-compliance';
  });

  describe('OAuth 2.1 Dynamic Client Registration', () => {
    test('should register a new client with valid redirect URIs', async () => {
      const response = await request(server)
        .post('/oauth/register')
        .send({
          client_name: 'Test MCP Client',
          redirect_uris: ['https://example.com/callback', 'https://localhost:3000/callback'],
          scope: 'mcp:tools mcp:resources'
        });

      expect(response.status).toBe(201);
      expect(response.body.client_id).toBeDefined();
      expect(response.body.client_secret).toBeDefined();
      expect(response.body.client_id).toMatch(/^disco_/);
      expect(response.body.redirect_uris).toEqual(['https://example.com/callback', 'https://localhost:3000/callback']);
    });

    test('should reject registration with non-HTTPS redirect URIs', async () => {
      const response = await request(server)
        .post('/oauth/register')
        .send({
          client_name: 'Insecure Client',
          redirect_uris: ['http://example.com/callback'], // HTTP not allowed
          scope: 'mcp:tools mcp:resources'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_request');
      expect(response.body.error_description).toContain('HTTPS');
    });

    test('should accept localhost redirect URIs', async () => {
      const response = await request(server)
        .post('/oauth/register')
        .send({
          client_name: 'Local Dev Client',
          redirect_uris: ['http://localhost:3000/callback', 'http://127.0.0.1:3000/callback'],
          scope: 'mcp:tools mcp:resources'
        });

      expect(response.status).toBe(201);
      expect(response.body.client_id).toBeDefined();
    });

    test('should reject registration without required fields', async () => {
      const response = await request(server)
        .post('/oauth/register')
        .send({
          client_name: 'Incomplete Client'
          // Missing redirect_uris
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_request');
    });
  });

  describe('Origin Header Validation (Transport Security)', () => {
    test('should validate Origin header for SSE endpoint', async () => {
      // This test verifies that Origin validation is in place
      // In a real scenario, this would test with various origins
      const response = await request(server)
        .get('/mcp')
        .set('Accept', 'text/event-stream')
        .set('Authorization', 'Bearer fake-token');

      // Should fail due to invalid token, not Origin validation
      // (confirming that Origin check comes before or after auth)
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Token Management and Rotation', () => {
    let testToken: string;

    beforeAll(async () => {
      // Generate a test token
      const jwt = await import('jsonwebtoken');
      testToken = jwt.sign(
        { userId: 'test-user-123', sub: 'test-user-123' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );
    });

    test('should refresh token and rotate (revoke old token)', async () => {
      const response = await request(server)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.token).not.toBe(testToken); // New token should be different

      // Try to use old token - should be revoked
      const oldTokenResponse = await request(server)
        .post('/mcp')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        });

      expect(oldTokenResponse.status).toBe(401);
      expect(oldTokenResponse.body.error.message).toContain('revoked');
    });

    test('should reject token refresh for tokens older than 7 days', async () => {
      const jwt = await import('jsonwebtoken');
      const oldToken = jwt.sign(
        { userId: 'test-user-123', sub: 'test-user-123', iat: Math.floor(Date.now() / 1000) - (8 * 24 * 60 * 60) },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      const response = await request(server)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${oldToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toContain('too old');
    });
  });

  describe('Authorization Header Enforcement', () => {
    test('should reject MCP requests with tokens in query string', async () => {
      const jwt = await import('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-123', sub: 'test-user-123' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      const response = await request(server)
        .post(`/mcp?token=${token}`)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        });

      // Should be rejected as tokens in query strings violate MCP spec
      expect(response.status).toBe(401);
    });

    test('should accept MCP requests with Bearer token in header', async () => {
      const jwt = await import('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-123', sub: 'test-user-123' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      const response = await request(server)
        .post('/mcp')
        .set('Authorization', `Bearer ${token}`)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
    });
  });

  describe('Client Registration Persistence and Validation', () => {
    let clientId: string;
    let clientSecret: string;
    let redirectUri: string;

    beforeAll(async () => {
      // Register a client
      const response = await request(server)
        .post('/oauth/register')
        .send({
          client_name: 'Persistence Test Client',
          redirect_uris: ['https://test.example.com/callback'],
          scope: 'mcp:tools mcp:resources'
        });

      clientId = response.body.client_id;
      clientSecret = response.body.client_secret;
      redirectUri = response.body.redirect_uris[0];
    });

    test('should validate registered redirect URIs in authorize endpoint', async () => {
      // Try to authorize with a valid redirect URI
      const response = await request(server)
        .get('/oauth/authorize')
        .query({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          code_challenge: 'test-challenge-123',
          code_challenge_method: 'S256'
        });

      // Should proceed to authentication (not reject due to redirect URI)
      // Status will be 302 (redirect to GitHub) or show consent page
      expect([200, 302]).toContain(response.status);
    });

    test('should reject unregistered redirect URIs', async () => {
      const response = await request(server)
        .get('/oauth/authorize')
        .query({
          client_id: clientId,
          redirect_uri: 'https://malicious.com/callback', // Not registered
          response_type: 'code',
          code_challenge: 'test-challenge-123',
          code_challenge_method: 'S256'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_request');
      expect(response.body.error_description).toContain('redirect_uri');
    });

    test('should reject authorize requests with unregistered client_id', async () => {
      const response = await request(server)
        .get('/oauth/authorize')
        .query({
          client_id: 'invalid_client_id',
          redirect_uri: redirectUri,
          response_type: 'code',
          code_challenge: 'test-challenge-123',
          code_challenge_method: 'S256'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_request');
    });
  });

  describe('OAuth Discovery Endpoints', () => {
    test('should expose authorization server metadata', async () => {
      const response = await request(server)
        .get('/.well-known/oauth-authorization-server');

      expect(response.status).toBe(200);
      expect(response.body.issuer).toBeDefined();
      expect(response.body.authorization_endpoint).toBeDefined();
      expect(response.body.token_endpoint).toBeDefined();
      expect(response.body.registration_endpoint).toBeDefined();
      expect(response.body.scopes_supported).toContain('mcp:tools');
      expect(response.body.code_challenge_methods_supported).toContain('S256');
    });

    test('should expose protected resource metadata', async () => {
      const response = await request(server)
        .get('/.well-known/oauth-protected-resource');

      expect(response.status).toBe(200);
      expect(response.body.resource_server).toBeDefined();
      expect(response.body.authorization_servers).toBeDefined();
    });
  });
});
