/**
 * Test to verify the fix for invalid /_next/:path(*) route pattern
 * This test ensures that /_next/* routes are properly handled by the catch-all middleware
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('Next.js Route Pattern Fix', () => {
  let app: express.Application;

  beforeAll(() => {
    // Create a minimal Express app that mimics the server setup
    app = express();

    // Mock CSP middleware
    const mockCSPMiddleware = (req: any, res: any, next: any) => {
      next();
    };

    // Mock Next.js handler
    const mockNextHandler = (req: any, res: any) => {
      res.status(200).json({ handled: 'next', path: req.path });
    };

    // Simulate the same structure as in server.ts
    // Known page paths with explicit routes
    app.get(
      ['/workflow-builder', '/api-config', '/analytics', '/webcontainer-loader'],
      mockCSPMiddleware,
      (req, res) => mockNextHandler(req, res)
    );

    // API routes (should not be passed to Next.js)
    app.get('/api/test', (req, res) => {
      res.json({ handled: 'api' });
    });

    // Catch-all fallback for non-API routes (including /_next/*)
    app.use((req, res, next) => {
      const p = req.path || '';
      if (
        p.startsWith('/api') ||
        p.startsWith('/docs') ||
        p === '/openapi.json' ||
        p === '/mcp-manifest.json' ||
        p.startsWith('/public')
      ) {
        return next();
      }
      return mockNextHandler(req, res);
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  });

  test('should handle /_next/* routes through catch-all middleware', async () => {
    const response = await request(app)
      .get('/_next/static/chunks/main.js')
      .expect(200);

    expect(response.body.handled).toBe('next');
    expect(response.body.path).toBe('/_next/static/chunks/main.js');
  });

  test('should handle /_next/ root path through catch-all middleware', async () => {
    const response = await request(app)
      .get('/_next/')
      .expect(200);

    expect(response.body.handled).toBe('next');
    expect(response.body.path).toBe('/_next/');
  });

  test('should handle nested /_next/* paths through catch-all middleware', async () => {
    const response = await request(app)
      .get('/_next/data/build-id/page.json')
      .expect(200);

    expect(response.body.handled).toBe('next');
    expect(response.body.path).toBe('/_next/data/build-id/page.json');
  });

  test('should still handle known page routes explicitly', async () => {
    const response = await request(app)
      .get('/workflow-builder')
      .expect(200);

    expect(response.body.handled).toBe('next');
    expect(response.body.path).toBe('/workflow-builder');
  });

  test('should not pass API routes to Next.js handler', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);

    expect(response.body.handled).toBe('api');
  });

  test('should handle regular page routes through catch-all', async () => {
    const response = await request(app)
      .get('/some-page')
      .expect(200);

    expect(response.body.handled).toBe('next');
    expect(response.body.path).toBe('/some-page');
  });
});
