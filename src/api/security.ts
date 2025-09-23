import { Router, Request, Response } from 'express';
import { securityComplianceManager } from '../lib/securityComplianceManager.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLogEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique log entry ID
 *         timestamp:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 *           nullable: true
 *         action:
 *           type: string
 *         resource:
 *           type: string
 *         method:
 *           type: string
 *         url:
 *           type: string
 *         ip:
 *           type: string
 *         securityContext:
 *           type: object
 *           properties:
 *             authType:
 *               type: string
 *               enum: [jwt, api_key, none]
 *             riskScore:
 *               type: number
 *               minimum: 0
 *               maximum: 1
 *             anomalyFlags:
 *               type: array
 *               items:
 *                 type: string
 *         compliance:
 *           type: object
 *           properties:
 *             dataClassification:
 *               type: string
 *               enum: [public, internal, confidential, restricted]
 *             retention:
 *               type: string
 *               enum: [standard, extended, permanent]
 *     SecurityIncident:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         type:
 *           type: string
 *           enum: [authentication_failure, authorization_violation, data_access_violation, injection_attempt, rate_limit_violation, suspicious_activity]
 *         description:
 *           type: string
 *         resolved:
 *           type: boolean
 *     ComplianceReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           enum: [soc2, gdpr, hipaa, daily, weekly, monthly]
 *         status:
 *           type: string
 *           enum: [compliant, warning, non_compliant]
 *         metrics:
 *           type: object
 *           properties:
 *             totalRequests:
 *               type: number
 *             failedAuthentications:
 *               type: number
 *             securityIncidents:
 *               type: number
 */

/**
 * @swagger
 * /security/audit-logs:
 *   get:
 *     tags: [Security & Compliance]
 *     summary: Get audit logs with filtering
 *     description: Retrieves comprehensive audit logs for compliance and security monitoring
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by specific user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of logs to return
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLogEntry'
 *                 total:
 *                   type: number
 *                 filtered:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/audit-logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Check if user has security admin permissions
    const user = (req as any).user;
    if (!user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    // In production, check for security admin role
    // For now, allow all authenticated users to view logs

    const { startDate, endDate, userId, action, limit = 100 } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (userId) filters.userId = userId as string;
    if (action) filters.action = action as string;

    const allLogs = securityComplianceManager.getAuditLogs(filters);
    const limitedLogs = allLogs.slice(0, parseInt(limit as string, 10));

    // Log the audit log access
    await securityComplianceManager.logSecurityEvent(req, 'audit_log_access', 'audit_logs', {
      filters,
      resultCount: limitedLogs.length,
    });

    res.json({
      logs: limitedLogs.map(log => ({
        ...log,
        // Remove sensitive information from response
        requestBody:
          log.compliance.dataClassification === 'restricted' ? '[CLASSIFIED]' : log.requestBody,
        responseBody: undefined, // Never return response bodies in audit log API
      })),
      total: allLogs.length,
      filtered: limitedLogs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Audit logs retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve audit logs',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /security/incidents:
 *   get:
 *     tags: [Security & Compliance]
 *     summary: Get security incidents
 *     description: Retrieves security incidents with optional filtering by resolution status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: Filter by resolution status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by severity level
 *     responses:
 *       200:
 *         description: Security incidents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incidents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SecurityIncident'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     unresolved:
 *                       type: number
 *                     critical:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/incidents', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const { resolved, severity } = req.query;

    let incidents = securityComplianceManager.getSecurityIncidents(
      resolved !== undefined ? resolved === 'true' : undefined
    );

    if (severity) {
      incidents = incidents.filter(incident => incident.severity === severity);
    }

    const summary = {
      total: incidents.length,
      unresolved: incidents.filter(i => !i.resolved).length,
      critical: incidents.filter(i => i.severity === 'critical').length,
      high: incidents.filter(i => i.severity === 'high').length,
      medium: incidents.filter(i => i.severity === 'medium').length,
      low: incidents.filter(i => i.severity === 'low').length,
    };

    await securityComplianceManager.logSecurityEvent(
      req,
      'security_incidents_access',
      'security_incidents',
      { filters: { resolved, severity }, resultCount: incidents.length }
    );

    res.json({
      incidents,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Security incidents retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve security incidents',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /security/incidents/{incidentId}/resolve:
 *   post:
 *     tags: [Security & Compliance]
 *     summary: Resolve security incident
 *     description: Marks a security incident as resolved with resolution details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incidentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Security incident ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *                 description: Description of how the incident was resolved
 *     responses:
 *       200:
 *         description: Incident resolved successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
router.post(
  '/incidents/:incidentId/resolve',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) {
        return res.status(401).json({
          error: 'User authentication required',
        });
      }

      const { incidentId } = req.params;
      const { resolution } = req.body;

      if (!resolution || typeof resolution !== 'string') {
        return res.status(400).json({
          error: 'Resolution description is required',
        });
      }

      const success = await securityComplianceManager.resolveSecurityIncident(
        incidentId,
        resolution,
        user.userId
      );

      if (!success) {
        return res.status(404).json({
          error: 'Security incident not found',
        });
      }

      await securityComplianceManager.logSecurityEvent(
        req,
        'security_incident_resolved',
        'security_incident',
        { incidentId, resolution }
      );

      res.json({
        message: 'Security incident resolved successfully',
        incidentId,
        resolvedBy: user.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Security incident resolution error:', error);
      res.status(500).json({
        error: 'Failed to resolve security incident',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /security/compliance/reports:
 *   get:
 *     tags: [Security & Compliance]
 *     summary: Get compliance reports
 *     description: Retrieves generated compliance reports for auditing and regulatory purposes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compliance reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ComplianceReport'
 *       401:
 *         description: Unauthorized
 */
