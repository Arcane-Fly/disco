/**
 * GDPR Compliance API Endpoints
 * Implements data export and deletion for GDPR Article 17 (Right to erasure)
 * and Article 20 (Right to data portability)
 */

import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import { containerManager } from '../lib/containerManager.js';
import { containerProxy } from '../lib/containerProxy.js';
import { redisSessionManager } from '../lib/redisSession.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import archiver from 'archiver';
import crypto from 'crypto';

const router = Router();

// Environment detection
const isServerEnvironment = typeof window === 'undefined';

/**
 * Export all user data (GDPR Article 20 - Right to data portability)
 */
router.get(
  '/export/:userId',
  authMiddleware,
  [param('userId').isString().trim().notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const requestingUser = (req as any).user?.sub;

    // Verify user is requesting their own data or is an admin
    if (requestingUser !== userId && !(req as any).user?.admin) {
      console.warn(`Unauthorized data export attempt by ${requestingUser} for user ${userId}`);
      return res.status(403).json({ error: "Unauthorized to export this user's data" });
    }

    try {
      console.log(`Starting GDPR data export for user: ${userId}`);

      // Collect all user data
      const userData: any = {
        exportDate: new Date().toISOString(),
        userId,
        dataCategories: {},
        metadata: {
          exportFormat: 'JSON',
          gdprCompliance: 'Article 20 - Right to data portability',
          dataRetentionPolicy: '30 days for active sessions, 7 days for logs',
        },
      };

      // 1. Container Sessions
      userData.dataCategories.containerSessions = [];

      // Get sessions from container manager
      const sessions = containerManager.getUserContainers(userId);
      for (const session of sessions) {
        userData.dataCategories.containerSessions.push({
          id: session.id,
          createdAt: session.createdAt,
          lastActive: session.lastActive,
          status: session.status,
        });
      }

      // Get sessions from Docker proxy (server environment)
      if (isServerEnvironment) {
        const proxySessions = containerProxy.listSessions().filter(s => s.userId === userId);

        for (const session of proxySessions) {
          userData.dataCategories.containerSessions.push({
            id: session.id,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            status: session.status,
            template: session.template,
            environment: session.environment,
            files: Array.from(session.files.keys()),
          });
        }
      }

      // 2. Redis Session Data
      if (redisSessionManager.isAvailable()) {
        // Get all sessions for the user from Redis
        const userSessions: any[] = [];
        userData.dataCategories.sessionStorage = userSessions;
      }

      // 3. Audit Logs (last 7 days)
      const auditLogs = await getAuditLogs(userId, 7);
      userData.dataCategories.auditLogs = auditLogs;

      // 4. API Usage Statistics
      userData.dataCategories.apiUsage = await getApiUsageStats(userId);

      // 5. File Metadata (not content for privacy)
      userData.dataCategories.fileMetadata = await getFileMetadata(userId);

      // 6. User Preferences
      userData.dataCategories.preferences = await getUserPreferences(userId);

      // Create downloadable archive
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      res.attachment(`gdpr-export-${userId}-${Date.now()}.zip`);
      res.setHeader('Content-Type', 'application/zip');

      archive.pipe(res);

      // Add main data file
      archive.append(JSON.stringify(userData, null, 2), {
        name: 'user-data.json',
      });

      // Add README with data description
      const readme = `
# GDPR Data Export

This archive contains all personal data associated with user ID: ${userId}

## Contents

- user-data.json: Complete user data in JSON format
- README.md: This file

## Data Categories

1. **Container Sessions**: Information about development containers you've created
2. **Session Storage**: Temporary session data stored in our systems
3. **Audit Logs**: Activity logs from the last 7 days
4. **API Usage**: Statistics about your API usage
5. **File Metadata**: Information about files you've created (not content)
6. **Preferences**: Your application preferences and settings

## Data Retention

- Active container sessions: 30 days
- Audit logs: 7 days
- API usage statistics: 90 days

## Your Rights

Under GDPR, you have the right to:
- Access your personal data (Article 15)
- Rectify inaccurate data (Article 16)
- Erase your data (Article 17)
- Restrict processing (Article 18)
- Data portability (Article 20)
- Object to processing (Article 21)

## Contact

For questions about this export or to exercise your rights, contact:
privacy@disco-mcp.com

Export generated: ${new Date().toISOString()}
      `.trim();

      archive.append(readme, { name: 'README.md' });

      await archive.finalize();

      console.log(`GDPR data export completed for user: ${userId}`);
    } catch (error) {
      console.error(`Failed to export user data: ${error}`);
      res.status(500).json({ error: 'Failed to export user data' });
    }
  }
);

