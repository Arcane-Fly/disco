import { Router } from 'express';
import { containerManager } from '../lib/containerManager.js';
import os from 'os';
const router = Router();
/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Performance analytics dashboard
 *     description: Returns the monitoring dashboard HTML interface
 *     responses:
 *       200:
 *         description: Dashboard HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', async (_req, res) => {
    // Serve the dashboard HTML
    res.sendFile('dashboard.html', { root: './public' });
});
/**
 * @swagger
 * /dashboard/api/metrics:
 *   get:
 *     tags: [Dashboard]
 *     summary: Real-time system metrics
 *     description: Returns comprehensive system metrics for dashboard visualization
 *     responses:
 *       200:
 *         description: System metrics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 system:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       description: System uptime in seconds
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                         total:
 *                           type: number
 *                         usage_percent:
 *                           type: number
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         load_average:
 *                           type: array
 *                           items:
 *                             type: number
 *                 containers:
 *                   type: object
 *                   properties:
 *                     active:
 *                       type: number
 *                     total_created:
 *                       type: number
 *                     pool_ready:
 *                       type: number
 *                     utilization_percent:
 *                       type: number
 *                 performance:
 *                   type: object
 *                   properties:
 *                     avg_response_time:
 *                       type: number
 *                     requests_per_minute:
 *                       type: number
 *                     error_rate:
 *                       type: number
 *                     success_rate:
 *                       type: number
 */
router.get('/api/metrics', async (_req, res) => {
    try {
        const stats = containerManager.getStats();
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        // Calculate memory usage percentage
        const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        // Calculate container utilization
        const containerUtilization = stats.maxContainers > 0 ? (stats.activeSessions / stats.maxContainers) * 100 : 0;
        const metrics = {
            timestamp: new Date().toISOString(),
            system: {
                uptime: Math.floor(uptime),
                memory: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                    external: Math.round(memoryUsage.external / 1024 / 1024),
                    rss: Math.round(memoryUsage.rss / 1024 / 1024),
                    usage_percent: Math.round(memoryUsagePercent * 100) / 100,
                },
                cpu: {
                    load_average: process.platform !== 'win32' ? os.loadavg() || [0, 0, 0] : [0, 0, 0],
                },
            },
            containers: {
                active: stats.activeSessions,
                total_created: stats.activeSessions, // Use activeSessions as proxy for now
                pool_ready: stats.poolReady,
                pool_initializing: stats.poolInitializing,
                max_containers: stats.maxContainers,
                utilization_percent: Math.round(containerUtilization * 100) / 100,
                sessions_by_user: stats.sessionsByUser,
            },
            performance: {
                avg_response_time: getAverageResponseTime(),
                requests_per_minute: getRequestsPerMinute(),
                error_rate: getErrorRate(),
                success_rate: getSuccessRate(),
            },
            health_status: getHealthStatus(memoryUsagePercent, containerUtilization),
        };
        res.json(metrics);
    }
    catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({
            error: 'Failed to collect metrics',
            timestamp: new Date().toISOString(),
        });
    }
});
/**
 * @swagger
 * /dashboard/api/historical:
 *   get:
 *     tags: [Dashboard]
 *     summary: Historical metrics data
 *     description: Returns historical performance data for trend analysis
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d, 30d]
 *         description: Time period for historical data
 *     responses:
 *       200:
 *         description: Historical metrics
 */
