# PocketFlow Integration - Phase 1 Implementation Prompt

**Status**: Ready for Implementation  
**Approval**: Confirmed by @GaryOcean428  
**Timeline**: 2 weeks (Phase 1 POC)  
**Reference Documents**:
- Full Proposal: `docs/DISCO_POCKETFLOW_INTEGRATION_REVIEW.md`
- Quick Summary: `docs/POCKETFLOW_INTEGRATION_SUMMARY.md`
- Architecture Diagrams: `docs/diagrams/pocketflow-integration-architecture.md`

---

## Implementation Prompt for Next Run

### Context

You are implementing Phase 1 (Foundation) of the PocketFlow integration into the Disco MCP Server. This integration has been fully approved and will transform the workflow builder from a generic visual editor into a cutting-edge AI agent platform.

**What is PocketFlow?**
- Minimalistic 100-line LLM workflow framework
- Graph-based DAG (Directed Acyclic Graph) execution engine
- Zero dependencies, WebContainer compatible
- 30+ cookbook patterns for RAG, agents, multi-agent coordination
- Cross-language support (TypeScript, Python, Go, Rust)

**Why this integration?**
- Current workflow builder lacks high-level AI/agent abstractions
- Users must manually wire low-level operations
- No ready-made templates for AI workflows (RAG, multi-agent, etc.)
- Hours to create AI workflows → Target: < 5 minutes

**Infrastructure Foundation (Already Complete - Sessions 8-10):**
- ✅ Railway deployment validated (Node 22.x, Yarn 4.9.2)
- ✅ GitHub Actions CI/CD working (contract validation, Nx CI)
- ✅ WebContainer integration stable
- ✅ RAG API available at `/api/v1/rag/:containerId/search`
- ✅ File, terminal, git APIs operational

---

## Phase 1 Objectives (2 Weeks)

### Week 1: Port PocketFlow Core

**Goal**: Create TypeScript port of PocketFlow's 100-line core

**Tasks**:

1. **Create PocketFlow Core Module** (`src/lib/pocketflow.ts`)
   ```typescript
   // Implement PocketFlow's graph abstraction
   export class PocketFlow {
     private nodes: Map<string, (input: any) => any | Promise<any>>;
     private edges: Array<[string, string]>;
     
     constructor() {
       this.nodes = new Map();
       this.edges = [];
     }
     
     addNode(name: string, fn: (input: any) => any | Promise<any>): void {
       // Add node to graph
     }
     
     addEdge(from: string, to: string): void {
       // Add directed edge
     }
     
     async execute(inputs: Record<string, any>): Promise<any> {
       // Topological sort + async execution
     }
     
     private topologicalSort(): string[] {
       // Kahn's algorithm
     }
   }
   ```

2. **Create Test Suite** (`test/pocketflow.test.ts`)
   - Unit tests for node addition
   - Unit tests for edge creation
   - Unit tests for topological sort
   - Unit tests for execution (simple workflow)
   - Unit tests for async execution
   - Unit tests for error handling
   - Target: >90% coverage

3. **Add Type Definitions** (`src/types/pocketflow.ts`)
   ```typescript
   export interface PocketFlowNode {
     name: string;
     fn: (input: any) => any | Promise<any>;
   }
   
   export interface PocketFlowEdge {
     from: string;
     to: string;
   }
   
   export interface PocketFlowExecutionResult {
     outputs: Record<string, any>;
     executionTime: number;
     nodesExecuted: string[];
   }
   ```

### Week 2: POC - RAG Node + Execution

**Goal**: Create proof-of-concept with functional RAG retrieve node

**Tasks**:

1. **Create Workflow Executor Service** (`src/features/workflow/services/PocketFlowExecutor.ts`)
   ```typescript
   export class PocketFlowExecutor {
     async executeWorkflow(
       workflow: WorkflowDefinition,
       inputs: Record<string, any>
     ): Promise<ExecutionResult> {
       // Convert WorkflowDefinition to PocketFlow graph
       // Execute and return results with progress tracking
     }
   }
   ```

2. **Implement RAG Retrieve Node** (`src/features/workflow/nodes/RAGRetrieveNode.ts`)
   ```typescript
   export class RAGRetrieveNode {
     async execute(inputs: {
       query: string;
       limit?: number;
       containerId: string;
     }): Promise<{ documents: any[]; totalResults: number }> {
       // Call /api/v1/rag/:containerId/search
       // Return formatted results
     }
   }
   ```

3. **Add Execution UI** (Update `frontend/components/workflow/WorkflowBuilder.tsx`)
   - Add "Execute Workflow" button to toolbar
   - Create execution progress panel (shows node-by-node execution)
   - Display results in output panel
   - Show execution time and status

4. **Create Demo Workflow**
   - Input Node → RAG Retrieve Node → Output Node
   - Sample query: "How to use WebContainers?"
   - Validate execution in WebContainer environment