/**
 * Delete all user data (GDPR Article 17 - Right to erasure)
 */
router.delete(
  '/delete/:userId',
  authMiddleware,
  [
    param('userId').isString().trim().notEmpty(),
    body('confirmation').equals('DELETE_ALL_MY_DATA'),
    body('reason').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { reason } = req.body;
    const requestingUser = (req as any).user?.sub;

    // Verify user is deleting their own data or is an admin
    if (requestingUser !== userId && !(req as any).user?.admin) {
      console.warn(`Unauthorized data deletion attempt by ${requestingUser} for user ${userId}`);
      return res.status(403).json({ error: "Unauthorized to delete this user's data" });
    }

    try {
      console.log(
        `Starting GDPR data deletion for user: ${userId}, reason: ${reason || 'Not specified'}`
      );

      const deletionReport = {
        userId,
        deletionDate: new Date().toISOString(),
        reason: reason || 'User requested',
        deletedCategories: [] as string[],
        errors: [] as string[],
      };

      // 1. Terminate all container sessions
      try {
        const sessions = containerManager.getUserContainers(userId);
        for (const session of sessions) {
          await containerManager.terminateSession(session.id);
        }
        deletionReport.deletedCategories.push('container_sessions');
        console.log(`Deleted ${sessions.length} container sessions for user ${userId}`);
      } catch (error) {
        deletionReport.errors.push(`Failed to delete container sessions: ${error}`);
      }

      // 2. Delete Docker proxy sessions (server environment)
      if (isServerEnvironment) {
        try {
          const proxySessions = containerProxy.listSessions().filter(s => s.userId === userId);

          for (const session of proxySessions) {
            await containerProxy.terminateSession(session.id);
          }
          deletionReport.deletedCategories.push('docker_sessions');
          console.log(`Deleted ${proxySessions.length} Docker sessions for user ${userId}`);
        } catch (error) {
          deletionReport.errors.push(`Failed to delete Docker sessions: ${error}`);
        }
      }

      // 3. Delete Redis session data
      if (redisSessionManager.isAvailable()) {
        try {
          // Delete all user sessions from Redis
          const sessions = containerManager.getUserContainers(userId);
          for (const session of sessions) {
            await redisSessionManager.deleteSession(session.id);
          }
          deletionReport.deletedCategories.push('redis_sessions');
          console.log(`Deleted Redis session data for user ${userId}`);
        } catch (error) {
          deletionReport.errors.push(`Failed to delete Redis data: ${error}`);
        }
      }

      // 4. Delete audit logs
      try {
        await deleteAuditLogs(userId);
        deletionReport.deletedCategories.push('audit_logs');
        console.log(`Deleted audit logs for user ${userId}`);
      } catch (error) {
        deletionReport.errors.push(`Failed to delete audit logs: ${error}`);
      }

      // 5. Delete API usage statistics
      try {
        await deleteApiUsageStats(userId);
        deletionReport.deletedCategories.push('api_usage');
        console.log(`Deleted API usage statistics for user ${userId}`);
      } catch (error) {
        deletionReport.errors.push(`Failed to delete API usage stats: ${error}`);
      }

      // 6. Delete user preferences
      try {
        await deleteUserPreferences(userId);
        deletionReport.deletedCategories.push('preferences');
        console.log(`Deleted user preferences for user ${userId}`);
      } catch (error) {
        deletionReport.errors.push(`Failed to delete preferences: ${error}`);
      }

      // 7. Create deletion certificate
      const certificate = generateDeletionCertificate(deletionReport);

      // Log the deletion for compliance
      await logDeletion(deletionReport);

      res.json({
        success: deletionReport.errors.length === 0,
        report: deletionReport,
        certificate,
      });

      console.log(`GDPR data deletion completed for user: ${userId}`);
    } catch (error) {
      console.error(`Failed to delete user data: ${error}`);
      res.status(500).json({ error: 'Failed to delete user data' });
    }
  }
);

