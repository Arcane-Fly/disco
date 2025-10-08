import request from 'supertest';
import express from 'express';
import { securityInputValidationMiddleware } from '../src/middleware/securityAudit.js';
describe('OAuth Security Middleware Fix', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Create an API router, just like in the real server
    const apiRouter = express.Router();
    // Apply security middleware only to API routes (like in server.ts)
    apiRouter.use(securityInputValidationMiddleware);
    // Test routes on the API router
    apiRouter.get('/v1/auth/github', (req, res) => {
      res.json({ success: true, endpoint: 'github-oauth' });
    });
    apiRouter.get('/v1/auth/github/callback', (req, res) => {
      res.json({ success: true, endpoint: 'github-callback' });
    });
    apiRouter.get('/v1/regular-endpoint', (req, res) => {
      res.json({ success: true, endpoint: 'regular' });
    });
    apiRouter.get('/v1/auth/github/extra', (req, res) => {
      res.json({ success: true, endpoint: 'github-extra' });
    });
    // Mount the API router on /api (like in server.ts)
    app.use('/api', apiRouter);
    // Root-level OAuth discovery endpoints (not under /api)
    app.get('/.well-known/oauth-authorization-server', (req, res) => {
      res.json({ success: true, endpoint: 'oauth-authorization-server' });
    });
    app.get('/.well-known/oauth-protected-resource', (req, res) => {
      res.json({ success: true, endpoint: 'oauth-protected-resource' });
    });
    app.post('/oauth/token', (req, res) => {
      res.json({ success: true, endpoint: 'oauth-token' });
    });
  });
  describe('OAuth endpoints should bypass security validation', () => {
    const normalUserAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const suspiciousReferer = 'http://example.com/test()';
    test('should allow normal browser headers for GitHub OAuth initiation', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github?redirect_to=%2F')
        .set('User-Agent', normalUserAgent)
        .set('Referer', suspiciousReferer)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.endpoint).toBe('github-oauth');
    });
    test('should allow normal browser headers for GitHub OAuth callback', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .set('User-Agent', normalUserAgent)
        .set('Referer', suspiciousReferer)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.endpoint).toBe('github-callback');
    });
    test('should allow normal headers for OAuth authorization server discovery', async () => {
      const response = await request(app)
        .get('/.well-known/oauth-authorization-server')
        .set('User-Agent', normalUserAgent)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.endpoint).toBe('oauth-authorization-server');
    });
    test('should allow normal headers for OAuth protected resource discovery', async () => {
      const response = await request(app)
        .get('/.well-known/oauth-protected-resource')
        .set('User-Agent', normalUserAgent)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.endpoint).toBe('oauth-protected-resource');
    });
    test('should allow normal headers for OAuth token endpoint', async () => {
      const response = await request(app)
        .post('/oauth/token')
        .set('User-Agent', normalUserAgent)
        .send({ grant_type: 'authorization_code' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.endpoint).toBe('oauth-token');
    });
  });
  describe('Non-OAuth endpoints should still be protected', () => {
    test('should block suspicious patterns in regular API endpoints', async () => {
      const suspiciousUserAgent = 'Mozilla/5.0 (Macintosh; Intel) sqlmap/1.0';
      const response = await request(app)
        .get('/api/v1/regular-endpoint')
        .set('User-Agent', suspiciousUserAgent)
        .expect(400);
      expect(response.body.status).toBe('error');
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
    test('should block LDAP injection patterns in regular endpoints', async () => {
      const ldapUserAgent = 'Mozilla/5.0 (test)&(cn=admin)';
      const response = await request(app)
        .get('/api/v1/regular-endpoint')
        .set('User-Agent', ldapUserAgent)
        .expect(400);
      expect(response.body.status).toBe('error');
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
    test('should allow normal User-Agent without suspicious patterns in regular endpoints', async () => {
      // Use a clean User-Agent without any suspicious characters (no ; & | ` $ () {} [])
      const cleanUserAgent = 'Mozilla/5.0 Chrome/91.0.4472.124 Safari/537.36';
      const response = await request(app)
        .get('/api/v1/regular-endpoint')
        .set('User-Agent', cleanUserAgent)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe('Edge cases and comprehensive validation', () => {
    test('should handle OAuth endpoints with query parameters', async () => {
      const normalUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const response = await request(app)
        .get('/api/v1/auth/github?redirect_to=http://localhost:3000&state=abc123')
        .set('User-Agent', normalUserAgent)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    test('should handle case sensitivity for OAuth paths', async () => {
      // Test that exact path matching works (case sensitive)
      const response = await request(app)
        .get('/API/V1/AUTH/GITHUB') // Different case
        .set('User-Agent', 'Mozilla/5.0 (test)')
        .expect(400);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
    test('should not bypass security for similar but different paths', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github/extra') // Similar but different path
        .set('User-Agent', 'Mozilla/5.0 (test)') // This should be blocked
        .expect(400); // Should be blocked by security, not pass through
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
  });
});
//# sourceMappingURL=oauth-security-fix.test.js.map
