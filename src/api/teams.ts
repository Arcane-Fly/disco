import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { teamCollaborationManager } from '../lib/teamCollaborationManager.js';

const router = Router();

/**
 * @swagger
 * /api/v1/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Team Collaboration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Team name
 *               description:
 *                 type: string
 *                 description: Team description
 *               settings:
 *                 type: object
 *                 properties:
 *                   allowGuestAccess:
 *                     type: boolean
 *                   defaultRole:
 *                     type: string
 *                     enum: [developer, viewer]
 *                   requireApprovalForJoin:
 *                     type: boolean
 *                   maxMembers:
 *                     type: integer
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Team created successfully
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, settings } = req.body;
    const userId = (req as any).user?.id;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = teamCollaborationManager.createTeam(userId, name, description, settings);

    res.status(201).json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        ownerId: team.ownerId,
        memberCount: team.members.size,
        createdAt: team.createdAt,
        settings: team.settings
      }
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      error: 'Failed to create team',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/teams:
 *   get:
 *     summary: Get user's teams
 *     tags: [Team Collaboration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's teams
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const teams = teamCollaborationManager.getUserTeams(userId);

    res.json({
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        role: team.members.get(userId)?.role,
        memberCount: team.members.size,
        containerCount: team.containerShares.size,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting user teams:', error);
    res.status(500).json({
      error: 'Failed to get teams',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/teams/{teamId}/members:
 *   post:
 *     summary: Add member to team
 *     tags: [Team Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, developer, viewer]
 *                 default: developer
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Member added successfully
 */
router.post('/:teamId/members', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userId, role = 'developer' } = req.body;
    const invitedBy = (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const success = teamCollaborationManager.addTeamMember(teamId, userId, invitedBy, role);

    res.json({
      success,
      message: 'Member added to team successfully'
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({
      error: 'Failed to add team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/teams/{teamId}/containers/{containerId}/share:
 *   post:
 *     summary: Share container with team
 *     tags: [Team Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessLevel:
 *                 type: string
 *                 enum: [read, write, admin]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               metadata:
 *                 type: object
 *                 properties:
 *                   containerName:
 *                     type: string
 *                   projectType:
 *                     type: string
 *                   description:
 *                     type: string
 *             required:
 *               - accessLevel
 *     responses:
 *       200:
 *         description: Container shared successfully
 */
router.post('/:teamId/containers/:containerId/share', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId, containerId } = req.params;
    const { accessLevel, expiresAt, metadata } = req.body;
    const sharedBy = (req as any).user?.id;

    if (!accessLevel) {
      return res.status(400).json({ error: 'Access level is required' });
    }

    const expirationDate = expiresAt ? new Date(expiresAt) : undefined;

    const containerShare = teamCollaborationManager.shareContainer(
      containerId,
      teamId,
      sharedBy,
      accessLevel,
      expirationDate,
      metadata
    );

    res.json({
      success: true,
      containerShare: {
        containerId: containerShare.containerId,
        accessLevel: containerShare.accessLevel,
        sharedAt: containerShare.sharedAt,
        expiresAt: containerShare.expiresAt,
        allowedOperations: Array.from(containerShare.allowedOperations),
        metadata: containerShare.metadata
      }
    });
  } catch (error) {
    console.error('Error sharing container:', error);
    res.status(500).json({
      error: 'Failed to share container',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/teams/{teamId}/workspaces:
 *   post:
 *     summary: Create team workspace
 *     tags: [Team Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               templateName:
 *                 type: string
 *                 enum: [frontend, backend, data-science]
 *               settings:
 *                 type: object
 *                 properties:
 *                   autoSleep:
 *                     type: boolean
 *                   sleepAfterMinutes:
 *                     type: integer
 *                   allowPublicAccess:
 *                     type: boolean
 *                   backupEnabled:
 *                     type: boolean
 *             required:
 *               - name
 *               - description
 *               - templateName
 *     responses:
 *       201:
 *         description: Workspace created successfully
 */
router.post('/:teamId/workspaces', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, description, templateName, settings } = req.body;
    const createdBy = (req as any).user?.id;

    if (!name || !description || !templateName) {
      return res.status(400).json({ 
        error: 'Name, description, and template name are required' 
      });
    }

    const workspace = teamCollaborationManager.createTeamWorkspace(
      teamId,
      createdBy,
      name,
      description,
      templateName,
      settings
    );

    res.status(201).json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        template: workspace.template,
        createdBy: workspace.createdBy,
        createdAt: workspace.createdAt,
        settings: workspace.settings
      }
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({
      error: 'Failed to create workspace',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/teams/{teamId}/activity:
 *   get:
 *     summary: Get team activity logs
 *     tags: [Team Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Team activity logs
 */
router.get('/:teamId/activity', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const userId = (req as any).user?.id;

    // Check if user has permission to view team activity
    if (!teamCollaborationManager.hasPermission(teamId, userId, 'view_analytics')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const activity = teamCollaborationManager.getTeamActivity(teamId, limit);

    res.json({
      activity,
      teamId
    });
  } catch (error) {
    console.error('Error getting team activity:', error);
    res.status(500).json({
      error: 'Failed to get team activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/teams/workspace-templates:
 *   get:
 *     summary: Get available workspace templates
 *     tags: [Team Collaboration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available workspace templates
 */
router.get('/workspace-templates', authMiddleware, async (req: Request, res: Response) => {
  try {
    const templates = teamCollaborationManager.getWorkspaceTemplates();

    res.json({
      templates
    });
  } catch (error) {
    console.error('Error getting workspace templates:', error);
    res.status(500).json({
      error: 'Failed to get workspace templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/v1/teams/containers/{containerId}/access:
 *   get:
 *     summary: Check container access permissions
 *     tags: [Team Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: containerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: operation
 *         required: true
 *         schema:
 *           type: string
 *           enum: [read_files, write_files, execute_commands, manage_git, view_terminal, manage_processes]
 *     responses:
 *       200:
 *         description: Access permission result
 */
router.get('/containers/:containerId/access', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { operation } = req.query;
    const userId = (req as any).user?.id;

    if (!operation) {
      return res.status(400).json({ error: 'Operation parameter is required' });
    }

    const hasAccess = teamCollaborationManager.canAccessContainer(
      containerId,
      userId,
      operation as any
    );

    res.json({
      containerId,
      operation,
      hasAccess
    });
  } catch (error) {
    console.error('Error checking container access:', error);
    res.status(500).json({
      error: 'Failed to check container access',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as teamCollaborationRouter };