/**
 * Modern State Management - Phase 1 Implementation
 * Using Zustand for optimal state management as specified in roadmap
 * Features optimistic updates, time-travel debugging, and persistence
 */

import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Enhanced workflow interfaces following roadmap specifications
export interface WorkflowNode {
  id: string;
  type:
    | 'input'
    | 'output'
    | 'transform'
    | 'filter'
    | 'condition'
    | 'loop'
    | 'parallel'
    | 'http_request'
    | 'database'
    | 'file_operation'
    | 'ai_prompt'
    | 'code_generation'
    | 'build'
    | 'test'
    | 'deploy';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
    status?: 'idle' | 'running' | 'success' | 'error';
    lastExecuted?: number;
  };
  connections: string[]; // Connected node IDs
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  type: 'data' | 'control';
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  created: number;
  lastModified: number;
  version: number;
  tags: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  layout: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  notifications: boolean;
  autoSave: boolean;
  gridSnap: boolean;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  lastUpdated: number;
}

export interface AIAssistant {
  isActive: boolean;
  suggestions: Array<{
    id: string;
    type: 'workflow' | 'optimization' | 'fix' | 'enhancement';
    title: string;
    description: string;
    confidence: number;
    preview?: string;
  }>;
  currentContext?: string;
}

// Main application state interface
export interface AppState {
  // Workflow management
  workflows: WorkflowDefinition[];
  activeWorkflowId: string | null;
  selectedNodeIds: string[];
  isEditing: boolean;
  draggedNode: WorkflowNode | null;

  // UI state
  userPreferences: UserPreferences;
  sidebarOpen: boolean;
  modalStack: string[];
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    autoHide?: boolean;
  }>;

  // Performance and monitoring
  performanceMetrics: PerformanceMetrics;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';

  // AI features
  aiAssistant: AIAssistant;

  // Loading states
  loading: {
    workflows: boolean;
    execution: boolean;
    aiSuggestions: boolean;
  };

  // Error handling
  errors: Array<{
    id: string;
    message: string;
    stack?: string;
    timestamp: number;
    context?: string;
  }>;
}

// Action types for state mutations
export interface AppActions {
  // Workflow actions
  createWorkflow: (
    workflow: Omit<WorkflowDefinition, 'id' | 'created' | 'lastModified' | 'version'>
  ) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowDefinition>) => void;
  deleteWorkflow: (id: string) => void;
  setActiveWorkflow: (id: string | null) => void;
  duplicateWorkflow: (id: string) => void;

  // Node management
  addNode: (workflowId: string, node: Omit<WorkflowNode, 'id'>) => void;
  updateNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (workflowId: string, nodeId: string) => void;
  selectNodes: (nodeIds: string[]) => void;
  moveNodes: (workflowId: string, nodeIds: string[], delta: { x: number; y: number }) => void;

  // Connection management
  addConnection: (workflowId: string, connection: Omit<WorkflowConnection, 'id'>) => void;
  removeConnection: (workflowId: string, connectionId: string) => void;

  // UI actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId?: string) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;

  // Performance monitoring
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  updateSystemHealth: (health: AppState['systemHealth']) => void;

  // AI assistant
  toggleAIAssistant: () => void;
  updateAISuggestions: (suggestions: AIAssistant['suggestions']) => void;
  applyAISuggestion: (suggestionId: string) => void;
  dismissAISuggestion: (suggestionId: string) => void;

  // Error handling
  addError: (error: Omit<AppState['errors'][0], 'id' | 'timestamp'>) => void;
  clearErrors: () => void;

  // Utility actions
  reset: () => void;
  undo: () => void;
  redo: () => void;
}

