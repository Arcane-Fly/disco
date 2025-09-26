import request from 'supertest';
import { app, prepareNextApp } from '../src/server.js';

describe('MCP URL Generation Feature', () => {
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

  describe('Authentication Compatibility', () => {
    test('should work with Bearer token authentication (existing method)', async () => {
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

    test('should work with query parameter authentication (new method)', async () => {
      const response = await request(server)
        .post(`/mcp?token=${authToken}`)
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
    test('should generate MCP URL for authenticated user', async () => {
      const response = await request(server)
        .get('/api/v1/mcp/url')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.mcp_url).toContain('/mcp?token=');
      expect(response.body.data.mcp_url).toContain(authToken);
      expect(response.body.data.authentication.method).toBe('query_parameter');
      expect(response.body.data.alternative_auth.method).toBe('bearer_token');
    });

    test('should reject MCP URL generation for unauthenticated user', async () => {
      const response = await request(server)
        .get('/api/v1/mcp/url');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('MCP Protocol Methods', () => {
    test('should list tools using query parameter auth', async () => {
      const response = await request(server)
        .post(`/mcp?token=${authToken}`)
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

    test('should work with generated URL', async () => {
      // First get the generated URL
      const urlResponse = await request(server)
        .get('/api/v1/mcp/url')
        .set('Authorization', `Bearer ${authToken}`);
      
      const mcpUrl = urlResponse.body.data.mcp_url;
      const urlObj = new URL(mcpUrl);
      const token = urlObj.searchParams.get('token');

      // Test the URL works
      const response = await request(server)
        .post(`/mcp?token=${token}`)
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