5. **Integration Tests** (`test/pocketflow-integration.test.ts`)
   - Test workflow definition → PocketFlow graph conversion
   - Test RAG node execution
   - Test end-to-end workflow execution
   - Test error handling and recovery

---

## Technical Requirements

### Repository Structure
```
src/
├── lib/
│   └── pocketflow.ts              # Core PocketFlow engine (NEW)
├── types/
│   └── pocketflow.ts              # PocketFlow type definitions (NEW)
├── features/
│   └── workflow/
│       ├── services/
│       │   └── PocketFlowExecutor.ts  # Workflow execution service (NEW)
│       └── nodes/
│           └── RAGRetrieveNode.ts     # First AI node implementation (NEW)
test/
├── pocketflow.test.ts             # Core engine tests (NEW)
└── pocketflow-integration.test.ts # Integration tests (NEW)
frontend/
└── components/
    └── workflow/
        └── WorkflowBuilder.tsx     # Update with execution UI
```

### Build & Test Commands
```bash
# Build
yarn build:server

# Test
yarn test                          # All tests
yarn test:unit                     # Unit tests only
yarn test:integration              # Integration tests only

# Development
yarn dev                           # Start dev server
```

### Success Criteria

**Week 1 (Core Port)**:
- [ ] `src/lib/pocketflow.ts` created with 100-line core implementation
- [ ] `test/pocketflow.test.ts` with 20+ test cases (>90% coverage)
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Documentation comments (JSDoc) for all public methods