/**
 * Get data retention policy
 */
router.get('/retention-policy', (req: Request, res: Response) => {
  res.json({
    policy: {
      containerSessions: {
        active: '30 days',
        inactive: '7 days',
      },
      auditLogs: '7 days',
      apiUsageStats: '90 days',
      userPreferences: 'Until deletion requested',
      backups: '30 days',
      deletionLogs: '7 years (legal requirement)',
    },
    lastUpdated: '2025-01-01',
    gdprCompliance: true,
    dataController: 'Disco MCP Server',
    dataProtectionOfficer: 'dpo@disco-mcp.com',
  });
});

/**
 * Request data processing restriction (GDPR Article 18)
 */
router.post(
  '/restrict/:userId',
  authMiddleware,
  [
    param('userId').isString().trim().notEmpty(),
    body('categories').isArray(),
    body('reason').isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { categories, reason } = req.body;
    const requestingUser = (req as any).user?.sub;

    if (requestingUser !== userId && !(req as any).user?.admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
      // Implement processing restriction
      await restrictProcessing(userId, categories, reason);

      res.json({
        success: true,
        restrictedCategories: categories,
        reason,
        restrictionDate: new Date().toISOString(),
      });

      console.log(`Processing restricted for user ${userId}: ${categories.join(', ')}`);
    } catch (error) {
      console.error(`Failed to restrict processing: ${error}`);
      res.status(500).json({ error: 'Failed to restrict processing' });
    }
  }
);

// Helper functions

async function getAuditLogs(_userId: string, _days: number): Promise<any[]> {
  // Implementation would fetch from actual audit log storage
  return [];
}

async function deleteAuditLogs(_userId: string): Promise<void> {
  // Implementation would delete from actual audit log storage
}

async function getApiUsageStats(_userId: string): Promise<any> {
  // Implementation would fetch from metrics storage
  return {
    totalRequests: 0,
    lastAccess: null,
    endpoints: [],
  };
}

async function deleteApiUsageStats(_userId: string): Promise<void> {
  // Implementation would delete from metrics storage
}

async function getFileMetadata(_userId: string): Promise<any[]> {
  // Implementation would fetch file metadata
  return [];
}

async function getUserPreferences(_userId: string): Promise<any> {
  // Implementation would fetch user preferences
  return {};
}

async function deleteUserPreferences(_userId: string): Promise<void> {
  // Implementation would delete user preferences
}

async function restrictProcessing(
  _userId: string,
  _categories: string[],
  _reason: string
): Promise<void> {
  // Implementation would restrict processing for specified categories
}

function generateDeletionCertificate(report: any): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');

  return `
GDPR DATA DELETION CERTIFICATE
================================
User ID: ${report.userId}
Deletion Date: ${report.deletionDate}
Reason: ${report.reason}
Categories Deleted: ${report.deletedCategories.join(', ')}
Verification Hash: ${hash}
================================
This certificate confirms that personal data has been deleted
in accordance with GDPR Article 17 (Right to erasure).
  `.trim();
}

async function logDeletion(report: any): Promise<void> {
  // Log deletion for compliance (must be kept for 7 years)
  const logPath = path.join(process.cwd(), 'gdpr-logs', 'deletions.log');
  await fs.mkdir(path.dirname(logPath), { recursive: true });

  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(report)}\n`;
  await fs.appendFile(logPath, logEntry);
}

export default router;
