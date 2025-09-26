/**
 * Test-specific middleware helpers
 * Provides mock middleware for testing environments
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Mock rate limiting middleware for tests
 * Disables rate limiting when DISABLE_RATE_LIMITING is set
 */
export function createTestRateLimiter() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in test environment
    if (process.env.DISABLE_RATE_LIMITING === 'true') {
      return next();
    }
    
    // Mock rate limit headers for consistency
    res.set({
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': '999',
      'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
    });
    
    next();
  };
}

/**
 * Test authentication middleware
 * Provides mock authentication for test scenarios
 */
export function createTestAuthMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'test') {
      // Mock user session for tests
      (req as any).user = {
        id: 'test-user-id',
        username: 'test-user',
        email: 'test@example.com'
      };
    }
    next();
  };
}

/**
 * Test server cleanup utility
 * Ensures proper server shutdown in tests
 */
export async function cleanupTestServer(server: any): Promise<void> {
  return new Promise((resolve) => {
    if (server && server.listening) {
      server.close(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}