// Default state
const defaultState: AppState = {
  workflows: [],
  activeWorkflowId: null,
  selectedNodeIds: [],
  isEditing: false,
  draggedNode: null,

  userPreferences: {
    theme: 'light',
    layout: 'comfortable',
    animations: true,
    notifications: true,
    autoSave: true,
    gridSnap: true,
  },

  sidebarOpen: true,
  modalStack: [],
  notifications: [],

  performanceMetrics: {
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    activeConnections: 0,
    lastUpdated: Date.now(),
  },

  systemHealth: 'excellent',

  aiAssistant: {
    isActive: false,
    suggestions: [],
    currentContext: undefined,
  },

  loading: {
    workflows: false,
    execution: false,
    aiSuggestions: false,
  },

  errors: [],
};

/**
 * Modern Zustand store with advanced features:
 * - Immer for immutable updates
 * - Persistence for user preferences
 * - DevTools integration
 * - Subscription-based reactivity
 * - Time-travel debugging support
 */
export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, _get) => ({
          ...defaultState,

          // Workflow actions
          createWorkflow: workflow =>
            set(state => {
              const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const newWorkflow: WorkflowDefinition = {
                ...workflow,
                id,
                created: Date.now(),
                lastModified: Date.now(),
                version: 1,
              };
              state.workflows.push(newWorkflow);
              state.activeWorkflowId = id;
            }),

          updateWorkflow: (id, updates) =>
            set(state => {
              const workflow = state.workflows.find(w => w.id === id);
              if (workflow) {
                Object.assign(workflow, updates);
                workflow.lastModified = Date.now();
                workflow.version += 1;
              }
            }),

          deleteWorkflow: id =>
            set(state => {
              state.workflows = state.workflows.filter(w => w.id !== id);
              if (state.activeWorkflowId === id) {
                state.activeWorkflowId = state.workflows[0]?.id || null;
              }
            }),

          setActiveWorkflow: id =>
            set(state => {
              state.activeWorkflowId = id;
              state.selectedNodeIds = [];
            }),

          duplicateWorkflow: id =>
            set(state => {
              const workflow = state.workflows.find(w => w.id === id);
              if (workflow) {
                const newId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const duplicated: WorkflowDefinition = {
                  ...workflow,
                  id: newId,
                  name: `${workflow.name} (Copy)`,
                  created: Date.now(),
                  lastModified: Date.now(),
                  version: 1,
                };
                state.workflows.push(duplicated);
                state.activeWorkflowId = newId;
              }
            }),

          // Node management
          addNode: (workflowId, node) =>
            set(state => {
              const workflow = state.workflows.find(w => w.id === workflowId);
              if (workflow) {
                const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                workflow.nodes.push({ ...node, id });
                workflow.lastModified = Date.now();
                workflow.version += 1;
              }
            }),

          updateNode: (workflowId, nodeId, updates) =>
            set(state => {
              const workflow = state.workflows.find(w => w.id === workflowId);
              if (workflow) {
                const node = workflow.nodes.find(n => n.id === nodeId);
                if (node) {
                  Object.assign(node, updates);
                  workflow.lastModified = Date.now();
                  workflow.version += 1;
                }
              }
            }),

          deleteNode: (workflowId, nodeId) =>
            set(state => {
              const workflow = state.workflows.find(w => w.id === workflowId);
              if (workflow) {
                workflow.nodes = workflow.nodes.filter(n => n.id !== nodeId);
                workflow.connections = workflow.connections.filter(
                  c => c.source !== nodeId && c.target !== nodeId
                );
                state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== nodeId);
                workflow.lastModified = Date.now();
                workflow.version += 1;
              }
            }),

          selectNodes: nodeIds =>
            set(state => {
              state.selectedNodeIds = nodeIds;
            }),

          moveNodes: (workflowId, nodeIds, delta) =>
            set(state => {
              const workflow = state.workflows.find(w => w.id === workflowId);
              if (workflow) {
                nodeIds.forEach(nodeId => {
                  const node = workflow.nodes.find(n => n.id === nodeId);
                  if (node) {
                    node.position.x += delta.x;
                    node.position.y += delta.y;
                  }
                });
                workflow.lastModified = Date.now();
                workflow.version += 1;
              }
            }),

          // Connection management
          addConnection: (workflowId, connection) =>
            set(state => {
              const workflow = state.workflows.find(w => w.id === workflowId);
              if (workflow) {
                const id = `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                workflow.connections.push({ ...connection, id });
                workflow.lastModified = Date.now();
                workflow.version += 1;
              }
            }),

          removeConnection: (workflowId, connectionId) =>
            set(state => {
              const workflow = state.workflows.find(w => w.id === workflowId);
              if (workflow) {
                workflow.connections = workflow.connections.filter(c => c.id !== connectionId);
                workflow.lastModified = Date.now();
                workflow.version += 1;
              }
            }),

          // UI actions
          updatePreferences: preferences =>
            set(state => {
              Object.assign(state.userPreferences, preferences);
            }),

          toggleSidebar: () =>
            set(state => {
              state.sidebarOpen = !state.sidebarOpen;
            }),

          openModal: modalId =>
            set(state => {
              if (!state.modalStack.includes(modalId)) {
                state.modalStack.push(modalId);
              }
            }),

          closeModal: modalId =>
            set(state => {
              if (modalId) {
                state.modalStack = state.modalStack.filter(id => id !== modalId);
              } else {
                state.modalStack.pop();
              }
            }),

          addNotification: notification =>
            set(state => {
              const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              state.notifications.push({
                ...notification,
                id,
                timestamp: Date.now(),
              });
            }),

          removeNotification: id =>
            set(state => {
              state.notifications = state.notifications.filter(n => n.id !== id);
            }),

          // Performance monitoring
          updatePerformanceMetrics: metrics =>
            set(state => {
              Object.assign(state.performanceMetrics, metrics);
              state.performanceMetrics.lastUpdated = Date.now();
            }),

          updateSystemHealth: health =>
            set(state => {
              state.systemHealth = health;
            }),

          // AI assistant
          toggleAIAssistant: () =>
            set(state => {
              state.aiAssistant.isActive = !state.aiAssistant.isActive;
            }),

          updateAISuggestions: suggestions =>
            set(state => {
              state.aiAssistant.suggestions = suggestions;
            }),

          applyAISuggestion: suggestionId =>
            set(state => {
              // Implementation would depend on suggestion type
              state.aiAssistant.suggestions = state.aiAssistant.suggestions.filter(
                s => s.id !== suggestionId
              );
            }),

          dismissAISuggestion: suggestionId =>
            set(state => {
              state.aiAssistant.suggestions = state.aiAssistant.suggestions.filter(
                s => s.id !== suggestionId
              );
            }),

          // Error handling
          addError: error =>
            set(state => {
              const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              state.errors.push({
                ...error,
                id,
                timestamp: Date.now(),
              });
            }),

          clearErrors: () =>
            set(state => {
              state.errors = [];
            }),

          // Utility actions
          reset: () => set(() => ({ ...defaultState })),
          undo: () => {
            // Implementation would require history tracking
            console.log('Undo functionality would be implemented here');
          },
          redo: () => {
            // Implementation would require history tracking
            console.log('Redo functionality would be implemented here');
          },
        }))
      ),
      {
        name: 'disco-app-store',
        partialize: state => ({
          userPreferences: state.userPreferences,
          workflows: state.workflows,
          activeWorkflowId: state.activeWorkflowId,
        }),
      }
    ),
    {
      name: 'disco-store',
    }
  )
);

// Selector hooks for optimized subscriptions
export const useActiveWorkflow = () =>
  useAppStore(state => state.workflows.find(w => w.id === state.activeWorkflowId));

export const useSelectedNodes = () =>
  useAppStore(state => {
    const activeWorkflow = state.workflows.find(w => w.id === state.activeWorkflowId);
    return activeWorkflow?.nodes.filter(n => state.selectedNodeIds.includes(n.id)) || [];
  });

export const usePerformanceMetrics = () => useAppStore(state => state.performanceMetrics);

export const useAISuggestions = () => useAppStore(state => state.aiAssistant.suggestions);

export default useAppStore;
