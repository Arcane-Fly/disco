import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Enhanced CSP middleware with nonce generation for Google Fonts support
 * This replaces helmet's CSP with dynamic nonce generation
 */

export interface CSPRequest extends Request {
  nonce?: string;
}

export function enhancedCSPMiddleware(req: CSPRequest, res: Response, next: NextFunction) {
  // Generate a unique nonce for this request
  const nonce = crypto.randomBytes(16).toString('base64');

  // Store nonce on request for use in templates/views
  req.nonce = nonce;

  // Set comprehensive CSP with nonce and Google Fonts support for all routes
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://unpkg.com`, // Keep compatibility with existing setup
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' blob: data: https: https://avatars.githubusercontent.com", // Explicitly allow GitHub avatars
    "connect-src 'self' wss: ws: https://webcontainer.io",
    "frame-ancestors 'self' https://chat.openai.com https://chatgpt.com https://claude.ai",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspHeader);
  res.setHeader('X-Nonce', nonce);

  next();
}

/**
 * Middleware specifically for Next.js routes to set enhanced CSP
 * Use this for routes that serve Next.js pages
 */
export function nextjsCSPMiddleware(req: CSPRequest, res: Response, next: NextFunction) {
  // Generate nonce if not already present
  if (!req.nonce) {
    req.nonce = crypto.randomBytes(16).toString('base64');
  }

  const nonce = req.nonce;

  // Set comprehensive CSP with nonce and Google Fonts support
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`, // Keep unsafe-eval for development
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' blob: data: https: https://avatars.githubusercontent.com", // Explicitly allow GitHub avatars
    "connect-src 'self' wss: ws: https://webcontainer.io",
    "frame-ancestors 'self' https://chat.openai.com https://chatgpt.com https://claude.ai",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspHeader);
  res.setHeader('X-Nonce', nonce);

  next();
}

/**
 * Get nonce from Express request object
 */
export function getNonceFromRequest(req: CSPRequest): string | undefined {
  return req.nonce;
}
