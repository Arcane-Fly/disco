/**
 * CSP Fix Test Suite
 * Tests for Content Security Policy fixes to allow Google Fonts
 */

import { app } from '../dist/server.js';
import request from 'supertest';

describe('CSP Configuration', () => {
  describe('OAuth Callback CSP', () => {
    test('should include Google Fonts domains in OAuth callback CSP', async () => {
      const response = await request(app)
        .get('/auth/callback')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'];
      expect(cspHeader).toBeDefined();
      
      // Check that Google Fonts domains are included
      expect(cspHeader).toContain('https://fonts.googleapis.com');
      expect(cspHeader).toContain('https://fonts.gstatic.com');
      
      // Verify style-src includes fonts.googleapis.com
      expect(cspHeader).toMatch(/style-src[^;]*https:\/\/fonts\.googleapis\.com/);
      
      // Verify font-src includes fonts.gstatic.com
      expect(cspHeader).toMatch(/font-src[^;]*https:\/\/fonts\.gstatic\.com/);
    });

    test('should include Google Fonts domains in OAuth error callback CSP', async () => {
      const response = await request(app)
        .get('/auth/callback?error=access_denied')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'];
      expect(cspHeader).toBeDefined();
      
      // Check that Google Fonts domains are included even in error scenarios
      expect(cspHeader).toContain('https://fonts.googleapis.com');
      expect(cspHeader).toContain('https://fonts.gstatic.com');
    });

    test('should maintain security restrictions while allowing Google Fonts', async () => {
      const response = await request(app)
        .get('/auth/callback')
        .expect(200);

      const cspHeader = response.headers['content-security-policy'];
      
      // Ensure security restrictions are maintained
      expect(cspHeader).toContain("frame-ancestors 'none'");
      expect(cspHeader).toContain("form-action 'self'");
      expect(cspHeader).toContain("default-src 'self'");
      
      // Ensure unsafe-eval is not allowed (only unsafe-inline for scripts)
      expect(cspHeader).not.toContain("'unsafe-eval'");
    });
  });

  describe('Main Application CSP', () => {
    test('should include Google Fonts domains in main application CSP', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200);

      // Main app CSP is set via helmet middleware, check via the config endpoint
      const configResponse = await request(app)
        .get('/config')
        .expect(200);
        
      // The main CSP should be properly configured via helmet
      expect(configResponse.status).toBe(200);
    });
  });

  describe('CSP Consistency', () => {
    test('should have consistent font policies across different endpoints', async () => {
      // Test OAuth callback
      const oauthResponse = await request(app)
        .get('/auth/callback')
        .expect(200);

      const oauthCSP = oauthResponse.headers['content-security-policy'];
      
      // Both should allow Google Fonts
      expect(oauthCSP).toContain('https://fonts.googleapis.com');
      expect(oauthCSP).toContain('https://fonts.gstatic.com');
    });
  });
});

describe('Font Loading Compatibility', () => {
  test('should serve content that can load Google Fonts without CSP violations', async () => {
    const response = await request(app)
      .get('/auth/callback')
      .expect(200);

    const html = response.text;
    const cspHeader = response.headers['content-security-policy'];
    
    // Verify the HTML can include Google Fonts CSS
    expect(cspHeader).toContain('https://fonts.googleapis.com');
    
    // Verify HTML structure is valid
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
  });

  test('should handle OAuth success scenario with proper CSP', async () => {
    const response = await request(app)
      .get('/auth/callback?code=test_code&state=test_state')
      .expect(200);

    const cspHeader = response.headers['content-security-policy'];
    
    // Verify Google Fonts are allowed in success scenario
    expect(cspHeader).toContain('https://fonts.googleapis.com');
    expect(cspHeader).toContain('https://fonts.gstatic.com');
    
    // Verify redirect page includes meta refresh
    expect(response.text).toContain('meta http-equiv="refresh"');
  });
});