**Week 2 (POC)**:
- [ ] `PocketFlowExecutor` service operational
- [ ] `RAGRetrieveNode` functional (calls Disco's RAG API)
- [ ] Execution UI integrated in workflow builder
- [ ] Demo workflow: Input → RAG Retrieve → Output works
- [ ] Workflow executes successfully in WebContainer
- [ ] Integration tests passing
- [ ] No regressions (all existing tests pass)

**Overall Phase 1**:
- [ ] Documentation updated (`docs/POCKETFLOW_PHASE1_RESULTS.md`)
- [ ] Demo video/screenshots captured
- [ ] Code reviewed and approved
- [ ] Ready for Phase 2 (AI Node Library)

---

## Implementation Guidelines

### Code Quality Standards
- **TypeScript**: Strict mode enabled, no `any` without justification
- **Testing**: >90% coverage for new code
- **Documentation**: JSDoc for all public APIs
- **Error Handling**: Comprehensive try-catch, meaningful error messages
- **Performance**: Execution overhead < 500ms for simple workflows

### Integration Points

1. **Existing Workflow Builder** (`frontend/components/workflow/WorkflowBuilder.tsx`)
   - Current interfaces: `WorkflowNode`, `WorkflowConnection`, `WorkflowDefinition`
   - Add execution state management (Zustand store)
   - Add progress tracking hooks

2. **RAG API** (`src/api/rag.ts`)
   - Endpoint: `POST /api/v1/rag/:containerId/search`
   - Request: `{ query: string, limit?: number, useAST?: boolean }`
   - Response: `{ status: 'success', data: { results: [], totalResults: number } }`

3. **WebContainer Integration** (`src/lib/containerManager.ts`)
   - Use existing container sessions
   - Leverage container pooling
   - Respect container lifecycle

### Validation Steps

1. **After Core Port (Week 1)**:
   ```bash
   yarn test test/pocketflow.test.ts
   # Should show 20+ tests passing
   ```

2. **After POC (Week 2)**:
   ```bash
   yarn build
   yarn test
   # All tests should pass
   
   # Manual validation:
   # 1. Start dev server: yarn dev
   # 2. Navigate to /workflow-builder
   # 3. Create demo workflow (Input → RAG Retrieve → Output)
   # 4. Click "Execute Workflow"
   # 5. Verify results displayed in output panel
   ```

---

## Reference Implementation (PocketFlow Core Pattern)

### Python Reference (from PocketFlow repository)
```python
class Flow:
    def __init__(self):
        self.nodes = {}
        self.edges = []
    
    def add_node(self, name, fn):
        self.nodes[name] = fn
    
    def add_edge(self, from_node, to_node):
        self.edges.append((from_node, to_node))
    
    def run(self, inputs):
        # Topological sort
        sorted_nodes = self._topological_sort()
        
        # Execute in order
        state = {**inputs}
        for node_name in sorted_nodes:
            fn = self.nodes[node_name]
            state[node_name] = fn(state)
        
        return state
```

### TypeScript Port Pattern
```typescript
export class PocketFlow {
  private nodes = new Map<string, (input: any) => any | Promise<any>>();
  private edges: Array<[string, string]> = [];
  
  addNode(name: string, fn: (input: any) => any | Promise<any>): void {
    this.nodes.set(name, fn);
  }
  
  addEdge(from: string, to: string): void {
    this.edges.push([from, to]);
  }
  
  async execute(inputs: Record<string, any>): Promise<Record<string, any>> {
    const sorted = this.topologicalSort();
    let state = { ...inputs };
    
    for (const nodeName of sorted) {
      const fn = this.nodes.get(nodeName)!;
      state[nodeName] = await fn(state);
    }
    
    return state;
  }
  
  private topologicalSort(): string[] {
    // Kahn's algorithm implementation
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();
    
    // Initialize
    for (const [from, to] of this.edges) {
      if (!adjList.has(from)) adjList.set(from, []);
      adjList.get(from)!.push(to);
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    }
    
    // Find nodes with no incoming edges
    const queue: string[] = [];
    for (const node of this.nodes.keys()) {
      if (!inDegree.has(node)) {
        queue.push(node);
      }
    }
    
    // Process queue
    const result: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);
      
      const neighbors = adjList.get(node) || [];
      for (const neighbor of neighbors) {
        const degree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, degree);
        if (degree === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    // Check for cycles
    if (result.length !== this.nodes.size) {
      throw new Error('Workflow contains cycles');
    }
    
    return result;
  }
}
```

---

## Example Usage (Target Demo)

### Creating a Simple Workflow
```typescript
import { PocketFlow } from './src/lib/pocketflow';

// Create workflow
const flow = new PocketFlow();

// Add nodes
flow.addNode('input', (state) => ({ query: 'How to use WebContainers?' }));

flow.addNode('rag_retrieve', async (state) => {
  const response = await fetch('/api/v1/rag/container123/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: state.query, limit: 5 })
  });
  const data = await response.json();
  return { documents: data.data.results };
});

flow.addNode('output', (state) => {
  console.log('RAG Results:', state.documents);
  return { success: true };
});

// Connect nodes
flow.addEdge('input', 'rag_retrieve');
flow.addEdge('rag_retrieve', 'output');

// Execute
const result = await flow.execute({});
console.log('Workflow completed:', result);
```

---

## Debugging & Troubleshooting

### Common Issues

1. **Circular Dependencies**
   - Symptom: "Workflow contains cycles" error
   - Solution: Check edge definitions, ensure DAG structure

2. **Async Execution Errors**
   - Symptom: Promise rejections
   - Solution: Add try-catch in node functions, log errors

3. **WebContainer Compatibility**
   - Symptom: Execution fails in WebContainer
   - Solution: Ensure all dependencies are browser-compatible

4. **RAG API Integration**
   - Symptom: API calls fail
   - Solution: Check container ID, verify API endpoint, check authentication

### Validation Checklist

Before marking Phase 1 complete:
- [ ] All unit tests passing (>90% coverage)
- [ ] All integration tests passing
- [ ] No TypeScript compilation errors
- [ ] Demo workflow executes successfully
- [ ] Execution UI displays results correctly
- [ ] Performance meets target (<500ms overhead)
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Screenshots/demo captured

---

## Next Phase Preview (Phase 2)

After Phase 1 completion, Phase 2 will implement:
- 15+ AI-specific node types (LLM, RAG, agents, multi-agent)
- Node registration system
- Node configuration UI
- Expanded test coverage
- Node documentation

---

## Resources

**Documentation**:
- PocketFlow Repository: https://github.com/PocketFlow-AI/PocketFlow
- PocketFlow TypeScript Port: https://github.com/PocketFlow-AI/PocketFlow-TS
- Disco Production: https://disco-mcp.up.railway.app
- Full Proposal: `docs/DISCO_POCKETFLOW_INTEGRATION_REVIEW.md`

**Code References**:
- Workflow Builder: `frontend/components/workflow/WorkflowBuilder.tsx`
- RAG API: `src/api/rag.ts`
- Container Manager: `src/lib/containerManager.ts`
- Enhanced RAG: `src/lib/enhanced-rag.ts`

**Testing**:
- Existing Tests: `test/` directory
- Contract Tests: `test/contract-validation.test.ts` (27 tests passing)
- Build Command: `yarn build`
- Test Command: `yarn test`

---

## Summary

**Goal**: Port PocketFlow core and create RAG node POC in 2 weeks

**Deliverables**:
1. PocketFlow core engine (100 lines, TypeScript)
2. Test suite (20+ tests, >90% coverage)
3. RAG retrieve node implementation
4. Workflow executor service
5. Execution UI in workflow builder
6. Demo workflow (Input → RAG → Output)
7. Integration tests
8. Documentation

**Success Metric**: Demo workflow executes successfully, displaying RAG results in < 5 seconds

**Approval**: ✅ Confirmed by @GaryOcean428

**Ready to Start**: Yes - All prerequisites met, infrastructure stable

---

*This prompt contains all details needed to commence Phase 1 implementation. Refer to the full proposal documents for additional context and future phases.*
