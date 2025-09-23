import { TeamCollaborationManager } from '../src/lib/teamCollaborationManager';
describe('Team Collaboration Manager', () => {
  let manager;
  beforeEach(() => {
    manager = new TeamCollaborationManager();
  });
  describe('Team Management', () => {
    test('should create a new team', () => {
      const team = manager.createTeam('user1', 'Test Team', 'A test team');
      expect(team.name).toBe('Test Team');
      expect(team.description).toBe('A test team');
      expect(team.ownerId).toBe('user1');
      expect(team.members.size).toBe(1);
      expect(team.members.get('user1')?.role).toBe('owner');
    });
    test('should add member to team', () => {
      const team = manager.createTeam('owner', 'Test Team');
      const success = manager.addTeamMember(team.id, 'member1', 'owner', 'developer');
      expect(success).toBe(true);
      expect(team.members.size).toBe(2);
      expect(team.members.get('member1')?.role).toBe('developer');
    });
    test('should prevent non-admin from adding members', () => {
      const team = manager.createTeam('owner', 'Test Team');
      manager.addTeamMember(team.id, 'member1', 'owner', 'developer');
      expect(() => {
        manager.addTeamMember(team.id, 'member2', 'member1', 'developer');
      }).toThrow('Insufficient permissions to add members');
    });
    test('should prevent adding duplicate members', () => {
      const team = manager.createTeam('owner', 'Test Team');
      expect(() => {
        manager.addTeamMember(team.id, 'owner', 'owner', 'developer');
      }).toThrow('User is already a member of this team');
    });
  });
  describe('Container Sharing', () => {
    test('should share container with team', () => {
      const team = manager.createTeam('owner', 'Test Team');
      const share = manager.shareContainer('container1', team.id, 'owner', 'write', undefined, {
        containerName: 'My Container',
        projectType: 'web',
      });
      expect(share.containerId).toBe('container1');
      expect(share.accessLevel).toBe('write');
      expect(share.allowedOperations.has('read_files')).toBe(true);
      expect(share.allowedOperations.has('write_files')).toBe(true);
      expect(share.metadata.containerName).toBe('My Container');
    });
    test('should check container access permissions', () => {
      const team = manager.createTeam('owner', 'Test Team');
      manager.addTeamMember(team.id, 'member1', 'owner', 'developer');
      manager.shareContainer('container1', team.id, 'owner', 'read');
      const canRead = manager.canAccessContainer('container1', 'member1', 'read_files');
      const canWrite = manager.canAccessContainer('container1', 'member1', 'write_files');
      expect(canRead).toBe(true);
      expect(canWrite).toBe(false);
    });
    test('should respect container expiration', () => {
      const team = manager.createTeam('owner', 'Test Team');
      manager.addTeamMember(team.id, 'member1', 'owner', 'developer');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      manager.shareContainer('container1', team.id, 'owner', 'write', yesterday);
      const canAccess = manager.canAccessContainer('container1', 'member1', 'read_files');
      expect(canAccess).toBe(false);
    });
  });
  describe('Permissions System', () => {
    test('should check team permissions correctly', () => {
      const team = manager.createTeam('owner', 'Test Team');
      manager.addTeamMember(team.id, 'admin1', 'owner', 'admin');
      manager.addTeamMember(team.id, 'dev1', 'owner', 'developer');
      manager.addTeamMember(team.id, 'viewer1', 'owner', 'viewer');
      // Owner should have all permissions
      expect(manager.hasPermission(team.id, 'owner', 'manage_members')).toBe(true);
      expect(manager.hasPermission(team.id, 'owner', 'delete_containers')).toBe(true);
      // Admin should have most permissions
      expect(manager.hasPermission(team.id, 'admin1', 'manage_members')).toBe(true);
      expect(manager.hasPermission(team.id, 'admin1', 'create_containers')).toBe(true);
      // Developer should have limited permissions
      expect(manager.hasPermission(team.id, 'dev1', 'create_containers')).toBe(true);
      expect(manager.hasPermission(team.id, 'dev1', 'manage_members')).toBe(false);
      // Viewer should have minimal permissions
      expect(manager.hasPermission(team.id, 'viewer1', 'create_containers')).toBe(false);
    });
    test('should return false for non-team members', () => {
      const team = manager.createTeam('owner', 'Test Team');
      expect(manager.hasPermission(team.id, 'outsider', 'create_containers')).toBe(false);
    });
  });
  describe('Workspace Management', () => {
    test('should create team workspace from template', () => {
      const team = manager.createTeam('owner', 'Test Team');
      const workspace = manager.createTeamWorkspace(
        team.id,
        'owner',
        'Frontend Project',
        'React application workspace',
        'frontend'
      );
      expect(workspace.name).toBe('Frontend Project');
      expect(workspace.description).toBe('React application workspace');
      expect(workspace.template.type).toBe('frontend');
      expect(workspace.template.preInstalled).toContain('node');
      expect(workspace.createdBy).toBe('owner');
    });
    test('should prevent non-authorized users from creating workspaces', () => {
      const team = manager.createTeam('owner', 'Test Team');
      manager.addTeamMember(team.id, 'viewer1', 'owner', 'viewer');
      expect(() => {
        manager.createTeamWorkspace(
          team.id,
          'viewer1',
          'Unauthorized Workspace',
          'Should fail',
          'frontend'
        );
      }).toThrow('Insufficient permissions to create workspaces');
    });
    test('should get available workspace templates', () => {
      const templates = manager.getWorkspaceTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.name === 'Frontend Development')).toBe(true);
      expect(templates.some(t => t.name === 'Backend Development')).toBe(true);
      expect(templates.some(t => t.name === 'Data Science')).toBe(true);
    });
  });
  describe('Activity Tracking', () => {
    test('should track team activities', () => {
      const team = manager.createTeam('owner', 'Test Team');
      manager.addTeamMember(team.id, 'member1', 'owner', 'developer');
      manager.shareContainer('container1', team.id, 'owner', 'write');
      const activity = manager.getTeamActivity(team.id);
      expect(activity.length).toBeGreaterThan(0);
      expect(activity.some(log => log.action === 'team_created')).toBe(true);
      expect(activity.some(log => log.action === 'member_added')).toBe(true);
      expect(activity.some(log => log.action === 'container_shared')).toBe(true);
    });
    test('should limit activity log entries', () => {
      const team = manager.createTeam('owner', 'Test Team');
      // Create many activities
      for (let i = 0; i < 100; i++) {
        try {
          manager.addTeamMember(team.id, `user${i}`, 'owner', 'developer');
        } catch {
          // Ignore duplicate member errors
        }
      }
      const activity = manager.getTeamActivity(team.id, 50);
      expect(activity.length).toBeLessThanOrEqual(50);
    });
  });
  describe('User Teams', () => {
    test('should get user teams', () => {
      const team1 = manager.createTeam('owner', 'Team 1');
      const team2 = manager.createTeam('owner', 'Team 2');
      manager.addTeamMember(team1.id, 'member1', 'owner', 'developer');
      const ownerTeams = manager.getUserTeams('owner');
      const memberTeams = manager.getUserTeams('member1');
      expect(ownerTeams.length).toBe(2);
      expect(memberTeams.length).toBe(1);
      expect(memberTeams[0].id).toBe(team1.id);
    });
    test('should return empty array for users with no teams', () => {
      const teams = manager.getUserTeams('nonexistent');
      expect(teams).toEqual([]);
    });
  });
  describe('Access Level Operations', () => {
    test('should map access levels to operations correctly', () => {
      const team = manager.createTeam('owner', 'Test Team');
      manager.addTeamMember(team.id, 'member1', 'owner', 'developer');
      // Test read access
      manager.shareContainer('container1', team.id, 'owner', 'read');
      expect(manager.canAccessContainer('container1', 'member1', 'read_files')).toBe(true);
      expect(manager.canAccessContainer('container1', 'member1', 'write_files')).toBe(false);
      expect(manager.canAccessContainer('container1', 'member1', 'manage_processes')).toBe(false);
      // Test write access
      manager.shareContainer('container2', team.id, 'owner', 'write');
      expect(manager.canAccessContainer('container2', 'member1', 'read_files')).toBe(true);
      expect(manager.canAccessContainer('container2', 'member1', 'write_files')).toBe(true);
      expect(manager.canAccessContainer('container2', 'member1', 'manage_processes')).toBe(false);
      // Test admin access
      manager.shareContainer('container3', team.id, 'owner', 'admin');
      expect(manager.canAccessContainer('container3', 'member1', 'read_files')).toBe(true);
      expect(manager.canAccessContainer('container3', 'member1', 'write_files')).toBe(true);
      expect(manager.canAccessContainer('container3', 'member1', 'manage_processes')).toBe(true);
    });
  });
  describe('Error Handling', () => {
    test('should handle non-existent team operations', () => {
      expect(() => {
        manager.addTeamMember('nonexistent', 'user1', 'user2', 'developer');
      }).toThrow('Team not found');
      expect(() => {
        manager.shareContainer('container1', 'nonexistent', 'user1', 'read');
      }).toThrow('Team not found');
    });
    test('should handle invalid template names', () => {
      const team = manager.createTeam('owner', 'Test Team');
      expect(() => {
        manager.createTeamWorkspace(
          team.id,
          'owner',
          'Invalid Workspace',
          'Should fail',
          'nonexistent-template'
        );
      }).toThrow('Workspace template not found');
    });
  });
});
//# sourceMappingURL=teamCollaboration.test.js.map
