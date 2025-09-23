import { Request, Response, NextFunction } from 'express';

const memoryThreshold = parseInt(process.env.MEMORY_THRESHOLD || '80', 10);

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const memUsage = process.memoryUsage();
  const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  if (memPercent > memoryThreshold) {
    console.warn(`⚠️ High memory usage: ${memPercent.toFixed(1)}%`);
    if (global.gc) global.gc();
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      // Remove newlines and carriage returns from path for safe logging
      const sanitizedPath = req.path.replace(/[\r\n]/g, '');
      console.warn(`🐌 Slow request: ${req.method} ${sanitizedPath} - ${duration}ms`);
    }
  });

  next();
};
