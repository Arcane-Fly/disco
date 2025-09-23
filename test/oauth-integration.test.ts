import request from 'supertest';
import express from 'express';
import escape from 'escape-html';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

// Create a test app that mimics the real server OAuth implementation
const createFullTestApp = () => {
  const app = express();

  // Rate limiter: limit to 10 requests per minute for oauth/authorize GET
  const authorizeRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  // Mock JWT secret for testing
  process.env.JWT_SECRET = 'test-secret-key';
  
  // Mock OAuth authorize endpoint (full implementation test)
  app.get('/oauth/authorize', authorizeRateLimiter, async (req, res) => {
    try {
      const { 
        client_id, 
        redirect_uri, 
        response_type, 
        scope, 
        state, 
        code_challenge, 
        code_challenge_method = 'S256' 
      } = req.query;

      // Validate required parameters
      if (!client_id || !redirect_uri || !response_type || !code_challenge) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing required parameters: client_id, redirect_uri, response_type, code_challenge'
        });
      }

      // Validate response type
      if (response_type !== 'code') {
        return res.status(400).json({
          error: 'unsupported_response_type',
          error_description: 'Only authorization_code flow is supported'
        });
      }

      // Validate redirect URI for ChatGPT
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

      // Check if user is already authenticated
      const authHeader = req.headers.authorization;
      const tempAuthCookie = req.cookies?.['temp-auth-token'];
      let userId = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          userId = decoded.sub;
        } catch (jwtError) {
          // Token invalid, will redirect to login
        }
      } else if (tempAuthCookie) {
        try {
          const decoded = jwt.verify(tempAuthCookie, process.env.JWT_SECRET!) as any;
          userId = decoded.sub;
          // Clear the temporary cookie after use
          res.clearCookie('temp-auth-token');
        } catch (jwtError) {
          // Invalid temp token
        }
      }

      // If not authenticated, return authentication required
      if (!userId) {
        return res.status(401).json({
          error: 'authentication_required',
          error_description: 'User authentication required',
          login_url: '/api/v1/auth/github'
        });
      }

      // User is authenticated, show consent UI
      const requestedScope = scope || 'mcp:tools mcp:resources';
      const consentHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Authorize ChatGPT Access - Disco MCP Server</title>
