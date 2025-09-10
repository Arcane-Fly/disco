# Drag-and-Drop Workflow Builder Technical Specification

## Overview

This document outlines the technical implementation details for the revolutionary drag-and-drop workflow builder that will transform how users interact with the Disco MCP platform.

## Architecture

### Core Components

```typescript
// Core workflow types
interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
  inputs: Port[];
  outputs: Port[];
  ui: UIProperties;
}

interface Port {
  id: string;
  name: string;
  type: DataType;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
}

interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  type: 'data' | 'control';
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  metadata: WorkflowMetadata;
  version: string;
}
```

### Node Type System

```typescript
enum NodeType {
  // Input/Output
  INPUT = 'input',
  OUTPUT = 'output',
  CONSTANT = 'constant',
  
  // Data Processing
  TRANSFORM = 'transform',
  FILTER = 'filter',
  MAP = 'map',
  REDUCE = 'reduce',
  SORT = 'sort',
  
  // Control Flow
  CONDITION = 'condition',
  SWITCH = 'switch',
  LOOP = 'loop',
  PARALLEL = 'parallel',
  SEQUENCE = 'sequence',
  
  // API Operations
  HTTP_REQUEST = 'http_request',
  GRAPHQL_QUERY = 'graphql_query',
  WEBHOOK = 'webhook',
  
  // File Operations
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  UPLOAD_FILE = 'upload_file',
  
  // Database Operations
  SQL_QUERY = 'sql_query',
  MONGODB_OPERATION = 'mongodb_operation',
  REDIS_OPERATION = 'redis_operation',
  
  // DevOps
  BUILD = 'build',
  TEST = 'test',
  DEPLOY = 'deploy',
  RUN_COMMAND = 'run_command',
  
  // AI/ML
  AI_PROMPT = 'ai_prompt',
  CODE_GENERATION = 'code_generation',
  IMAGE_ANALYSIS = 'image_analysis',
  TEXT_ANALYSIS = 'text_analysis',
  
  // Custom
  CUSTOM_FUNCTION = 'custom_function',
  SUBWORKFLOW = 'subworkflow'
}
```

### Drag-and-Drop Implementation

```typescript
// Using @dnd-kit for modern drag-and-drop
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';

interface WorkflowBuilderProps {
  workflow: WorkflowDefinition;
  onWorkflowChange: (workflow: WorkflowDefinition) => void;
  readonly?: boolean;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onWorkflowChange,
  readonly = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    // Handle drag start logic
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Handle node placement and connection creation
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <WorkflowCanvas workflow={workflow} />
      <NodePalette />
      <DragOverlay>
        {/* Render dragging node preview */}
      </DragOverlay>
    </DndContext>
  );
};
```

### Visual Node Editor

```typescript
interface NodeComponentProps {
  node: WorkflowNode;
  selected: boolean;
  onSelect: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onDelete: (nodeId: string) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  selected,
  onSelect,
  onUpdate,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: node.id,
    data: { node }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`node node-${node.type} ${selected ? 'selected' : ''}`}
      {...attributes}
      {...listeners}
    >
      <NodeHeader node={node} />
      <NodeInputs ports={node.inputs} />
      <NodeContent node={node} onUpdate={onUpdate} />
      <NodeOutputs ports={node.outputs} />
    </div>
  );
};
```

## Advanced Features

### Real-time Collaboration

```typescript
interface CollaborativeWorkflowBuilder {
  // Real-time synchronization
  syncWorkflowChanges(changes: WorkflowChange[]): Promise<void>;
  
  // Conflict resolution
  resolveConflicts(conflicts: Conflict[]): Promise<Resolution[]>;
  
  // Collaborative cursors
  trackUserCursors(users: CollaborativeUser[]): void;
  
  // Change history
  getChangeHistory(workflowId: string): Promise<ChangeHistory>;
}

interface WorkflowChange {
  id: string;
  type: 'node_added' | 'node_removed' | 'node_updated' | 'connection_added' | 'connection_removed';
  timestamp: Date;
  userId: string;
  data: any;
}
```

### AI-Powered Workflow Generation

