import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  console.log(`📨 ${req.method} ${req.url} - ${req.ip} - ${new Date().toISOString()}`);

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const logBody = { ...req.body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authToken'];
    sensitiveFields.forEach(field => {
      if (logBody[field]) {
        logBody[field] = '[REDACTED]';
      }
    });

    console.log('📋 Request body:', JSON.stringify(logBody, null, 2));
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (body: any) {
    const duration = Date.now() - start;

    // Log response
    console.log(`📤 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);

    // Log response body for errors or in development
    if (res.statusCode >= 400 || process.env.NODE_ENV === 'development') {
      console.log('📋 Response body:', JSON.stringify(body, null, 2));
    }

    return originalJson.call(this, body);
  };

  next();
};