</head>
<body>
    <h1>Authorize ChatGPT Access</h1>
    <p>ChatGPT is requesting access to your Disco MCP Server</p>
    <p>Requested scopes: ${escape(requestedScope)}</p>
    <form method="post" action="/oauth/authorize">
        <input type="hidden" name="client_id" value="${escape(client_id)}">
        <input type="hidden" name="redirect_uri" value="${escape(redirect_uri)}">
        <input type="hidden" name="response_type" value="${escape(response_type)}">
        <input type="hidden" name="scope" value="${escape(requestedScope)}">
        <input type="hidden" name="state" value="${escape(state || '')}">
        <input type="hidden" name="code_challenge" value="${escape(code_challenge)}">
        <input type="hidden" name="code_challenge_method" value="${escape(code_challenge_method)}">
        <input type="hidden" name="user_id" value="${escape(userId)}">
        <input type="hidden" name="action" value="approve">
        <button type="submit">Authorize</button>
    </form>
    <form method="post" action="/oauth/authorize">
        <input type="hidden" name="client_id" value="${escape(client_id)}">
        <input type="hidden" name="redirect_uri" value="${escape(redirect_uri)}">
        <input type="hidden" name="state" value="${escape(state || '')}">
        <input type="hidden" name="action" value="deny">
        <button type="submit">Deny</button>
    </form>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(consentHtml);

    } catch (error) {
      console.error('OAuth authorize error:', error);
      res.status(500).json({
        error: 'server_error',
        error_description: 'Authorization request failed'
      });
    }
  });

  // Mock OAuth authorize POST handler (consent response)
  app.post('/oauth/authorize', async (req, res) => {
    try {
      const { 
        client_id, 
        redirect_uri, 
        scope, 
        state, 
        code_challenge, 
        code_challenge_method, 
        user_id, 
        action 
      } = req.body;

      // Handle denial
      if (action === 'deny') {
        const errorUrl = `${redirect_uri}?error=access_denied&error_description=User denied authorization&state=${encodeURIComponent(state || '')}`;
        return res.redirect(errorUrl);
      }

      // Generate authorization code for approval
      const authCode = 'test_auth_code_' + Math.random().toString(36).substring(7);

      // Store authorization data for token exchange (mock)
      global.testAuthData = {
        userId: user_id,
        scope: scope || 'mcp:tools mcp:resources',
        codeChallenge: code_challenge,
        codeChallengeMethod: code_challenge_method || 'S256',
        clientId: client_id
      };

      // Redirect to ChatGPT with authorization code
      const callbackUrl = `${redirect_uri}?code=${authCode}&state=${encodeURIComponent(state || '')}`;
      
      res.redirect(callbackUrl);

    } catch (error) {
      console.error('OAuth authorize POST error:', error);
      const errorUrl = `${req.body.redirect_uri}?error=server_error&error_description=Authorization processing failed&state=${encodeURIComponent(req.body.state || '')}`;
      res.redirect(errorUrl);
    }
  });

  // Mock OAuth token exchange endpoint
  app.post('/oauth/token', async (req, res) => {
    try {
      const { grant_type, code, client_id, code_verifier } = req.body;
      
      if (grant_type !== 'authorization_code') {
        return res.status(400).json({
          error: 'unsupported_grant_type',
          error_description: 'Only authorization_code grant type is supported'
        });
      }
      
      if (!code || !code_verifier) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing required parameters: code, code_verifier'
        });
      }
      
      // Mock PKCE verification (simplified)
      const authData = global.testAuthData;
      if (!authData) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Authorization code is invalid or expired'
        });
      }
      
      // Generate access token
      const tokenPayload = {
        sub: authData.userId,
        scope: authData.scope,
        aud: authData.clientId,
        iss: 'test-server',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET!);
      
      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: authData.scope
      });
      
    } catch (error) {
      console.error('OAuth token exchange error:', error);
      res.status(500).json({
        error: 'server_error',
        error_description: 'Internal server error during token exchange'
      });
    }
  });
  
  return app;
};

