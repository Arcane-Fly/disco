import { Request, Response, NextFunction } from 'express';
import { getStringOrDefault } from '../lib/guards.js';
import { securityComplianceManager } from '../lib/securityComplianceManager.js';

/**
 * Security audit middleware that logs all requests for compliance and security monitoring
 */
export const securityAuditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Store original response methods to intercept response
  const originalJson = res.json;
  const originalSend = res.send;
  const originalEnd = res.end;

  let responseBody: any;
  let responseLogged = false;

  // Add security headers early, before any response is sent
  addSecurityHeaders(res);

  // Intercept response to capture status code and response time
  const logResponse = async () => {
    if (responseLogged) return;
    responseLogged = true;

    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Determine action based on request
    const action = determineAction(req);
    const resource = determineResource(req);

    try {
      const logId = await securityComplianceManager.logSecurityEvent(req, action, resource, {
        responseTime,
        statusCode,
        responseBody: shouldLogResponseBody(req, res) ? responseBody : undefined,
      });

      // Only add audit log ID header if response hasn't been sent yet
      if (!res.headersSent) {
        res.setHeader('X-Audit-Log-Id', logId);
      }
    } catch (error) {
      console.error('Security audit logging failed:', error);
    }
  };

  // Override response methods
  res.json = function (body: any) {
    responseBody = body;
    const result = originalJson.call(this, body);
    // Log asynchronously to avoid blocking
    logResponse().catch(err => console.error('Async logging failed:', err));
    return result;
  };

  res.send = function (body: any) {
    responseBody = body;
    const result = originalSend.call(this, body);
    // Log asynchronously to avoid blocking
    logResponse().catch(err => console.error('Async logging failed:', err));
    return result;
  };

  res.end = function (chunk?: any, encoding?: any, cb?: any) {
    if (chunk) responseBody = chunk;
    const result = originalEnd.call(this, chunk, encoding, cb);
    // Log asynchronously to avoid blocking
    logResponse().catch(err => console.error('Async logging failed:', err));
    return result;
  };

  next();
};

/**
 * Determine the action being performed based on the request
 */
function determineAction(req: Request): string {
  const method = req.method.toLowerCase();
  const path = req.originalUrl.toLowerCase();

  // Authentication actions
  if (path.includes('/auth')) {
    if (path.includes('/login') || path.includes('/token')) return 'authenticate';
    if (path.includes('/logout')) return 'logout';
    if (path.includes('/refresh')) return 'token_refresh';
    return 'auth_operation';
  }

  // Container actions
  if (path.includes('/container')) {
    if (method === 'post') return 'container_create';
    if (method === 'delete') return 'container_destroy';
    if (method === 'get') return 'container_access';
    return 'container_operation';
  }

  // File operations
  if (path.includes('/file')) {
    if (method === 'post') return 'file_create';
    if (method === 'put') return 'file_update';
    if (method === 'delete') return 'file_delete';
    if (method === 'get') return 'file_read';
    return 'file_operation';
  }

  // Terminal operations
  if (path.includes('/terminal')) {
    if (path.includes('/command')) return 'terminal_command';
    if (path.includes('/session')) return 'terminal_session';
    return 'terminal_operation';
  }

  // Security operations
  if (path.includes('/security')) {
    if (path.includes('/incident')) return 'security_incident';
    if (path.includes('/audit')) return 'audit_access';
    if (path.includes('/compliance')) return 'compliance_access';
    return 'security_operation';
  }

  // Performance operations
  if (path.includes('/performance')) {
    return 'performance_optimization';
  }

  // Admin operations
  if (path.includes('/admin')) {
    return 'admin_operation';
  }

  // Data operations
  if (path.includes('/data') || path.includes('/rag') || path.includes('/search')) {
    return 'data_access';
  }

  // Default action based on HTTP method
  const methodActions = {
    get: 'read_access',
    post: 'create_operation',
    put: 'update_operation',
    patch: 'modify_operation',
    delete: 'delete_operation',
    head: 'metadata_access',
    options: 'preflight_check',
  };

  return methodActions[method] || 'unknown_operation';
}

/**
 * Determine the resource being accessed
 */
function determineResource(req: Request): string {
  const path = getStringOrDefault(req.originalUrl.split('?')[0], '/'); // Remove query parameters

  // Extract main resource from path
  const pathParts = path.split('/').filter(part => part.length > 0);

  if (pathParts.length === 0) return 'root';

  // Remove 'api' and version parts
  const filteredParts = pathParts.filter(part => !part.match(/^(api|v\d+)$/i));

  if (filteredParts.length === 0) return 'api_root';

  // Join significant path parts
  return filteredParts.slice(0, 3).join('/'); // Take up to 3 significant parts
}

/**
 * Determine if response body should be logged based on data classification
 */
function shouldLogResponseBody(req: Request, res: Response): boolean {
  const path = req.originalUrl.toLowerCase();
  const statusCode = res.statusCode;

  // Never log response bodies for certain endpoints
  const excludedPaths = ['/auth/token', '/security/audit-logs', '/files', '/terminal/command'];

  if (excludedPaths.some(excluded => path.includes(excluded))) {
    return false;
  }

  // Only log error responses
  if (statusCode >= 400) {
    return true;
  }

  // Log successful responses for security-related operations
  if (path.includes('/security') || path.includes('/admin')) {
    return true;
  }

  return false;
}

