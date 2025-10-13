import request from 'supertest';
import { app, prepareNextApp } from '../src/server.js';

describe('MCP Specification Compliance', () => {
  let server: any;
  let authToken: string;

  beforeAll(async () => {
    await prepareNextApp();
    server = app;
    
    // Get authentication token
    const authResponse = await request(server)
      .post('/api/v1/auth/login')
      .send({ apiKey: 'test-key-123' });
    
    authToken = authResponse.body.data.token;
  });

  describe('Bearer Token Authentication (MCP Spec Requirement)', () => {
    test('should work with Bearer token authentication', async () => {
      const response = await request(server)
        .post('/mcp')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.result.serverInfo.name).toBe('Disco MCP Server');
    });

    test('should reject query parameter authentication (MCP spec violation)', async () => {
      const response = await request(server)
        .post(`/mcp?token=${authToken}`)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        });

      // Should reject because tokens in query strings violate MCP spec
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.error.code).toBe('AUTH_FAILED');
    });

    test('should reject requests without authentication', async () => {
      const response = await request(server)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.error.code).toBe('AUTH_FAILED');
    });
  });

  describe('MCP URL Generation API', () => {
    test('should generate MCP URL without token in query string', async () => {
      const response = await request(server)
        .get('/api/v1/mcp/url')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      // URL should not contain token query parameter (MCP spec requirement)
      expect(response.body.data.mcp_url).not.toContain('?token=');
      expect(response.body.data.mcp_url).toContain('/mcp');
      expect(response.body.data.authentication.method).toBe('bearer_token');
      // Token should be provided separately for header usage
      expect(response.body.data.token).toBeDefined();
    });

    test('should reject MCP URL generation for unauthenticated user', async () => {
      const response = await request(server)
        .get('/api/v1/mcp/url');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('MCP Protocol Methods with Bearer Auth', () => {
    test('should list tools using Bearer token authentication', async () => {
      const response = await request(server)
        .post('/mcp')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.result.tools).toBeInstanceOf(Array);
      expect(response.body.result.tools.length).toBeGreaterThan(0);
      
      // Verify we have expected tools
      const toolNames = response.body.result.tools.map((tool: any) => tool.name);
      expect(toolNames).toContain('file_read');
      expect(toolNames).toContain('file_write');
      expect(toolNames).toContain('terminal_execute');
    });

    test('should use generated token in Authorization header', async () => {
      // First get the token from URL generation endpoint
      const urlResponse = await request(server)
        .get('/api/v1/mcp/url')
        .set('Authorization', `Bearer ${authToken}`);
      
      const token = urlResponse.body.data.token;
      expect(token).toBeDefined();

      // Use token in Authorization header (not query string)
      const response = await request(server)
        .post('/mcp')
        .set('Authorization', `Bearer ${token}`)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {}
        });

      expect(response.status).toBe(200);
      expect(response.body.result.tools).toBeInstanceOf(Array);
    });
  });
});