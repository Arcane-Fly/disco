import request from 'supertest';
import { app } from '../src/server.js';

describe('MCP Compliance Tests', () => {
  describe('HTTP Stream Transport (/mcp)', () => {
    test('should handle POST requests for JSON-RPC', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe(1);
      expect(response.body.result.protocolVersion).toBe('2024-11-05');
      expect(response.body.result.serverInfo.name).toBe('Disco MCP Server');
    });

    test('should handle GET requests with SSE Accept header', async () => {
      const response = await request(app)
        .get('/mcp')
        .set('Accept', 'text/event-stream')
        .expect(200)
        .expect('Content-Type', /text\/event-stream/);

      // Check SSE headers
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.headers['connection']).toBe('keep-alive');
      
      // Check for endpoint event in response
      expect(response.text).toContain('event: endpoint');
      expect(response.text).toContain('/mcp');
    });

    test('should handle GET requests without SSE Accept header', async () => {
      const response = await request(app)
        .get('/mcp')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.transport).toBe('http-stream');
      expect(response.body.methods).toEqual(['POST', 'GET']);
    });

    test('should handle tools/list method', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        })
        .expect(200);

      expect(response.body.result.tools).toBeInstanceOf(Array);
      expect(response.body.result.tools.length).toBeGreaterThan(0);
      expect(response.body.result.tools[0]).toHaveProperty('name');
      expect(response.body.result.tools[0]).toHaveProperty('description');
    });

    test('should require authentication for tools/call', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {}
        })
        .expect(401);

      expect(response.body.error.code).toBe(-32001);
      expect(response.body.error.message).toBe('Authentication required');
    });

    test('should handle invalid JSON-RPC', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '1.0', // Invalid version
          id: 4,
          method: 'initialize'
        })
        .expect(400);

      expect(response.body.error.code).toBe(-32600);
      expect(response.body.error.message).toBe('Invalid Request');
    });

    test('should handle unknown methods', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: 5,
          method: 'unknown_method'
        })
        .expect(400);

      expect(response.body.error.code).toBe(-32601);
      expect(response.body.error.message).toBe('Method not found');
    });
  });

  describe('SSE Transport (/sse and /messages)', () => {
    test('should serve SSE stream on /sse endpoint', async () => {
      const response = await request(app)
        .get('/sse')
        .expect(200)
        .expect('Content-Type', /text\/event-stream/);

      // Check SSE headers
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.headers['connection']).toBe('keep-alive');
      
      // Check for endpoint event pointing to /messages
      expect(response.text).toContain('event: endpoint');
      expect(response.text).toContain('/messages');
      expect(response.text).toContain('event: server_info');
    });

    test('should handle JSON-RPC on /messages endpoint', async () => {
      const response = await request(app)
        .post('/messages')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe(1);
      expect(response.body.result.protocolVersion).toBe('2024-11-05');
    });

    test('should handle session headers', async () => {
      const sessionId = 'test-session-123';
      
      const response = await request(app)
        .post('/messages')
        .set('Mcp-Session-Id', sessionId)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize'
        })
        .expect(200);

      expect(response.headers['mcp-session-id']).toBe(sessionId);
    });
  });

  describe('Claude Connector Compliance', () => {
    test('should return MCP-compliant endpoints', async () => {
      const response = await request(app)
        .get('/claude-connector')
        .expect(200)
        .expect('Content-Type', /json/);

      // Should use MCP-compliant endpoints
      expect(response.body.api_base_url).toMatch(/\/mcp$/);
      expect(response.body.stream_base_url).toMatch(/\/mcp$/);
      
      // Should have legacy SSE endpoints for backward compatibility
      expect(response.body.sse_endpoint).toMatch(/\/sse$/);
      expect(response.body.messages_endpoint).toMatch(/\/messages$/);
      
      // Should indicate MCP compliance
      expect(response.body.mcp_transport).toBe('http-stream');
      expect(response.body.mcp_version).toBe('2024-11-05');
      expect(response.body.notes).toContain('✅ MCP HTTP Stream transport compliant (recommended)');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON in MCP endpoints', async () => {
      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    test('should handle missing Content-Type for JSON-RPC', async () => {
      const response = await request(app)
        .post('/messages')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize'
        })
        .expect(200); // Should still work with default JSON parsing
    });
  });

  describe('Headers and Content Types', () => {
    test('should set correct headers for SSE responses', async () => {
      const response = await request(app)
        .get('/sse')
        .expect(200);

      expect(response.headers['content-type']).toBe('text/event-stream');
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.headers['connection']).toBe('keep-alive');
    });

    test('should set correct headers for JSON-RPC responses', async () => {
      const response = await request(app)
        .post('/messages')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize'
        })
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should support CORS for MCP headers', async () => {
      const response = await request(app)
        .options('/mcp')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Headers', 'Mcp-Session-Id')
        .expect(204);

      expect(response.headers['access-control-allow-headers']).toContain('Mcp-Session-Id');
    });
  });
});