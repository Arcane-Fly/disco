/**
 * Team Collaboration System
 * Implements multi-user container sharing, permission management, and access controls
 */
export interface TeamMember {
    userId: string;
    username: string;
    email: string;
    role: 'owner' | 'admin' | 'developer' | 'viewer';
    joinedAt: Date;
    lastActive: Date;
    permissions: Set<TeamPermission>;
}
export interface Team {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    members: Map<string, TeamMember>;
    createdAt: Date;
    updatedAt: Date;
    settings: TeamSettings;
    containerShares: Map<string, ContainerShare>;
}
export interface TeamSettings {
    allowGuestAccess: boolean;
    defaultRole: 'developer' | 'viewer';
    requireApprovalForJoin: boolean;
    maxMembers?: number;
    allowedDomains?: string[];
    sessionTimeoutMinutes: number;
}
export interface ContainerShare {
    containerId: string;
    teamId: string;
    sharedBy: string;
    sharedAt: Date;
    accessLevel: 'read' | 'write' | 'admin';
    expiresAt?: Date;
    allowedOperations: Set<ContainerOperation>;
    metadata: {
        containerName?: string;
        projectType?: string;
        description?: string;
    };
}
export interface TeamWorkspace {
    id: string;
    teamId: string;
    name: string;
    description: string;
    template: WorkspaceTemplate;
    createdBy: string;
    createdAt: Date;
    containers: string[];
    settings: WorkspaceSettings;
}
export interface WorkspaceTemplate {
    name: string;
    type: 'frontend' | 'backend' | 'fullstack' | 'data-science' | 'devops' | 'custom';
    baseImage?: string;
    preInstalled: string[];
    environment: {
        [key: string]: string;
    };
    ports: number[];
    resources: {
        cpu?: string;
        memory?: string;
        storage?: string;
    };
}
export interface WorkspaceSettings {
    autoSleep: boolean;
    sleepAfterMinutes: number;
    allowPublicAccess: boolean;
    backupEnabled: boolean;
    backupIntervalHours: number;
}
export type TeamPermission = 'create_containers' | 'delete_containers' | 'share_containers' | 'manage_members' | 'view_analytics' | 'manage_billing' | 'admin_access' | 'create_workspaces' | 'manage_templates';
export type ContainerOperation = 'read_files' | 'write_files' | 'execute_commands' | 'manage_git' | 'view_terminal' | 'manage_processes' | 'access_network' | 'install_packages';
export interface ActivityLog {
    id: string;
    teamId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    timestamp: Date;
    metadata: {
        [key: string]: any;
    };
    ipAddress?: string;
    userAgent?: string;
}
declare class TeamCollaborationManager {
    private teams;
    private userTeams;
    private activityLogs;
    private workspaceTemplates;
    constructor();
    private initializeDefaultTemplates;
    /**
     * Create a new team
     */
    createTeam(ownerId: string, name: string, description?: string, settings?: Partial<TeamSettings>): Team;
    /**
     * Add member to team
     */
    addTeamMember(teamId: string, userId: string, invitedBy: string, role?: 'admin' | 'developer' | 'viewer'): boolean;
    /**
     * Share container with team
     */
    shareContainer(containerId: string, teamId: string, sharedBy: string, accessLevel: 'read' | 'write' | 'admin', expiresAt?: Date, metadata?: {
        containerName?: string;
        projectType?: string;
        description?: string;
    }): ContainerShare;
    /**
     * Create team workspace from template
     */
    createTeamWorkspace(teamId: string, createdBy: string, name: string, description: string, templateName: string, customSettings?: Partial<WorkspaceSettings>): TeamWorkspace;
    /**
     * Check if user has specific permission in team
     */
    hasPermission(teamId: string, userId: string, permission: TeamPermission): boolean;
    /**
     * Check if user can access container
     */
    canAccessContainer(containerId: string, userId: string, operation: ContainerOperation): boolean;
    /**
     * Get user's teams
     */
    getUserTeams(userId: string): Team[];
    /**
     * Get team activity logs
     */
    getTeamActivity(teamId: string, limit?: number): ActivityLog[];
    /**
     * Get available workspace templates
     */
    getWorkspaceTemplates(): WorkspaceTemplate[];
    /**
     * Helper methods
     */
    private generateTeamId;
    private generateWorkspaceId;
    private getDefaultPermissions;
    private getOperationsForAccessLevel;
    private logActivity;
}
export { TeamCollaborationManager };
export declare let teamCollaborationManager: TeamCollaborationManager;
export declare const initializeTeamCollaborationManager: () => TeamCollaborationManager;
//# sourceMappingURL=teamCollaborationManager.d.ts.map