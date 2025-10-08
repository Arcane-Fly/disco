/**
 * Team Collaboration System
 * Implements multi-user container sharing, permission management, and access controls
 */
class TeamCollaborationManager {
    teams = new Map();
    userTeams = new Map(); // userId -> teamIds
    activityLogs = new Map(); // teamId -> logs
    workspaceTemplates = new Map();
    constructor() {
        this.initializeDefaultTemplates();
    }
    initializeDefaultTemplates() {
        // Frontend template
        this.workspaceTemplates.set('frontend', {
            name: 'Frontend Development',
            type: 'frontend',
            preInstalled: ['node', 'npm', 'yarn', 'git', 'vscode-server'],
            environment: {
                NODE_ENV: 'development',
                PORT: '3000',
            },
            ports: [3000, 3001, 8080],
            resources: {
                cpu: '1',
                memory: '2Gi',
                storage: '10Gi',
            },
        });
        // Backend template
        this.workspaceTemplates.set('backend', {
            name: 'Backend Development',
            type: 'backend',
            preInstalled: ['node', 'python', 'git', 'docker', 'postgresql-client'],
            environment: {
                NODE_ENV: 'development',
                DATABASE_URL: 'postgresql://localhost:5432/dev',
            },
            ports: [3000, 5000, 8000, 5432],
            resources: {
                cpu: '2',
                memory: '4Gi',
                storage: '20Gi',
            },
        });
        // Data Science template
        this.workspaceTemplates.set('data-science', {
            name: 'Data Science',
            type: 'data-science',
            preInstalled: ['python', 'jupyter', 'pandas', 'numpy', 'scikit-learn', 'git'],
            environment: {
                JUPYTER_PORT: '8888',
                PYTHON_VERSION: '3.9',
            },
            ports: [8888, 8080],
            resources: {
                cpu: '4',
                memory: '8Gi',
                storage: '50Gi',
            },
        });
    }
    /**
     * Create a new team
     */
    createTeam(ownerId, name, description, settings) {
        const teamId = this.generateTeamId();
        const defaultSettings = {
            allowGuestAccess: false,
            defaultRole: 'developer',
            requireApprovalForJoin: true,
            sessionTimeoutMinutes: 480, // 8 hours
            ...settings,
        };
        const owner = {
            userId: ownerId,
            username: '', // Will be populated from user service
            email: '', // Will be populated from user service
            role: 'owner',
            joinedAt: new Date(),
            lastActive: new Date(),
            permissions: new Set([
                'create_containers',
                'delete_containers',
                'share_containers',
                'manage_members',
                'view_analytics',
                'manage_billing',
                'admin_access',
                'create_workspaces',
                'manage_templates',
            ]),
        };
        const team = {
            id: teamId,
            name,
            description,
            ownerId,
            members: new Map([[ownerId, owner]]),
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: defaultSettings,
            containerShares: new Map(),
        };
        this.teams.set(teamId, team);
        // Update user teams mapping
        if (!this.userTeams.has(ownerId)) {
            this.userTeams.set(ownerId, new Set());
        }
        this.userTeams.get(ownerId).add(teamId);
        this.logActivity(teamId, ownerId, 'team_created', 'team', teamId, {
            teamName: name,
        });
        return team;
    }
    /**
     * Add member to team
     */
    addTeamMember(teamId, userId, invitedBy, role = 'developer') {
        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error('Team not found');
        }
        // Check permissions
        if (!this.hasPermission(teamId, invitedBy, 'manage_members')) {
            throw new Error('Insufficient permissions to add members');
        }
        if (team.members.has(userId)) {
            throw new Error('User is already a member of this team');
        }
        const member = {
            userId,
            username: '', // Will be populated from user service
            email: '', // Will be populated from user service
            role,
            joinedAt: new Date(),
            lastActive: new Date(),
            permissions: this.getDefaultPermissions(role),
        };
        team.members.set(userId, member);
        team.updatedAt = new Date();
        // Update user teams mapping
        if (!this.userTeams.has(userId)) {
            this.userTeams.set(userId, new Set());
        }
        this.userTeams.get(userId).add(teamId);
        this.logActivity(teamId, invitedBy, 'member_added', 'user', userId, {
            role,
            memberCount: team.members.size,
        });
        return true;
    }
    /**
     * Share container with team
     */
    shareContainer(containerId, teamId, sharedBy, accessLevel, expiresAt, metadata) {
        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error('Team not found');
        }
        // Check permissions
        if (!this.hasPermission(teamId, sharedBy, 'share_containers')) {
            throw new Error('Insufficient permissions to share containers');
        }
        const allowedOperations = this.getOperationsForAccessLevel(accessLevel);
        const containerShare = {
            containerId,
            teamId,
            sharedBy,
            sharedAt: new Date(),
            accessLevel,
            expiresAt,
            allowedOperations,
            metadata: metadata || {},
        };
        team.containerShares.set(containerId, containerShare);
        team.updatedAt = new Date();
        this.logActivity(teamId, sharedBy, 'container_shared', 'container', containerId, {
            accessLevel,
            expiresAt: expiresAt?.toISOString(),
            memberCount: team.members.size,
        });
        return containerShare;
    }
    /**
     * Create team workspace from template
     */
    createTeamWorkspace(teamId, createdBy, name, description, templateName, customSettings) {
        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error('Team not found');
        }
        if (!this.hasPermission(teamId, createdBy, 'create_workspaces')) {
            throw new Error('Insufficient permissions to create workspaces');
        }
        const template = this.workspaceTemplates.get(templateName);
        if (!template) {
            throw new Error('Workspace template not found');
        }
        const defaultSettings = {
            autoSleep: true,
            sleepAfterMinutes: 30,
            allowPublicAccess: false,
            backupEnabled: true,
            backupIntervalHours: 24,
            ...customSettings,
        };
        const workspace = {
            id: this.generateWorkspaceId(),
            teamId,
            name,
            description,
            template,
            createdBy,
            createdAt: new Date(),
            containers: [],
            settings: defaultSettings,
        };
        this.logActivity(teamId, createdBy, 'workspace_created', 'workspace', workspace.id, {
            workspaceName: name,
            templateName,
        });
        return workspace;
    }
    /**
     * Check if user has specific permission in team
     */
    hasPermission(teamId, userId, permission) {
        const team = this.teams.get(teamId);
        if (!team)
            return false;
        const member = team.members.get(userId);
        if (!member)
            return false;
        // Owner has all permissions
        if (member.role === 'owner')
            return true;
        return member.permissions.has(permission);
    }
    /**
     * Check if user can access container
     */
    canAccessContainer(containerId, userId, operation) {
        // Find teams that have this container shared
        for (const team of this.teams.values()) {
            const containerShare = team.containerShares.get(containerId);
            if (!containerShare)
                continue;
            // Check if user is team member
            const member = team.members.get(userId);
            if (!member)
                continue;
            // Check if container share has expired
            if (containerShare.expiresAt && containerShare.expiresAt < new Date()) {
                continue;
            }
            // Check if user has permission for this operation
            if (containerShare.allowedOperations.has(operation)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get user's teams
     */
    getUserTeams(userId) {
        const teamIds = this.userTeams.get(userId);
        if (!teamIds)
            return [];
        return Array.from(teamIds)
            .map(teamId => this.teams.get(teamId))
            .filter((team) => team !== undefined);
    }
    /**
     * Get team activity logs
     */
    getTeamActivity(teamId, limit = 100) {
        const logs = this.activityLogs.get(teamId) || [];
        return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
    }
    /**
     * Get available workspace templates
     */
    getWorkspaceTemplates() {
        return Array.from(this.workspaceTemplates.values());
    }
    /**
     * Helper methods
     */
    generateTeamId() {
        return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateWorkspaceId() {
        return `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getDefaultPermissions(role) {
        const permissions = new Set();
        switch (role) {
            case 'admin':
                permissions.add('create_containers');
                permissions.add('delete_containers');
                permissions.add('share_containers');
                permissions.add('manage_members');
                permissions.add('view_analytics');
                permissions.add('create_workspaces');
                permissions.add('manage_templates');
                // Admins also get developer permissions
                permissions.add('create_containers'); // Developer permission
                permissions.add('share_containers'); // Developer permission  
                permissions.add('create_workspaces'); // Developer permission
                break;
            case 'developer':
                permissions.add('create_containers');
                permissions.add('share_containers');
                permissions.add('create_workspaces');
                break;
            case 'viewer':
                // View-only permissions are handled at the API level
                break;
        }
        return permissions;
    }
    getOperationsForAccessLevel(accessLevel) {
        const operations = new Set();
        switch (accessLevel) {
            case 'admin':
                operations.add('manage_processes');
                operations.add('access_network');
                operations.add('install_packages');
                // Admins also get write permissions
                operations.add('write_files'); // Write permission
                operations.add('execute_commands'); // Write permission
                operations.add('manage_git'); // Write permission
                // Admins also get read permissions
                operations.add('read_files'); // Read permission
                operations.add('view_terminal'); // Read permission
                break;
            case 'write':
                operations.add('write_files');
                operations.add('execute_commands');
                operations.add('manage_git');
                // Write access also includes read permissions
                operations.add('read_files'); // Read permission
                operations.add('view_terminal'); // Read permission
                break;
            case 'read':
                operations.add('read_files');
                operations.add('view_terminal');
                break;
        }
        return operations;
    }
    logActivity(teamId, userId, action, resource, resourceId, metadata, ipAddress, userAgent) {
        const log = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            teamId,
            userId,
            action,
            resource,
            resourceId,
            timestamp: new Date(),
            metadata,
            ipAddress,
            userAgent,
        };
        if (!this.activityLogs.has(teamId)) {
            this.activityLogs.set(teamId, []);
        }
        this.activityLogs.get(teamId).push(log);
        // Keep only last 1000 logs per team
        const logs = this.activityLogs.get(teamId);
        if (logs.length > 1000) {
            this.activityLogs.set(teamId, logs.slice(-1000));
        }
    }
}
export { TeamCollaborationManager };
export let teamCollaborationManager;
export const initializeTeamCollaborationManager = () => {
    teamCollaborationManager = new TeamCollaborationManager();
    return teamCollaborationManager;
};
//# sourceMappingURL=teamCollaborationManager.js.map