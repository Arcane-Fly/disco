# PocketFlow Examples

This directory contains demonstration examples for the PocketFlow integration in Disco.

## Running the Examples

### Using Node.js directly

```bash
cd /home/runner/work/disco/disco
npx tsx examples/pocketflow-demo.ts
```

### Using the test suite

The examples are also tested as part of the integration test suite:

```bash
yarn test test/pocketflow
```

## Available Examples

### Example 1: Simple PocketFlow Workflow
Demonstrates basic workflow creation with three nodes:
- Input node: Creates initial data
- Process node: Transforms the data
- Output node: Displays results

**Concepts**: Node creation, edges, basic execution

### Example 2: Branching Workflow
Shows how to create workflows with multiple execution paths (diamond pattern):
- One input node splits into two parallel branches
- Both branches merge into a final node

**Concepts**: Parallel execution, branching, merging

### Example 3: Async Operations
Demonstrates asynchronous node execution:
- Multiple async nodes running in parallel
- Proper handling of promises
- Combining async results

**Concepts**: Async/await, parallel processing, timing

### Example 4: Workflow Executor
Shows how to use the high-level `PocketFlowExecutor` service:
- Convert workflow definitions to executable graphs
- Progress tracking with callbacks
- Integration with Disco's workflow system

**Concepts**: Service integration, progress tracking, workflow definitions

### Example 5: RAG Retrieve Node
Demonstrates the RAG node integration:
- Configuration options
- API integration
- PocketFlow compatibility

**Concepts**: AI integration, RAG functionality, node types

### Example 6: Error Handling
Shows different error handling strategies:
- Continue on error vs. stop on error
- Error propagation
- Recovery strategies

**Concepts**: Error handling, fault tolerance, debugging

## Code Structure

```
examples/
├── README.md           # This file
└── pocketflow-demo.ts  # All examples in one file
```

## Integration Points

The examples demonstrate integration with:

1. **PocketFlow Core** (`src/lib/pocketflow.ts`)
   - Graph-based execution engine
   - Topological sorting
   - Async support

2. **Workflow Executor** (`src/features/workflow/services/PocketFlowExecutor.ts`)
   - Workflow definition conversion
   - Progress tracking
   - Validation

3. **RAG Node** (`src/features/workflow/nodes/RAGRetrieveNode.ts`)
   - RAG API integration
   - Input/output handling
   - Error management

## Next Steps

After reviewing these examples, explore:

1. **Core Tests**: `test/pocketflow.test.ts` - 27 unit tests
2. **Integration Tests**: `test/pocketflow-integration.test.ts` - 18 integration tests
3. **Documentation**: `docs/POCKETFLOW_PHASE1_RESULTS.md` - Complete results
4. **Implementation Prompt**: `docs/POCKETFLOW_PHASE1_IMPLEMENTATION_PROMPT.md` - Original requirements

## Phase 2 Preview

Phase 2 will add:
- 15+ AI-specific node types (LLM, agents, multi-agent)
- Visual workflow execution in the UI
- Template system for common patterns
- Advanced debugging tools

See `docs/POCKETFLOW_INTEGRATION_SUMMARY.md` for the full roadmap.
