import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Request logger middleware with correlation IDs
 * Provides structured logging for all requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Generate or use existing correlation ID
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  
  // Set correlation ID in headers for response
  res.setHeader('X-Correlation-ID', correlationId);
  req.headers['x-correlation-id'] = correlationId;

  // Capture request start time
  const startTime = Date.now();

  // Log request
  const requestLog = {
    correlationId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      origin: req.headers.origin,
    },
    ip: req.ip || req.socket.remoteAddress,
  };

  console.log('📨 Incoming request:', JSON.stringify(requestLog));

  // Log response using finish event instead of monkey-patching
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const responseLog = {
      correlationId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    };

    console.log('📤 Outgoing response:', JSON.stringify(responseLog));

    // Log slow requests (> 1s)
    if (duration > 1000) {
      console.warn('⚠️ Slow request detected:', JSON.stringify({
        ...responseLog,
        warning: 'Request took longer than 1 second',
      }));
    }
  });

  next();
}

/**
 * Error logger middleware
 * Logs errors with correlation ID for tracking
 */
export function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const correlationId = req.headers['x-correlation-id'] as string;

  const errorLog = {
    correlationId,
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
    },
  };

  console.error('❌ Error occurred:', JSON.stringify(errorLog));

  next(err);
}