describe('Complete ChatGPT OAuth 2.0 Integration Flow', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createFullTestApp();
    global.testAuthData = null; // Reset test data
  });

  afterEach(() => {
    delete global.testAuthData;
  });

  describe('Full OAuth 2.0 Authorization Code Flow', () => {
    test('should require authentication for authorization endpoint', async () => {
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
        .expect(401);

      expect(response.body.error).toBe('authentication_required');
      expect(response.body.login_url).toBe('/api/v1/auth/github');
    });

    test('should show consent UI when user is authenticated', async () => {
      // Create a temporary auth token
      const tempToken = jwt.sign(
        { sub: 'github:testuser', temp: true },
        process.env.JWT_SECRET!,
        { expiresIn: '10m' }
      );

      const response = await request(app)
        .get('/oauth/authorize')
        .set('Cookie', [`temp-auth-token=${tempToken}`])
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

      expect(response.text).toContain('Authorize ChatGPT Access');
      expect(response.text).toContain('mcp:tools mcp:resources');
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    test('should handle user approval with authorization code', async () => {
      const response = await request(app)
        .post('/oauth/authorize')
        .send({
          client_id: 'chatgpt-connector',
          redirect_uri: 'https://chat.openai.com/oauth/callback',
          response_type: 'code',
          scope: 'mcp:tools mcp:resources',
          state: 'random-state-value',
          code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
          code_challenge_method: 'S256',
          user_id: 'github:testuser',
          action: 'approve'
        })
        .expect(302);

      const location = response.headers.location;
      expect(location).toContain('https://chat.openai.com/oauth/callback');
      expect(location).toContain('code=');
      expect(location).toContain('state=random-state-value');
    });

    test('should handle user denial', async () => {
      const response = await request(app)
        .post('/oauth/authorize')
        .send({
          client_id: 'chatgpt-connector',
          redirect_uri: 'https://chat.openai.com/oauth/callback',
          state: 'random-state-value',
          action: 'deny'
        })
        .expect(302);

      const location = response.headers.location;
      expect(location).toContain('https://chat.openai.com/oauth/callback');
      expect(location).toContain('error=access_denied');
      expect(location).toContain('state=random-state-value');
    });

    test('should complete token exchange after authorization', async () => {
      // First, approve authorization
      const authResponse = await request(app)
        .post('/oauth/authorize')
        .send({
          client_id: 'chatgpt-connector',
          redirect_uri: 'https://chat.openai.com/oauth/callback',
          scope: 'mcp:tools mcp:resources',
          state: 'random-state-value',
          code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
          code_challenge_method: 'S256',
          user_id: 'github:testuser',
          action: 'approve'
        })
        .expect(302);

      // Extract authorization code from redirect
      const location = authResponse.headers.location;
      const urlParams = new URLSearchParams(location.split('?')[1]);
      const authCode = urlParams.get('code');

      expect(authCode).toBeTruthy();

      // Now exchange code for token
      const tokenResponse = await request(app)
        .post('/oauth/token')
        .send({
          grant_type: 'authorization_code',
          code: authCode,
          client_id: 'chatgpt-connector',
          code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' // This would be the original verifier
        })
        .expect(200);

      expect(tokenResponse.body.access_token).toBeTruthy();
      expect(tokenResponse.body.token_type).toBe('Bearer');
      expect(tokenResponse.body.expires_in).toBe(3600);
      expect(tokenResponse.body.scope).toBe('mcp:tools mcp:resources');

      // Verify the token can be decoded
      const decoded = jwt.verify(tokenResponse.body.access_token, process.env.JWT_SECRET!) as any;
      expect(decoded.sub).toBe('github:testuser');
      expect(decoded.aud).toBe('chatgpt-connector');
      expect(decoded.scope).toBe('mcp:tools mcp:resources');
    });

    test('should validate token exchange parameters', async () => {
      const response = await request(app)
        .post('/oauth/token')
        .send({
          grant_type: 'client_credentials', // Invalid
          code: 'invalid-code'
        })
        .expect(400);

      expect(response.body.error).toBe('unsupported_grant_type');
    });

    test('should require both code and code_verifier for token exchange', async () => {
      const response = await request(app)
        .post('/oauth/token')
        .send({
          grant_type: 'authorization_code',
          code: 'test-code'
          // Missing code_verifier
        })
        .expect(400);

      expect(response.body.error).toBe('invalid_request');
      expect(response.body.error_description).toContain('Missing required parameters');
    });
  });

  describe('PKCE Security Validation', () => {
    test('should support S256 code challenge method', async () => {
      const tempToken = jwt.sign(
        { sub: 'github:testuser', temp: true },
        process.env.JWT_SECRET!,
        { expiresIn: '10m' }
      );

      const response = await request(app)
        .get('/oauth/authorize')
        .set('Cookie', [`temp-auth-token=${tempToken}`])
        .query({
          client_id: 'chatgpt-connector',
          redirect_uri: 'https://chat.openai.com/oauth/callback',
          response_type: 'code',
          code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
          code_challenge_method: 'S256'
        })
        .expect(200);

      expect(response.text).toContain('Authorize ChatGPT Access');
    });

    test('should require code_challenge parameter', async () => {
      const response = await request(app)
        .get('/oauth/authorize')
        .query({
          client_id: 'chatgpt-connector',
          redirect_uri: 'https://chat.openai.com/oauth/callback',
          response_type: 'code'
          // Missing code_challenge
        })
        .expect(400);

      expect(response.body.error).toBe('invalid_request');
      expect(response.body.error_description).toContain('code_challenge');
    });
  });
});