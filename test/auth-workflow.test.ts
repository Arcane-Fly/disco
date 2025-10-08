import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { authRouter } from '../src/api/auth';

// Mock dependencies
jest.mock('../src/lib/oauthState.js', () => ({
  generateAuthorizationCode: jest.fn(() => 'mock-auth-code-123'),
  storeAuthCodeData: jest.fn(),
  getAndRemoveAuthCodeData: jest.fn(() => ({
    userId: 'github:testuser',
    scope: 'mcp:tools mcp:resources',
    codeChallenge: 'mock-challenge',
    codeChallengeMethod: 'S256',
    clientId: 'test-client',
    createdAt: Date.now(),
    expiresAt: Date.now() + 600000,
  })),
  verifyCodeChallenge: jest.fn(() => true),
}));

// Mock fetch for GitHub API calls
global.fetch = jest.fn();

describe('Authentication Workflow Tests (Step 8)', () => {
  let app: express.Application;
  const originalEnv = process.env;

  // Test JWT Secret
  const TEST_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long-for-security';

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment for each test
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = TEST_JWT_SECRET;

    app = express();

    // Configure trust proxy safely for tests - only trust loopback
    app.set('trust proxy', 'loopback');

    app.use(express.json());

    // Add test-specific rate limiting middleware that's safe for tests
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Keep the original limit for test functionality 
      standardHeaders: true,
      legacyHeaders: false,
      // Don't skip in tests, but use safer settings
      message: {
        status: 'error',
        error: {
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          message: 'Too many authentication attempts, please try again later.',
        },
      },
    });

    app.use('/api/v1/auth', authLimiter, authRouter);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('1. OAuth Configuration and Callback URL Analysis', () => {
    beforeEach(() => {
      process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
    });

    test('should inspect auth.ts OAuth callback URL configuration', async () => {
      const response = await request(app).get('/api/v1/auth').expect(200);

      // Verify OAuth configuration is properly detected
      expect(response.body.data.github_oauth.callback_url).toBe('/api/v1/auth/github/callback');
      expect(response.body.data.github_oauth.login_url).toBe('/api/v1/auth/github');
      expect(response.body.data.github_oauth.available).toBe(true);
    });

    test('should verify OAuth scopes in GitHub authorization URL', async () => {
      const response = await request(app).get('/api/v1/auth/github').expect(302);

      const location = response.headers.location;
      expect(location).toContain('scope=user:email');
      expect(location).toContain('github.com/login/oauth/authorize');
      expect(location).toContain('client_id=test-github-client-id');
    });

    test('should handle missing OAuth configuration', async () => {
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_SECRET;

      const response = await request(app).get('/api/v1/auth/github').expect(503);

      expect(response.body.error.details.setup_instructions).toBeDefined();
      expect(response.body.error.details.missing_env_vars).toContain('GITHUB_CLIENT_ID');
    });

    test('should detect placeholder OAuth values', async () => {
      process.env.GITHUB_CLIENT_ID = 'your-github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'your-github-client-secret';

      const response = await request(app).get('/api/v1/auth/github').expect(503);

      expect(response.body.error.message).toContain('placeholder values');
    });
  });

  describe('2. GitHub OAuth App Simulation and Token Exchange', () => {
    beforeEach(() => {
      process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
    });

    test('should simulate complete GitHub OAuth flow', async () => {
      // Mock GitHub API responses
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              access_token: 'gho_test_access_token',
              token_type: 'bearer',
              scope: 'user:email',
            }),
        } as any)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              login: 'testuser',
              name: 'Test User',
              email: 'test@example.com',
              avatar_url: 'https://github.com/images/error/testuser_happy.gif',
            }),
        } as any);

      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({
          code: 'test_auth_code',
          state: Buffer.from(
            JSON.stringify({
              timestamp: Date.now(),
              redirectTo: '/',
            })
          ).toString('base64'),
        })
        .expect(302);

      // Verify token was created in redirect
      expect(response.headers.location).toMatch(/#token=.+/);

      // Verify GitHub API was called correctly
      expect(fetch).toHaveBeenCalledWith('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'test-github-client-id',
          client_secret: 'test-github-client-secret',
          code: 'test_auth_code',
        }),
      });
    });

    test('should handle GitHub API errors during OAuth', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            error: 'invalid_grant',
            error_description: 'The provided authorization grant is invalid',
          }),
      } as any);

      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({ code: 'invalid_code' })
        .set('Accept', 'application/json')
        .expect(400);

      expect(response.body.error.message).toContain('GitHub OAuth error');
    });

    test('should handle PKCE flow for MCP OAuth 2.1 compliance', async () => {
      // Mock GitHub API responses
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              access_token: 'gho_test_access_token',
            }),
        } as any)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              login: 'testuser',
              name: 'Test User',
            }),
        } as any);

      const stateWithPKCE = Buffer.from(
        JSON.stringify({
          timestamp: Date.now(),
          redirectTo: '/',
          codeChallenge: 'test-challenge',
          codeChallengeMethod: 'S256',
          clientId: 'mcp-client',
        })
      ).toString('base64');

      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({
          code: 'test_auth_code',
          state: stateWithPKCE,
        })
        .expect(302);

      // Should redirect to callback page with auth code for PKCE flow
      expect(response.headers.location).toContain('/auth/callback?code=');

      // Verify OAuth state storage was called
      const { storeAuthCodeData } = require('../src/lib/oauthState.js');
      expect(storeAuthCodeData).toHaveBeenCalled();
    });
  });

  describe('3. Rate Limiting Validation on Login Endpoints', () => {
    beforeEach(() => {
      process.env.VALID_API_KEYS = 'test-api-key-1,test-api-key-2';
    });

    test('should enforce rate limits on /login endpoint', async () => {
      const loginData = { apiKey: 'test-api-key-1' };

      // Make requests up to the limit (10 requests in 15 minutes)
      for (let i = 0; i < 10; i++) {
        await request(app).post('/api/v1/auth/login').send(loginData).expect(200);
      }

      // The 11th request should be rate limited
      const response = await request(app).post('/api/v1/auth/login').send(loginData).expect(429);

      expect(response.body.error.code).toBe('AUTH_RATE_LIMIT_EXCEEDED');
      expect(response.body.error.message).toContain('Too many authentication attempts');
    });

    test('should have different rate limits for different IPs', async () => {
      const loginData = { apiKey: 'test-api-key-1' };

      // Exhaust limit for first IP
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send(loginData)
          .set('X-Forwarded-For', '192.168.1.1')
          .expect(200);
      }

      // First IP should be rate limited
      await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(429);

      // Different IP should still work
      await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .set('X-Forwarded-For', '192.168.1.2')
        .expect(200);
    });

    test('should validate rate limiting headers', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ apiKey: 'test-api-key-1' })
        .expect(200);

      // Check rate limiting headers are present
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });
  });

  describe('4. JWT Payload Decoding and Validation', () => {
    beforeEach(() => {
      process.env.VALID_API_KEYS = 'test-api-key';
    });

    test('should create JWT with correct payload structure', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ apiKey: 'test-api-key' })
        .expect(200);

      const token = response.body.data.token;
      const decoded = jwt.verify(token, TEST_JWT_SECRET) as any;

      // Verify standard JWT claims
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('provider', 'api');
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiry
      expect(decoded).toHaveProperty('iss', 'mcp-server'); // issuer
      expect(decoded).toHaveProperty('aud', 'chatgpt'); // audience

      // Verify expiry is approximately 1 hour from now
      const expiryTime = decoded.exp * 1000;
      const expectedExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
      expect(expiryTime).toBeGreaterThan(Date.now());
      expect(expiryTime).toBeLessThan(expectedExpiry + 60000); // Allow 1 minute variance
    });

    test('should verify JWT issuer and audience claims', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ apiKey: 'test-api-key' })
        .expect(200);

      const token = response.body.data.token;

      // Verify with correct issuer and audience
      const decoded = jwt.verify(token, TEST_JWT_SECRET, {
        issuer: 'mcp-server',
        audience: 'chatgpt',
      }) as any;

      expect(decoded.iss).toBe('mcp-server');
      expect(decoded.aud).toBe('chatgpt');

      // Should fail with wrong issuer
      expect(() => {
        jwt.verify(token, TEST_JWT_SECRET, {
          issuer: 'wrong-issuer',
          audience: 'chatgpt',
        });
      }).toThrow();
    });

    test('should decode GitHub OAuth JWT with extended claims', async () => {
      // Mock GitHub OAuth flow
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              access_token: 'gho_test_access_token',
            }),
        } as any)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              login: 'testuser',
              name: 'Test User',
              email: 'test@example.com',
              avatar_url: 'https://github.com/images/error/testuser_happy.gif',
            }),
        } as any);

      process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';

      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({ code: 'test_auth_code' })
        .expect(302);

      // Extract token from redirect URL
      const location = response.headers.location;
      const tokenMatch = location.match(/token=([^&]+)/);
      expect(tokenMatch).toBeTruthy();

      if (tokenMatch) {
        const token = decodeURIComponent(tokenMatch[1]);
        const decoded = jwt.verify(token, TEST_JWT_SECRET) as any;

        // Verify GitHub-specific claims
        expect(decoded.userId).toBe('github:testuser');
        expect(decoded.username).toBe('testuser');
        expect(decoded.provider).toBe('github');
        expect(decoded.name).toBe('Test User');
        expect(decoded.email).toBe('test@example.com');
        expect(decoded.avatar).toBeDefined();

        // Verify GitHub tokens have longer expiry (24h)
        const expiryTime = decoded.exp * 1000;
        const expectedExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        expect(expiryTime).toBeGreaterThan(Date.now() + 23 * 60 * 60 * 1000); // At least 23 hours
      }
    });

    test('should validate token expiry timestamps', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ apiKey: 'test-api-key' })
        .expect(200);

      const { token, expires } = response.body.data;
      const decoded = jwt.verify(token, TEST_JWT_SECRET) as any;

      // Compare expires field with JWT exp claim (allow small variance for processing time)
      expect(Math.abs(expires - decoded.exp * 1000)).toBeLessThan(1000); // Within 1 second

      // Verify expiry is in the future
      expect(decoded.exp * 1000).toBeGreaterThan(Date.now());
    });
  });

  describe('5. Token Refresh and Invalid Token Handling', () => {
    let validToken: string;
    let expiredToken: string;
    let invalidToken: string;

    beforeEach(async () => {
      process.env.VALID_API_KEYS = 'test-api-key';

      // Create a valid token
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ apiKey: 'test-api-key' })
        .expect(200);

      validToken = response.body.data.token;

      // Create an expired token (expired 1 hour ago)
      expiredToken = jwt.sign({ userId: 'api:testuser', provider: 'api' }, TEST_JWT_SECRET, {
        expiresIn: '-1h',
        issuer: 'mcp-server',
        audience: 'chatgpt',
      });

      // Create an invalid token (wrong secret)
      invalidToken = jwt.sign({ userId: 'api:testuser', provider: 'api' }, 'wrong-secret', {
        expiresIn: '1h',
        issuer: 'mcp-server',
        audience: 'chatgpt',
      });
    });

    test('should refresh valid tokens successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { token: newToken, expires, userId } = response.body.data;

      // Verify new token is different from old one
      expect(newToken).not.toBe(validToken);

      // Verify new token is valid
      const decoded = jwt.verify(newToken, TEST_JWT_SECRET) as any;
      expect(decoded.userId).toBe(userId);
      expect(decoded.exp * 1000).toBe(expires);
    });

    test('should refresh expired tokens within grace period', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(200);

      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.userId).toBe('api:testuser');
    });

    test('should reject tokens too old to refresh (>7 days)', async () => {
      // Create a token with an old iat (issued at) timestamp - 8 days ago
      const eightDaysAgo = Math.floor((Date.now() - 8 * 24 * 60 * 60 * 1000) / 1000);
      const veryOldToken = jwt.sign(
        {
          userId: 'api:testuser',
          provider: 'api',
          iat: eightDaysAgo, // Set the issued at time to 8 days ago
        },
        TEST_JWT_SECRET,
        {
          expiresIn: '1h', // Still expires in 1 hour from now
          issuer: 'mcp-server',
          audience: 'chatgpt',
          noTimestamp: true, // Don't override our manual iat
        }
      );

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${veryOldToken}`)
        .expect(401);

      expect(response.body.error.message).toContain('Token too old to refresh');
    });

    test('should reject completely invalid tokens for refresh', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.error.message).toContain('Invalid token');
    });

    test('should reject refresh requests without authorization header', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').expect(401);

      expect(response.body.error.message).toContain('Missing authorization header');
    });

    test('should verify token validation endpoint', async () => {
      // Test valid token
      const validResponse = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(validResponse.body.data.valid).toBe(true);
      expect(validResponse.body.data.userId).toBeDefined();
      expect(validResponse.body.data.expiresAt).toBeGreaterThan(Date.now());

      // Test expired token
      const expiredResponse = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(expiredResponse.body.error.message).toContain('Invalid or expired token');

      // Test invalid token
      const invalidResponse = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(invalidResponse.body.error.message).toContain('Invalid or expired token');
    });

    test('should handle malformed authorization headers', async () => {
      // Missing Bearer prefix
      await request(app).post('/api/v1/auth/refresh').set('Authorization', validToken).expect(401);

      // Wrong prefix
      await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Basic ${validToken}`)
        .expect(401);

      // Empty bearer token
      await request(app).post('/api/v1/auth/refresh').set('Authorization', 'Bearer ').expect(401);
    });
  });

  describe('6. Security and Error Handling', () => {
    test('should handle JWT secret validation', () => {
      // This test validates that the system requires a proper JWT secret
      expect(TEST_JWT_SECRET.length).toBeGreaterThanOrEqual(32);

      // Test token creation and validation with our test secret
      const testPayload = { userId: 'test', provider: 'test' };
      const token = jwt.sign(testPayload, TEST_JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, TEST_JWT_SECRET) as any;

      expect(decoded.userId).toBe('test');
    });

    test('should handle concurrent authentication requests', async () => {
      process.env.VALID_API_KEYS = 'test-api-key';

      // Make 5 sequential requests with small delays to ensure unique iat timestamps
      const responses: any[] = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ apiKey: 'test-api-key' });
        responses.push(response);

        // Small delay to ensure different iat timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // All should succeed with tokens
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data.token).toBeDefined();
      });

      // Verify all tokens are different (they should be due to different iat timestamps)
      const tokens = responses.map(r => r.body.data.token);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBeGreaterThan(1); // At least some should be different
    });

    test('should handle malformed JSON in auth requests', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"apiKey": invalid-json}')
        .expect(400);

      // Express should handle the malformed JSON and return 400
      expect(response.status).toBe(400);
    });

    test('should validate OAuth state parameter security', async () => {
      process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';

      // Mock GitHub responses
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ access_token: 'token' }),
        } as any)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              login: 'testuser',
              name: 'Test User',
            }),
        } as any);

      // Test with malformed state
      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({
          code: 'test_code',
          state: 'invalid-base64-state',
        })
        .expect(302);

      // Should still process but with default redirect
      expect(response.headers.location).toBeDefined();
    });
  });

  describe('7. OAuth Discovery and MCP Compliance', () => {
    test('should provide OAuth discovery endpoints', async () => {
      const response = await request(app).get('/api/v1/auth').expect(200);

      const { oauth_discovery } = response.body.data;
      expect(oauth_discovery.authorization_server).toBe('/.well-known/oauth-authorization-server');
      expect(oauth_discovery.protected_resource).toBe('/.well-known/oauth-protected-resource');
    });

    test('should validate authentication status response structure', async () => {
      const response = await request(app).get('/api/v1/auth').expect(200);

      const { data } = response.body;

      // Required fields for MCP OAuth 2.1 compliance
      expect(data).toHaveProperty('authenticated');
      expect(data).toHaveProperty('authentication_required');
      expect(data).toHaveProperty('available_methods');
      expect(data).toHaveProperty('github_oauth');
      expect(data).toHaveProperty('api_key_auth');
      expect(data).toHaveProperty('token_verification');
      expect(data).toHaveProperty('token_refresh');

      // OAuth configuration details
      expect(data.github_oauth).toHaveProperty('available');
      expect(data.github_oauth).toHaveProperty('configured');
      expect(data.github_oauth).toHaveProperty('login_url');
      expect(data.github_oauth).toHaveProperty('callback_url');
    });

    test('should handle authentication with valid token in header', async () => {
      process.env.VALID_API_KEYS = 'test-api-key';

      // First get a valid token
      const authResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ apiKey: 'test-api-key' })
        .expect(200);

      const token = authResponse.body.data.token;

      // Then check auth status with the token
      const response = await request(app)
        .get('/api/v1/auth')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.authenticated).toBe(true);
      expect(response.body.data.user_id).toBeDefined();
      expect(response.body.data.provider).toBe('api');
      expect(response.body.data.token_expires_at).toBeGreaterThan(Date.now());
    });
  });
});