router.get('/compliance/reports', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const reports = securityComplianceManager.getComplianceReports();

    await securityComplianceManager.logSecurityEvent(
      req,
      'compliance_reports_access',
      'compliance_reports',
      { reportCount: reports.length }
    );

    res.json({
      reports,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Compliance reports retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve compliance reports',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /security/compliance/generate-report:
 *   post:
 *     tags: [Security & Compliance]
 *     summary: Generate compliance report
 *     description: Generates a new compliance report for specified period and type
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - startDate
 *               - endDate
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [soc2, gdpr, hipaa, daily, weekly, monthly]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Compliance report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComplianceReport'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 */
router.post('/compliance/generate-report', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const { type, startDate, endDate } = req.body;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Report type, start date, and end date are required',
      });
    }

    const validTypes = ['soc2', 'gdpr', 'hipaa', 'daily', 'weekly', 'monthly'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid report type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format for startDate or endDate',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        error: 'endDate must be after startDate',
      });
    }

    const report = await securityComplianceManager.generateComplianceReport(type, start, end);

    await securityComplianceManager.logSecurityEvent(
      req,
      'compliance_report_generated',
      'compliance_report',
      { reportType: type, period: { start, end }, reportId: report.id }
    );

    res.json(report);
  } catch (error) {
    console.error('Compliance report generation error:', error);
    res.status(500).json({
      error: 'Failed to generate compliance report',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /security/zero-trust/validate:
 *   post:
 *     tags: [Security & Compliance]
 *     summary: Zero-trust validation
 *     description: Performs comprehensive zero-trust security validation for resource access
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - action
 *             properties:
 *               resource:
 *                 type: string
 *                 description: Resource being accessed
 *               action:
 *                 type: string
 *                 description: Action being performed
 *     responses:
 *       200:
 *         description: Zero-trust validation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allowed:
 *                   type: boolean
 *                 trustScore:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *                 reasons:
 *                   type: array
 *                   items:
 *                     type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/zero-trust/validate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const { resource, action } = req.body;

    if (!resource || !action) {
      return res.status(400).json({
        error: 'Resource and action are required',
      });
    }

    const validation = await securityComplianceManager.validateZeroTrustAccess(
      req,
      resource,
      action
    );

    res.json({
      ...validation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Zero-trust validation error:', error);
    res.status(500).json({
      error: 'Failed to perform zero-trust validation',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /security/metrics:
 *   get:
 *     tags: [Security & Compliance]
 *     summary: Get security metrics
 *     description: Retrieves comprehensive security and compliance metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auditLogs:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     last24h:
 *                       type: number
 *                     highRisk:
 *                       type: number
 *                 securityIncidents:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     unresolved:
 *                       type: number
 *                     critical:
 *                       type: number
 *                 compliance:
 *                   type: object
 *                   properties:
 *                     reports:
 *                       type: number
 *                     lastStatus:
 *                       type: string
 *                     zeroTrustEnabled:
 *                       type: boolean
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/metrics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const metrics = securityComplianceManager.getSecurityMetrics();

    await securityComplianceManager.logSecurityEvent(
      req,
      'security_metrics_access',
      'security_metrics',
      { metricsRequested: Object.keys(metrics) }
    );

    res.json({
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Security metrics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve security metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /security/status:
 *   get:
 *     tags: [Security & Compliance]
 *     summary: Get security system status
 *     description: Retrieves overall security and compliance system status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security system status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, warning, critical]
 *                 components:
 *                   type: object
 *                   properties:
 *                     auditLogging:
 *                       type: string
 *                       enum: [active, inactive, error]
 *                     incidentManagement:
 *                       type: string
 *                       enum: [active, inactive, error]
 *                     complianceReporting:
 *                       type: string
 *                       enum: [active, inactive, error]
 *                     zeroTrust:
 *                       type: string
 *                       enum: [active, inactive, error]
 *                 uptime:
 *                   type: number
 *                 lastAudit:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.userId) {
      return res.status(401).json({
        error: 'User authentication required',
      });
    }

    const metrics = securityComplianceManager.getSecurityMetrics();
    const unresolvedIncidents = securityComplianceManager.getSecurityIncidents(false);

    // Determine overall status
    let status = 'healthy';
    const criticalIncidents = unresolvedIncidents.filter(i => i.severity === 'critical').length;
    const highIncidents = unresolvedIncidents.filter(i => i.severity === 'high').length;

    if (criticalIncidents > 0) {
      status = 'critical';
    } else if (highIncidents > 2 || unresolvedIncidents.length > 10) {
      status = 'warning';
    }

    const securityStatus = {
      status,
      components: {
        auditLogging: metrics.auditLogs.total > 0 ? 'active' : 'inactive',
        incidentManagement: 'active',
        complianceReporting: metrics.compliance.reports > 0 ? 'active' : 'inactive',
        zeroTrust: metrics.compliance.zeroTrustEnabled ? 'active' : 'inactive',
      },
      uptime: Math.floor(process.uptime()),
      lastAudit: new Date().toISOString(), // In production, track actual last audit
      unresolvedIncidents: unresolvedIncidents.length,
      complianceStatus: metrics.compliance.lastStatus,
      timestamp: new Date().toISOString(),
    };

    await securityComplianceManager.logSecurityEvent(
      req,
      'security_status_check',
      'security_status',
      { status, unresolvedIncidents: unresolvedIncidents.length }
    );

    res.json(securityStatus);
  } catch (error) {
    console.error('Security status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve security status',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as securityRouter };
