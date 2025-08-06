import request from 'supertest';
import express from 'express';
import { authRouter } from '../src/api/auth';

describe('OAuth Authentication', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRouter);
  });

  describe('GET /api/v1/auth', () => {
    test('should return authentication status with setup instructions when OAuth not configured', async () => {
      // Clear OAuth environment variables for this test
      const originalClientId = process.env.GITHUB_CLIENT_ID;
      const originalClientSecret = process.env.GITHUB_CLIENT_SECRET;
      
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_SECRET;

      const response = await request(app)
        .get('/api/v1/auth')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.github_oauth.available).toBe(false);
      expect(response.body.data.github_oauth.setup_required).toBe(true);
      expect(response.body.data.setup_instructions).toBeDefined();
      expect(response.body.data.setup_instructions.step_1).toContain('GitHub OAuth App');

      // Restore environment variables
      if (originalClientId) process.env.GITHUB_CLIENT_ID = originalClientId;
      if (originalClientSecret) process.env.GITHUB_CLIENT_SECRET = originalClientSecret;
    });

    test('should detect placeholder values in OAuth configuration', async () => {
      // Set placeholder values
      process.env.GITHUB_CLIENT_ID = 'your-github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'your-github-client-secret';

      const response = await request(app)
        .get('/api/v1/auth')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.github_oauth.available).toBe(false);
      expect(response.body.data.github_oauth.has_placeholders).toBe(true);
      expect(response.body.data.github_oauth.setup_required).toBe(true);
    });

    test('should show OAuth as available when properly configured', async () => {
      // Set realistic OAuth values
      process.env.GITHUB_CLIENT_ID = 'a1b2c3d4e5f6g7h8i9j0';
      process.env.GITHUB_CLIENT_SECRET = 'real-github-client-secret-value';

      const response = await request(app)
        .get('/api/v1/auth')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.github_oauth.available).toBe(true);
      expect(response.body.data.github_oauth.has_placeholders).toBe(false);
      expect(response.body.data.github_oauth.setup_required).toBe(false);
      expect(response.body.data.github_oauth.login_url).toBe('/api/v1/auth/github');
    });

    test('should include OAuth discovery endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/auth')
        .expect(200);

      expect(response.body.data.oauth_discovery).toBeDefined();
      expect(response.body.data.oauth_discovery.authorization_server).toBe('/.well-known/oauth-authorization-server');
      expect(response.body.data.oauth_discovery.protected_resource).toBe('/.well-known/oauth-protected-resource');
    });
  });

  describe('GET /api/v1/auth/github', () => {
    test('should return error when OAuth not configured', async () => {
      // Clear OAuth environment variables for this test
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_SECRET;

      const response = await request(app)
        .get('/api/v1/auth/github')
        .expect(503);

      expect(response.body.status).toBe('error');
      expect(response.body.error.message).toContain('GitHub OAuth not configured');
      expect(response.body.error.details.setup_instructions).toBeDefined();
    });

    test('should return error when OAuth has placeholder values', async () => {
      process.env.GITHUB_CLIENT_ID = 'your-github-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'your-github-client-secret';

      const response = await request(app)
        .get('/api/v1/auth/github')
        .expect(503);

      expect(response.body.status).toBe('error');
      expect(response.body.error.message).toContain('placeholder values');
      expect(response.body.error.details.setup_instructions).toBeDefined();
    });

    test('should redirect to GitHub when properly configured', async () => {
      process.env.GITHUB_CLIENT_ID = 'a1b2c3d4e5f6g7h8i9j0';
      process.env.GITHUB_CLIENT_SECRET = 'real-github-client-secret-value';

      const response = await request(app)
        .get('/api/v1/auth/github')
        .expect(302);

      expect(response.headers.location).toContain('github.com/login/oauth/authorize');
      expect(response.headers.location).toContain('client_id=a1b2c3d4e5f6g7h8i9j0');
    });
  });

  describe('GET /api/v1/auth/github/callback', () => {
    test('should handle callback without authorization code', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .set('Accept', 'application/json')
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.error.message).toContain('Missing authorization code');
    });

    test('should redirect browser requests to callback page', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .set('Accept', 'text/html')
        .expect(302);

      expect(response.headers.location).toBe('/auth/callback');
    });
  });
});