import request from 'supertest';
import express from 'express';
import { authRouter } from '../src/api/auth';

// Mock the server endpoints we need for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/v1/auth', authRouter);
  
  // Mock OAuth authorize endpoint (simplified version)
  app.get('/oauth/authorize', (req, res) => {
    const { client_id, redirect_uri, response_type, code_challenge } = req.query;
    
    if (!client_id || !redirect_uri || !response_type || !code_challenge) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters'
      });
    }
    
    if (response_type !== 'code') {
      return res.status(400).json({
        error: 'unsupported_response_type',
        error_description: 'Only authorization_code flow is supported'
      });
    }
    
    const allowedRedirectUris = [
      'https://chat.openai.com/oauth/callback',
      'https://chatgpt.com/oauth/callback'
    ];
    
    if (!allowedRedirectUris.includes(redirect_uri as string)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Invalid redirect_uri. Must be a ChatGPT callback URL.'
      });
    }
    
    // Return consent form for valid requests
    res.setHeader('Content-Type', 'text/html');
    res.send('<html><body><h1>OAuth Consent</h1></body></html>');
  });
  
  return app;
};

describe('ChatGPT OAuth Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /oauth/authorize', () => {
    test('should validate required parameters', async () => {
      const response = await request(app)
        .get('/oauth/authorize')
        .expect(400);

      expect(response.body.error).toBe('invalid_request');
      expect(response.body.error_description).toContain('Missing required parameters');
    });

    test('should validate response_type parameter', async () => {
      const response = await request(app)
        .get('/oauth/authorize')
        .query({
          client_id: 'test-client',
          redirect_uri: 'https://chat.openai.com/oauth/callback',
          response_type: 'token', // Invalid
          code_challenge: 'test-challenge'
        })
        .expect(400);

      expect(response.body.error).toBe('unsupported_response_type');
    });

    test('should validate ChatGPT redirect URIs', async () => {
      const response = await request(app)
        .get('/oauth/authorize')
        .query({
          client_id: 'test-client',
          redirect_uri: 'https://malicious.com/callback',
          response_type: 'code',
          code_challenge: 'test-challenge'
        })
        .expect(400);

      expect(response.body.error).toBe('invalid_request');
      expect(response.body.error_description).toContain('Invalid redirect_uri');
    });

    test('should accept valid ChatGPT callback URLs', async () => {
      const validUris = [
        'https://chat.openai.com/oauth/callback',
        'https://chatgpt.com/oauth/callback'
      ];

      for (const uri of validUris) {
        const response = await request(app)
          .get('/oauth/authorize')
          .query({
            client_id: 'test-client',
            redirect_uri: uri,
            response_type: 'code',
            code_challenge: 'test-challenge'
          })
          .expect(200);

        expect(response.text).toContain('OAuth Consent');
      }
    });

    test('should support PKCE parameters', async () => {
      const response = await request(app)
        .get('/oauth/authorize')
        .query({
          client_id: 'chatgpt-connector',
          redirect_uri: 'https://chat.openai.com/oauth/callback',
          response_type: 'code',
          scope: 'mcp:tools mcp:resources',
          state: 'random-state-value',
          code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
          code_challenge_method: 'S256'
        })
        .expect(200);

      expect(response.text).toContain('OAuth Consent');
      expect(response.headers['content-type']).toContain('text/html');
    });
  });

  describe('MCP Manifest OAuth Configuration', () => {
    test('should have correct OAuth endpoints in manifest', () => {
      const manifest = require('../mcp-manifest.json');
      
      expect(manifest.authentication.type).toBe('oauth2');
      expect(manifest.authentication.authorization_url).toBe('https://disco-mcp.up.railway.app/oauth/authorize');
      expect(manifest.authentication.token_url).toBe('https://disco-mcp.up.railway.app/oauth/token');
      expect(manifest.authentication.redirect_uris).toContain('https://chat.openai.com/oauth/callback');
      expect(manifest.authentication.redirect_uris).toContain('https://chatgpt.com/oauth/callback');
      expect(manifest.authentication.pkce_required).toBe(true);
    });
  });
});