router.get('/api/historical', async (req, res) => {
    try {
        const period = req.query.period || '1h';
        // In a production system, this would query a time-series database
        // For now, generate sample historical data
        const historicalData = generateHistoricalData(period);
        res.json({
            period,
            data: historicalData,
            generated_at: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Historical metrics error:', error);
        res.status(500).json({
            error: 'Failed to retrieve historical data',
        });
    }
});
/**
 * @swagger
 * /dashboard/api/alerts:
 *   get:
 *     tags: [Dashboard]
 *     summary: System alerts and warnings
 *     description: Returns current system alerts and performance warnings
 *     responses:
 *       200:
 *         description: Current alerts
 */
router.get('/api/alerts', async (_req, res) => {
    try {
        const alerts = generateCurrentAlerts();
        res.json({
            alerts,
            alert_count: alerts.length,
            last_updated: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Alerts error:', error);
        res.status(500).json({
            error: 'Failed to retrieve alerts',
        });
    }
});
// Helper functions for metrics calculation
function getAverageResponseTime() {
    // In a real implementation, this would track actual response times
    // For now, return a simulated value based on system load
    const memUsage = process.memoryUsage();
    const loadFactor = memUsage.heapUsed / memUsage.heapTotal;
    return Math.round((50 + loadFactor * 200) * 100) / 100; // 50-250ms range
}
function getRequestsPerMinute() {
    // In a real implementation, this would track actual request counts
    // For now, return a simulated value
    return Math.round(Math.random() * 100) + 20; // 20-120 req/min
}
function getErrorRate() {
    // In a real implementation, this would track actual errors
    const memUsage = process.memoryUsage();
    const errorFactor = memUsage.heapUsed / memUsage.heapTotal;
    return Math.round(errorFactor * 5 * 100) / 100; // 0-5% range
}
function getSuccessRate() {
    return Math.round((100 - getErrorRate()) * 100) / 100;
}
function getHealthStatus(memoryPercent, containerUtilization) {
    if (memoryPercent > 90 || containerUtilization > 90) {
        return 'critical';
    }
    else if (memoryPercent > 75 || containerUtilization > 75) {
        return 'warning';
    }
    else {
        return 'healthy';
    }
}
function generateHistoricalData(period) {
    const now = Date.now();
    const intervals = {
        '1h': { points: 60, interval: 60000 }, // 1 minute intervals for 1 hour
        '6h': { points: 72, interval: 300000 }, // 5 minute intervals for 6 hours
        '24h': { points: 96, interval: 900000 }, // 15 minute intervals for 24 hours
        '7d': { points: 168, interval: 3600000 }, // 1 hour intervals for 7 days
        '30d': { points: 180, interval: 14400000 }, // 4 hour intervals for 30 days
    };
    const config = intervals[period] || intervals['1h'];
    const data = [];
    for (let i = config.points - 1; i >= 0; i--) {
        const timestamp = new Date(now - i * config.interval);
        const baseValue = 50 + Math.sin((i / config.points) * Math.PI * 2) * 20;
        data.push({
            timestamp: timestamp.toISOString(),
            memory_usage: Math.round((baseValue + Math.random() * 10) * 100) / 100,
            container_usage: Math.round((baseValue * 0.8 + Math.random() * 15) * 100) / 100,
            response_time: Math.round((100 + Math.random() * 50) * 100) / 100,
            requests_per_minute: Math.round(60 + Math.random() * 40),
            error_rate: Math.round(Math.random() * 3 * 100) / 100,
        });
    }
    return data;
}
function generateCurrentAlerts() {
    const alerts = [];
    const stats = containerManager.getStats();
    const memoryUsage = process.memoryUsage();
    // Memory usage alert
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (memoryPercent > 85) {
        alerts.push({
            id: 'high_memory',
            severity: memoryPercent > 95 ? 'critical' : 'warning',
            title: 'High Memory Usage',
            message: `Memory usage is at ${Math.round(memoryPercent)}%`,
            created_at: new Date().toISOString(),
            suggested_action: 'Consider restarting containers or scaling up resources',
        });
    }
    // Container utilization alert
    if (stats.maxContainers > 0) {
        const utilization = (stats.activeSessions / stats.maxContainers) * 100;
        if (utilization > 80) {
            alerts.push({
                id: 'high_container_usage',
                severity: utilization > 95 ? 'critical' : 'warning',
                title: 'High Container Utilization',
                message: `Container utilization is at ${Math.round(utilization)}%`,
                created_at: new Date().toISOString(),
                suggested_action: 'Consider increasing container limits or scaling horizontally',
            });
        }
    }
    // Response time alert (simulated)
    const avgResponseTime = getAverageResponseTime();
    if (avgResponseTime > 500) {
        alerts.push({
            id: 'slow_response',
            severity: avgResponseTime > 1000 ? 'critical' : 'warning',
            title: 'Slow Response Times',
            message: `Average response time is ${avgResponseTime}ms`,
            created_at: new Date().toISOString(),
            suggested_action: 'Check system resources and optimize container performance',
        });
    }
    return alerts;
}
export { router as dashboardRouter };
//# sourceMappingURL=dashboard.js.map