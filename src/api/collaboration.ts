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

export { router as collaborationRouter };