```typescript
interface AIWorkflowGenerator {
  // Generate workflow from natural language
  generateFromDescription(description: string): Promise<WorkflowDefinition>;
  
  // Suggest next nodes
  suggestNextNodes(currentWorkflow: WorkflowDefinition, selectedNode?: string): Promise<NodeSuggestion[]>;
  
  // Optimize workflow performance
  optimizeWorkflow(workflow: WorkflowDefinition): Promise<OptimizationSuggestion[]>;
  
  // Generate test cases
  generateTestCases(workflow: WorkflowDefinition): Promise<TestCase[]>;
}

interface NodeSuggestion {
  node: WorkflowNode;
  reasoning: string;
  confidence: number;
  category: 'performance' | 'functionality' | 'best_practice';
}
```

### Workflow Execution Engine

```typescript
interface WorkflowExecutor {
  // Execute workflow
  execute(workflow: WorkflowDefinition, inputs: Record<string, any>): Promise<ExecutionResult>;
  
  // Step-by-step execution for debugging
  executeStep(workflowId: string, nodeId: string): Promise<StepResult>;
  
  // Parallel execution optimization
  getExecutionPlan(workflow: WorkflowDefinition): Promise<ExecutionPlan>;
  
  // Monitor execution
  monitorExecution(executionId: string): AsyncIterable<ExecutionStatus>;
}

interface ExecutionResult {
  id: string;
  status: 'success' | 'error' | 'cancelled';
  outputs: Record<string, any>;
  duration: number;
  nodeResults: Record<string, NodeResult>;
  errors?: ExecutionError[];
}
```

## UI/UX Specifications

### Visual Design System

```css
/* Node styling system */
.node {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-transparent;
  @apply min-w-[200px] max-w-[400px] transition-all duration-200;
}

.node.selected {
  @apply border-blue-500 shadow-blue-500/25;
}

.node.error {
  @apply border-red-500 bg-red-50 dark:bg-red-900/20;
}

.node.running {
  @apply border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20;
  animation: pulse 2s infinite;
}

.node.success {
  @apply border-green-500 bg-green-50 dark:bg-green-900/20;
}

/* Node type variations */
.node-input {
  @apply bg-blue-50 dark:bg-blue-900/20 border-blue-200;
}

.node-output {
  @apply bg-green-50 dark:bg-green-900/20 border-green-200;
}

.node-transform {
  @apply bg-purple-50 dark:bg-purple-900/20 border-purple-200;
}

.node-condition {
  @apply bg-orange-50 dark:bg-orange-900/20 border-orange-200;
}

/* Connection lines */
.connection {
  @apply stroke-2 fill-none transition-all duration-200;
}

.connection.data {
  @apply stroke-blue-500;
}

.connection.control {
  @apply stroke-gray-500 stroke-dasharray-[5,5];
}

.connection.active {
  @apply stroke-green-500 drop-shadow-[0_0_4px_rgba(34,197,94,0.5)];
  animation: flow 2s linear infinite;
}
```

### Responsive Design

```typescript
// Adaptive canvas based on screen size
const useResponsiveCanvas = () => {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('workflow-canvas');
      if (container) {
        setCanvasSize({
          width: container.clientWidth,
          height: container.clientHeight
        });
        setIsMobile(window.innerWidth < 768);
        
        // Adjust zoom for mobile devices
        if (window.innerWidth < 768) {
          setZoomLevel(0.8);
        }
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return { canvasSize, zoomLevel, isMobile };
};
```

### Mobile Touch Interactions

```typescript
// Enhanced mobile gestures
const useMobileGestures = () => {
  const [pinchState, setPinchState] = useState({ scale: 1, rotation: 0 });
  
  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      // Start pinch gesture
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      setPinchState(prev => ({ ...prev, initialDistance: distance }));
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      // Handle pinch-to-zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = distance / pinchState.initialDistance;
      setPinchState(prev => ({ ...prev, scale }));
    }
  };

  return { handleTouchStart, handleTouchMove, pinchState };
};
```

## Performance Optimizations

### Virtual Scrolling for Large Workflows

