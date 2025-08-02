import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { collaborationManager } from '../lib/collaborationManager.js';

const router = Router();

/**
 * @swagger
 * /api/v1/collaboration/{containerId}/sessions:
 *   get:
 *     summary: Get active collaboration sessions for a container
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Container ID
 *     responses:
 *       200:
 *         description: Active collaboration sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       filePath:
 *                         type: string
 *                       users:
 *                         type: array
 *                         items:
 *                           type: string
 *                       lastModified:
 *                         type: string
 *                       version:
 *                         type: integer
 */
router.get('/:containerId/sessions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    
    const sessions = collaborationManager.getActiveCollaborations(containerId);
    
    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        filePath: session.filePath,
        users: Array.from(session.users),
        lastModified: session.lastModified,
        version: session.version,
        userCount: session.users.size
      }))
    });
  } catch (error) {
    console.error('Error getting collaboration sessions:', error);
    res.status(500).json({ 
      error: 'Failed to get collaboration sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/collaboration/{containerId}/broadcast:
 *   post:
 *     summary: Broadcast a system message to all collaborators
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Container ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message to broadcast
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: Message broadcasted successfully
 */
router.post('/:containerId/broadcast', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    collaborationManager.broadcastSystemMessage(containerId, message);
    
    res.json({ success: true, message: 'Message broadcasted' });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({ 
      error: 'Failed to broadcast message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/collaboration/{containerId}/sync:
 *   post:
 *     summary: Manually sync file content to all collaborators
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Container ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: Path to the file
 *               content:
 *                 type: string
 *                 description: File content to sync
 *               excludeUserId:
 *                 type: string
 *                 description: User ID to exclude from sync
 *             required:
 *               - filePath
 *               - content
 *     responses:
 *       200:
 *         description: File synced successfully
 */
router.post('/:containerId/sync', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { filePath, content, excludeUserId } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
    }
    
    await collaborationManager.syncFileToCollaborators(
      containerId,
      filePath,
      content,
      excludeUserId
    );
    
    res.json({ success: true, message: 'File synced to collaborators' });
  } catch (error) {
    console.error('Error syncing file:', error);
    res.status(500).json({ 
      error: 'Failed to sync file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/collaboration/session/{sessionId}/users:
 *   get:
 *     summary: Get users in a collaboration session
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Collaboration session ID
 *     responses:
 *       200:
 *         description: Users in the session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/session/:sessionId/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const users = collaborationManager.getSessionUsers(sessionId);
    
    res.json({ users });
  } catch (error) {
    console.error('Error getting session users:', error);
    res.status(500).json({ 
      error: 'Failed to get session users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/collaboration/session/{sessionId}/history:
 *   get:
 *     summary: Get file version history for a collaboration session
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Collaboration session ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of history entries to return
 *     responses:
 *       200:
 *         description: File version history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       version:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       operation:
 *                         type: string
 *                         enum: [create, update, merge, conflict-resolution]
 */
router.get('/session/:sessionId/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const history = collaborationManager.getSessionHistory(sessionId, limit);
    
    res.json({ 
      history,
      sessionId 
    });
  } catch (error) {
    console.error('Error getting session history:', error);
    res.status(500).json({ 
      error: 'Failed to get session history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/collaboration/session/{sessionId}/resolve-conflict:
 *   post:
 *     summary: Manually resolve a file conflict
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Collaboration session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolvedContent:
 *                 type: string
 *                 description: Manually resolved file content
 *               strategy:
 *                 type: string
 *                 enum: [manual, smart-merge, semantic-merge, last-write-wins]
 *                 description: Resolution strategy used
 *               userId:
 *                 type: string
 *                 description: User who resolved the conflict
 *             required:
 *               - resolvedContent
 *               - strategy
 *               - userId
 *     responses:
 *       200:
 *         description: Conflict resolved successfully
 */
router.post('/session/:sessionId/resolve-conflict', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { resolvedContent, strategy, userId } = req.body;
    
    if (!resolvedContent || !strategy || !userId) {
      return res.status(400).json({ 
        error: 'Resolved content, strategy, and userId are required' 
      });
    }
    
    const result = await collaborationManager.resolveManualConflict(
      sessionId,
      resolvedContent,
      strategy,
      userId
    );
    
    res.json({ 
      success: true, 
      message: 'Conflict resolved successfully',
      newVersion: result.version,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    res.status(500).json({ 
      error: 'Failed to resolve conflict',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as collaborationRouter };