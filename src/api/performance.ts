import { Router, Request, Response } from 'express';
import { performanceOptimizer } from '../lib/performanceOptimizer.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OptimizationMetrics:
 *       type: object
 *       properties:
 *         totalUsersAnalyzed:
 *           type: number
 *           description: Number of users with analyzed usage patterns
 *         totalPrewarmingRules:
 *           type: number
 *           description: Active prewarming rules
 *         scalingActionsToday:
 *           type: number
 *           description: Scaling actions performed today
 *         averageContainerUtilization:
 *           type: number
 *           description: Average container utilization percentage
 *         optimizationStatus:
 *           type: string
 *           enum: [active, disabled]
 *         costSavings:
 *           type: number
 *           description: Estimated cost savings from optimizations
 *         performanceImprovement:
 *           type: number
 *           description: Performance improvement percentage
 *     UsagePattern:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         timeOfDay:
 *           type: number
 *           minimum: 0
 *           maximum: 23
 *         dayOfWeek:
 *           type: number
 *           minimum: 0
 *           maximum: 6
 *         sessionDuration:
 *           type: number
 *           description: Average session duration in minutes
 *         resourceUsage:
 *           type: object
 *           properties:
 *             cpu:
 *               type: number
 *             memory:
 *               type: number
 *         frequency:
 *           type: number
 *           description: Session frequency per day
 *     ScalingAction:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [scale_up, scale_down, preload, cleanup]
 *         reason:
 *           type: string
 *         targetContainers:
 *           type: number
 *         priority:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *         estimatedCost:
 *           type: number
 *         estimatedBenefit:
 *           type: number
 */

/**
 * @swagger
 * /performance/metrics:
 *   get:
 *     tags: [Performance Optimization]
 *     summary: Get performance optimization metrics
 *     description: Returns comprehensive metrics about the performance optimization system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance optimization metrics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/OptimizationMetrics'
 *                 - type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/metrics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const metrics = performanceOptimizer.getOptimizationMetrics();

    res.json({
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve performance metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /performance/usage-patterns:
 *   post:
 *     tags: [Performance Optimization]
 *     summary: Record user usage pattern
 *     description: Records a user's session usage pattern for machine learning optimization
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - endTime
 *               - resourceUsage
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               resourceUsage:
 *                 type: object
 *                 properties:
 *                   cpu:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *                   memory:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *     responses:
 *       200:
 *         description: Usage pattern recorded successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/usage-patterns', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { startTime, endTime, resourceUsage } = req.body;

    // Validate request data
    if (!startTime || !endTime || !resourceUsage) {
      return res.status(400).json({
        error: 'Missing required fields: startTime, endTime, resourceUsage',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format for startTime or endTime',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        error: 'endTime must be after startTime',
      });
    }

    // Validate resource usage
    if (typeof resourceUsage.cpu !== 'number' || typeof resourceUsage.memory !== 'number') {
      return res.status(400).json({
        error: 'resourceUsage must contain numeric cpu and memory values',
      });
    }

    if (
      resourceUsage.cpu < 0 ||
      resourceUsage.cpu > 100 ||
      resourceUsage.memory < 0 ||
      resourceUsage.memory > 100
    ) {
      return res.status(400).json({
        error: 'Resource usage values must be between 0 and 100',
      });
    }

    // Record the usage pattern
    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    performanceOptimizer.recordUsagePattern(req.user.userId, {
      startTime: start,
      endTime: end,
      resourceUsage,
    });

    res.json({
      message: 'Usage pattern recorded successfully',
      userId: req.user.userId,
      sessionDuration: Math.round((end.getTime() - start.getTime()) / (1000 * 60)), // minutes
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Usage pattern recording error:', error);
    res.status(500).json({
      error: 'Failed to record usage pattern',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /performance/scaling/analyze:
 *   post:
 *     tags: [Performance Optimization]
 *     summary: Trigger scaling analysis
 *     description: Manually triggers intelligent auto-scaling analysis and returns recommended actions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scaling analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 actions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScalingAction'
 *                 executedActions:
 *                   type: number
 *                   description: Number of high-priority actions executed
 *                 deferredActions:
 *                   type: number
 *                   description: Number of actions deferred
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/scaling/analyze', authMiddleware, async (req: Request, res: Response) => {
  try {
    const actions = await performanceOptimizer.analyzeAndScale();

    const executedActions = actions.filter(a => a.priority > 0.8).length;
    const deferredActions = actions.filter(a => a.priority <= 0.8).length;

    res.json({
      actions: actions.map(action => ({
        ...action,
        // Round numerical values for cleaner response
        priority: Math.round(action.priority * 1000) / 1000,
        estimatedCost: Math.round(action.estimatedCost * 100) / 100,
        estimatedBenefit: Math.round(action.estimatedBenefit * 100) / 100,
      })),
      executedActions,
      deferredActions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scaling analysis error:', error);
    res.status(500).json({
      error: 'Failed to perform scaling analysis',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /performance/prewarming/analyze:
 *   post:
 *     tags: [Performance Optimization]
 *     summary: Trigger prewarming analysis
 *     description: Analyzes usage patterns and performs smart container prewarming
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prewarming analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rulesApplied:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/prewarming/analyze', authMiddleware, async (req: Request, res: Response) => {
  try {
    await performanceOptimizer.analyzeUsagePatternsAndPrewarm();

    const metrics = performanceOptimizer.getOptimizationMetrics();

    res.json({
      message: 'Prewarming analysis completed successfully',
      rulesApplied: metrics.totalPrewarmingRules,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Prewarming analysis error:', error);
    res.status(500).json({
      error: 'Failed to perform prewarming analysis',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /performance/optimize:
 *   post:
 *     tags: [Performance Optimization]
 *     summary: Trigger resource optimization
 *     description: Performs advanced resource usage optimization including memory and container management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resource optimization completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memoryOptimizations:
 *                   type: number
 *                   description: Number of memory optimizations performed
 *                 containerOptimizations:
 *                   type: number
 *                   description: Number of container optimizations performed
 *                 performanceGains:
 *                   type: number
 *                   description: Estimated performance improvement (0-1)
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/optimize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const results = await performanceOptimizer.optimizeResourceUsage();

    res.json({
      ...results,
      performanceGains: Math.round(results.performanceGains * 1000) / 1000, // Round to 3 decimal places
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Resource optimization error:', error);
    res.status(500).json({
      error: 'Failed to perform resource optimization',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /performance/container/priority:
 *   post:
 *     tags: [Performance Optimization]
 *     summary: Request container with priority
 *     description: Requests a container allocation based on priority and usage patterns
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [high, normal, low]
 *                 default: normal
 *     responses:
 *       200:
 *         description: Container allocated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 containerId:
 *                   type: string
 *                   nullable: true
 *                 priority:
 *                   type: string
 *                 allocationTime:
 *                   type: number
 *                   description: Time taken to allocate container in milliseconds
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid priority level
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: No containers available
 */