```typescript
// Virtualized node rendering for performance
const VirtualizedWorkflowCanvas: React.FC<{
  nodes: WorkflowNode[];
  connections: Connection[];
}> = ({ nodes, connections }) => {
  const [visibleNodes, setVisibleNodes] = useState<WorkflowNode[]>([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const updateVisibleNodes = useCallback(() => {
    const visible = nodes.filter(node => {
      return (
        node.position.x + 200 >= viewport.x &&
        node.position.x <= viewport.x + viewport.width &&
        node.position.y + 150 >= viewport.y &&
        node.position.y <= viewport.y + viewport.height
      );
    });
    
    setVisibleNodes(visible);
  }, [nodes, viewport]);

  return (
    <div onScroll={handleScroll}>
      {visibleNodes.map(node => (
        <NodeComponent key={node.id} node={node} />
      ))}
    </div>
  );
};
```

### Optimistic Updates

```typescript
// Optimistic UI updates for better UX
const useOptimisticWorkflow = (initialWorkflow: WorkflowDefinition) => {
  const [optimisticState, setOptimisticState] = useState(initialWorkflow);
  const [pendingChanges, setPendingChanges] = useState<WorkflowChange[]>([]);

  const updateWorkflow = async (changes: WorkflowChange[]) => {
    // Apply changes optimistically
    const newState = applyChanges(optimisticState, changes);
    setOptimisticState(newState);
    setPendingChanges(prev => [...prev, ...changes]);

    try {
      // Send to server
      await syncChangesToServer(changes);
      
      // Remove from pending on success
      setPendingChanges(prev => 
        prev.filter(change => !changes.includes(change))
      );
    } catch (error) {
      // Revert on error
      setOptimisticState(initialWorkflow);
      setPendingChanges(prev => 
        prev.filter(change => !changes.includes(change))
      );
      throw error;
    }
  };

  return { optimisticState, updateWorkflow, pendingChanges };
};
```

## Testing Strategy

### Component Testing

```typescript
// Jest + React Testing Library tests
describe('WorkflowBuilder', () => {
  test('should create node when dropped on canvas', async () => {
    const mockWorkflow = createMockWorkflow();
    const { getByTestId } = render(
      <WorkflowBuilder 
        workflow={mockWorkflow} 
        onWorkflowChange={jest.fn()} 
      />
    );

    const nodeTemplate = getByTestId('node-template-input');
    const canvas = getByTestId('workflow-canvas');

    // Simulate drag and drop
    fireEvent.dragStart(nodeTemplate);
    fireEvent.dragEnter(canvas);
    fireEvent.drop(canvas);

    await waitFor(() => {
      expect(getByTestId('workflow-node')).toBeInTheDocument();
    });
  });

  test('should connect nodes when dragged from output to input', async () => {
    // Test connection creation logic
  });
});
```

### Integration Testing

```typescript
// Playwright E2E tests
test('workflow builder integration', async ({ page }) => {
  await page.goto('/workflow-builder');
  
  // Create a simple workflow
  await page.dragAndDrop('[data-node-type="input"]', '[data-testid="canvas"]');
  await page.dragAndDrop('[data-node-type="transform"]', '[data-testid="canvas"]');
  
  // Connect nodes
  await page.dragAndDrop(
    '[data-testid="output-port"]',
    '[data-testid="input-port"]'
  );
  
  // Execute workflow
  await page.click('[data-testid="execute-button"]');
  
  // Verify results
  await expect(page.locator('[data-testid="execution-result"]')).toBeVisible();
});
```

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Core workflow data structures
- [ ] Basic drag-and-drop implementation
- [ ] Node component system
- [ ] Canvas rendering

### Week 3-4: Advanced Features
- [ ] Connection system
- [ ] Node palette
- [ ] Property panels
- [ ] Workflow execution engine

### Week 5-6: AI Integration
- [ ] AI workflow generation
- [ ] Smart suggestions
- [ ] Auto-completion
- [ ] Error detection

### Week 7-8: Collaboration & Polish
- [ ] Real-time collaboration
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Testing and documentation

This specification provides a comprehensive foundation for implementing the revolutionary drag-and-drop workflow builder that will transform the Disco MCP platform into an intuitive, powerful development environment.