import type { Response } from 'express';
import type { RequestWithUser } from '../types/index.js';

export const metricsHandler = async (req: RequestWithUser, res: Response) => {
  const containerManager = req.app.locals.containerManager || {
    getStats: () => ({ activeSessions: 0 }),
  };

  const metrics = {
    containers: {
      active: containerManager.getStats().activeSessions,
      limit: parseInt(process.env.MAX_CONTAINERS || '20', 10),
    },
    memory: {
      usage: process.memoryUsage(),
      percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
    },
    uptime: {
      seconds: process.uptime(),
      formatted: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    },
    requests: {
      // This would need to be tracked via middleware if needed
      total: 'tracking-not-implemented',
    },
    environment: {
      node_env: process.env.NODE_ENV || 'development',
      max_containers: process.env.MAX_CONTAINERS || '20',
      memory_threshold: process.env.MEMORY_THRESHOLD || '75',
      container_timeout: process.env.CONTAINER_TIMEOUT_MINUTES || '15',
    },
    timestamp: new Date().toISOString(),
  };

  res.json(metrics);
};
