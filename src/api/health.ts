import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     description: Returns the current health status of the MCP server including system metrics and service status
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthStatus'
 *                 - type: object
 *                   properties:
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                           description: Used heap memory in MB
 *                         total:
 *                           type: number
 *                           description: Total heap memory in MB
 *                         external:
 *                           type: number
 *                           description: External memory in MB
 *                         rss:
 *                           type: number
 *                           description: Resident Set Size in MB
 *                     containers:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: number
 *                           description: Number of active containers
 *                         max:
 *                           type: number
 *                           description: Maximum allowed containers
 *                         pool_ready:
 *                           type: number
 *                           description: Containers ready in pool
 *                         pool_initializing:
 *                           type: number
 *                           description: Containers currently initializing
 *                     services:
 *                       type: object
 *                       properties:
 *                         webcontainer:
 *                           type: string
 *                           enum: [enabled, disabled]
 *                         redis:
 *                           type: string
 *                           enum: [enabled, disabled]
 *                         github:
 *                           type: string
 *                           enum: [enabled, disabled]
 *             examples:
 *               healthy:
 *                 summary: Healthy server response
 *                 value:
 *                   status: healthy
 *                   timestamp: "2024-01-26T10:30:00.000Z"
 *                   uptime: 3600
 *                   version: "1.0.0"
 *                   node_version: "v20.10.0"
 *                   environment: "production"
 *                   memory:
 *                     used: 128
 *                     total: 256
 *                     external: 32
 *                     rss: 180
 *                   containers:
 *                     active: 5
 *                     max: 50
 *                     pool_ready: 3
 *                     pool_initializing: 0
 *                   services:
 *                     webcontainer: enabled
 *                     redis: enabled
 *                     github: enabled
 *       503:
 *         description: Server is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const stats = containerManager.getStats();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: process.env.npm_package_version || '1.0.0',
      node_version: process.version,
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      },
      containers: {
        active: stats.activeSessions,
        max: stats.maxContainers,
        pool_ready: stats.poolReady,
        pool_initializing: stats.poolInitializing
      },
      services: {
        webcontainer: process.env.WEBCONTAINER_API_KEY ? 'enabled' : 'disabled',
        redis: process.env.REDIS_URL ? 'enabled' : 'disabled',
        github: process.env.GITHUB_CLIENT_ID ? 'enabled' : 'disabled'
      }
    };

    // Check if system is under stress
    if (stats.activeSessions > stats.maxContainers * 0.8) {
      health.status = 'warning';
    }

    if (memoryUsage.heapUsed > memoryUsage.heapTotal * 0.9) {
      health.status = 'warning';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * GET /health/ready
 * Readiness probe for Railway
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check if essential services are available
    const checks = {
      server: true,
      webcontainer: !!process.env.WEBCONTAINER_API_KEY,
      jwt: !!process.env.JWT_SECRET
    };

    const allReady = Object.values(checks).every(check => check === true);

    if (allReady) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks
      });
    }

  } catch (error) {
    console.error('Readiness check error:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    });
  }
});

/**
 * GET /health/live
 * Liveness probe for Railway
 */
router.get('/live', async (_req: Request, res: Response) => {
  try {
    // Basic liveness check
    const memoryUsage = process.memoryUsage();
    const isAlive = memoryUsage.heapUsed < memoryUsage.heapTotal * 0.95;

    if (isAlive) {
      res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime())
      });
    } else {
      res.status(503).json({
        status: 'not alive',
        timestamp: new Date().toISOString(),
        reason: 'Memory usage too high'
      });
    }

  } catch (error) {
    console.error('Liveness check error:', error);
    res.status(503).json({
      status: 'not alive',
      timestamp: new Date().toISOString(),
      error: 'Liveness check failed'
    });
  }
});

/**
 * GET /health/metrics
 * Metrics endpoint for monitoring
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const stats = containerManager.getStats();
    const memoryUsage = process.memoryUsage();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      memory_heap_used_bytes: memoryUsage.heapUsed,
      memory_heap_total_bytes: memoryUsage.heapTotal,
      memory_external_bytes: memoryUsage.external,
      memory_rss_bytes: memoryUsage.rss,
      containers_active_total: stats.activeSessions,
      containers_max_total: stats.maxContainers,
      containers_pool_ready_total: stats.poolReady,
      containers_pool_initializing_total: stats.poolInitializing,
      containers_by_user: stats.sessionsByUser
    };

    res.json(metrics);

  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      error: 'Failed to collect metrics'
    });
  }
});

export { router as healthRouter };