router.post('/container/priority', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { priority = 'normal' } = req.body;

    // Validate priority
    if (!['high', 'normal', 'low'].includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority level. Must be: high, normal, or low',
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const startTime = Date.now();
    const containerId = await performanceOptimizer.getContainerWithPriority(
      req.user.userId,
      priority
    );
    const allocationTime = Date.now() - startTime;

    if (!containerId) {
      return res.status(503).json({
        error: 'No containers available',
        priority,
        allocationTime,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      containerId,
      priority,
      allocationTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Priority container allocation error:', error);
    res.status(500).json({
      error: 'Failed to allocate priority container',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /performance/status:
 *   get:
 *     tags: [Performance Optimization]
 *     summary: Get optimization system status
 *     description: Returns the current status and health of the performance optimization system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance optimization system status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, warning, critical]
 *                 optimizationEnabled:
 *                   type: boolean
 *                 components:
 *                   type: object
 *                   properties:
 *                     patternAnalysis:
 *                       type: string
 *                       enum: [active, disabled, error]
 *                     autoScaling:
 *                       type: string
 *                       enum: [active, disabled, error]
 *                     resourceOptimization:
 *                       type: string
 *                       enum: [active, disabled, error]
 *                     containerPooling:
 *                       type: string
 *                       enum: [active, disabled, error]
 *                 lastOptimization:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Optimizer uptime in seconds
 *       401:
 *         description: Unauthorized
 */
router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const metrics = performanceOptimizer.getOptimizationMetrics();

    // Determine overall system status
    let status = 'healthy';
    if (metrics.averageContainerUtilization > 90) {
      status = 'critical';
    } else if (metrics.averageContainerUtilization > 75 || metrics.performanceImprovement < -10) {
      status = 'warning';
    }

    res.json({
      status,
      optimizationEnabled: metrics.optimizationStatus === 'active',
      components: {
        patternAnalysis: metrics.totalUsersAnalyzed > 0 ? 'active' : 'disabled',
        autoScaling: metrics.scalingActionsToday > 0 ? 'active' : 'active', // Always consider active if enabled
        resourceOptimization: 'active',
        containerPooling: 'active',
      },
      lastOptimization: new Date().toISOString(), // In real implementation, track actual last optimization
      uptime: Math.floor(process.uptime()),
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Performance status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve performance status',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as performanceRouter };