/**
 * Add comprehensive security headers
 */
function addSecurityHeaders(res: Response): void {
  // Check if headers have already been sent
  if (res.headersSent) {
    return;
  }

  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control framing (already set by helmet, but ensure it's set)
  if (!res.getHeader('X-Frame-Options')) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }

  // Content Security Policy for API responses
  if (!res.getHeader('Content-Security-Policy')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'none'; object-src 'none';"
    );
  }

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature Policy / Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS for HTTPS (only add if the request was over HTTPS)
  if (res.req?.secure || res.req?.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Custom security headers
  res.setHeader('X-Security-Audit', 'enabled');
  res.setHeader('X-Compliance-Level', 'soc2');
}

/**
 * Rate limiting middleware with enhanced security logging
 */
export const securityRateLimitMiddleware = (windowMs: number, max: number, message: string) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (req: Request, res: Response, next: NextFunction) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    const key = `${clientIp}:${req.originalUrl}`;

    const current = requests.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = now + windowMs;
    }

    current.count++;
    requests.set(key, current);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(current.resetTime).toISOString());

    if (current.count > max) {
      // Log rate limit violation as security incident
      try {
        await securityComplianceManager.logSecurityEvent(
          req,
          'rate_limit_violation',
          req.originalUrl,
          {
            clientIp,
            requestCount: current.count,
            limit: max,
            windowMs,
          }
        );
      } catch (error) {
        console.error('Failed to log rate limit violation:', error);
      }

      return res.status(429).json({
        status: 'error',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: message || 'Rate limit exceeded',
          retryAfter: Math.ceil((current.resetTime - now) / 1000),
        },
      });
    }

    next();
  };
};

/**
 * Input validation middleware with security logging
 */
export const securityInputValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip validation for favicon and other static assets
  const excludedPaths = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];
  if (excludedPaths.includes(req.path)) {
    return next();
  }

  // Skip validation for OAuth/discovery endpoints that must accept normal browser headers
  const oauthExcludedPaths = [
    '/v1/auth', // Auth status endpoint - needs normal browser headers
    '/v1/auth/github', // OAuth initiation
    '/v1/auth/github/callback', // OAuth callback
    '/v1/auth/session', // Session validation - needs normal browser headers
    '/v1/auth/logout', // Logout - needs normal browser headers
    '/auth/session', // Next.js session endpoint
    '/auth/logout', // Next.js logout endpoint
    '/.well-known/oauth-authorization-server', // This is a root path
    '/.well-known/oauth-protected-resource', // This is a root path
    '/oauth/token', // This is a root path
  ];

  if (oauthExcludedPaths.includes(req.path)) {
    return next();
  }

  const suspiciousPatterns = [
    // SQL Injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|OR|AND)\b.*(\b(FROM|WHERE|JOIN|HAVING)\b|[';]|--|\*|\/\*))/i,

    // XSS patterns
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,

    // Command injection patterns
    /[;&|`$(){}[\]]/,

    // Path traversal
    /\.\.[/\\]/,

    // NoSQL injection
    /\$where|\$regex|\$gt|\$lt|\$ne/i,

    // LDAP injection
    /[()&|!]/,
  ];

  const checkValue = (value: string, path: string): string[] => {
    const violations: string[] = [];

    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(value)) {
        violations.push(`Pattern ${index + 1} matched in ${path}`);
      }
    });

    return violations;
  };

  const scanObject = (obj: any, basePath = ''): string[] => {
    const violations: string[] = [];

    if (typeof obj === 'string') {
      violations.push(...checkValue(obj, basePath));
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        violations.push(...scanObject(item, `${basePath}[${index}]`));
      });
    } else if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = basePath ? `${basePath}.${key}` : key;
        violations.push(...checkValue(key, `${currentPath}(key)`));
        violations.push(...scanObject(value, currentPath));
      });
    }

    return violations;
  };

  // Check query parameters
  const queryViolations = scanObject(req.query, 'query');

  // Check request body
  const bodyViolations = req.body ? scanObject(req.body, 'body') : [];

  // Check headers (only certain ones)
  const headerViolations = scanObject(
    {
      'user-agent': req.headers['user-agent'],
      referer: req.headers.referer,
      'x-forwarded-for': req.headers['x-forwarded-for'],
    },
    'headers'
  );

  const allViolations = [...queryViolations, ...bodyViolations, ...headerViolations];

  if (allViolations.length > 0) {
    // Log security violation
    securityComplianceManager
      .logSecurityEvent(req, 'input_validation_violation', 'user_input', {
        violations: allViolations,
        query: req.query,
        body: req.body ? '[REDACTED]' : undefined,
        suspiciousHeaders: {
          'user-agent': req.headers['user-agent'],
          referer: req.headers.referer,
        },
      })
      .catch(console.error);

    const errorResponse: any = {
      status: 'error',
      error: {
        code: 'INVALID_INPUT',
        message: 'Input validation failed',
        violations: allViolations.length,
      },
    };

    // Add detailed violation information in development
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.error.details = allViolations;
    }

    return res.status(400).json(errorResponse);
  }

  next();
};
