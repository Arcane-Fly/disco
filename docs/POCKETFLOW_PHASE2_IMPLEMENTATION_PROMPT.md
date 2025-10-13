# PocketFlow Integration - Phase 2 Implementation Prompt

**Status**: Ready for Implementation  
**Prerequisites**: Phase 1 Complete ✅  
**Timeline**: 2 weeks (Phase 2 - AI Node Library)  
**Reference Documents**:
- Phase 1 Results: `docs/POCKETFLOW_PHASE1_RESULTS.md`
- Full Proposal: `docs/DISCO_POCKETFLOW_INTEGRATION_REVIEW.md`
- Quick Summary: `docs/POCKETFLOW_INTEGRATION_SUMMARY.md`

---

## Implementation Prompt for Next Run

### Context

You are implementing Phase 2 (AI Node Library) of the PocketFlow integration into the Disco MCP Server. Phase 1 has been completed successfully with:
- ✅ PocketFlow core engine (100-line TypeScript port)
- ✅ Workflow executor service
- ✅ RAG Retrieve Node (first AI node)
- ✅ 45 passing tests (27 core + 18 integration)
- ✅ Comprehensive documentation and examples

**Phase 1 Foundation:**
```
src/
├── lib/
│   └── pocketflow.ts              # Core PocketFlow engine
├── types/
│   └── pocketflow.ts              # Type definitions
├── features/
│   └── workflow/
│       ├── services/
│       │   └── PocketFlowExecutor.ts  # Workflow executor
│       └── nodes/
│           └── RAGRetrieveNode.ts     # First AI node (RAG Retrieve)
```

**Phase 2 Goal**: Expand the node library with 15+ AI-specific node types to enable sophisticated AI workflows including LLM operations, RAG pipelines, agents, and multi-agent patterns.

---

## Phase 2 Objectives (2 Weeks)

### Week 1: Core AI Node Types (LLM + RAG)

**Goal**: Implement fundamental LLM and RAG node types

**Tasks**:

1. **Create Node Base Classes** (`src/features/workflow/nodes/base/`)
   ```typescript
   // BaseNode.ts - Abstract base for all nodes
   export abstract class BaseNode {
     abstract nodeType: string;
     abstract execute(inputs: any): Promise<any>;
     
     validate(inputs: any): ValidationResult {
       // Common validation logic
     }
     
     createPocketFlowFunction() {
       // Helper to create PocketFlow-compatible function
     }
   }
   
   // BaseAINode.ts - Base for AI nodes with common features
   export abstract class BaseAINode extends BaseNode {
     protected llmClient?: any;
     protected retryLogic(fn: () => Promise<any>): Promise<any> {
       // Retry logic for API calls
     }
   }
   ```

2. **Implement LLM Nodes** (`src/features/workflow/nodes/llm/`)
   
   a. **LLMPromptNode.ts** - Basic LLM completion
   ```typescript
   export class LLMPromptNode extends BaseAINode {
     nodeType = 'llm_prompt';
     
     async execute(inputs: {
       prompt: string;
       model?: string;
       temperature?: number;
       maxTokens?: number;
     }): Promise<{ response: string; usage: any }> {
       // Call LLM API (Anthropic, OpenAI, etc.)
       // Return completion result
     }
   }
   ```
   
   b. **LLMStructuredNode.ts** - Structured JSON output
   ```typescript
   export class LLMStructuredNode extends BaseAINode {
     nodeType = 'llm_structured';
     
     async execute(inputs: {
       prompt: string;
       schema: object; // JSON Schema
       model?: string;
     }): Promise<{ data: any; valid: boolean }> {
       // Call LLM with structured output
       // Validate against schema
       // Return parsed JSON
     }
   }
   ```
   
   c. **LLMFunctionCallNode.ts** - Function/tool calling
   ```typescript
   export class LLMFunctionCallNode extends BaseAINode {
     nodeType = 'llm_function_call';
     
     async execute(inputs: {
       prompt: string;
       functions: Array<{
         name: string;
         description: string;
         parameters: object;
       }>;
     }): Promise<{ functionName: string; arguments: any }> {
       // Call LLM with function definitions
       // Return function to call + arguments
     }
   }
   ```

3. **Implement RAG Nodes** (`src/features/workflow/nodes/rag/`)
   
   a. **RAGRerankNode.ts** - Rerank retrieved documents
   ```typescript
   export class RAGRerankNode extends BaseNode {
     nodeType = 'rag_rerank';
     
     async execute(inputs: {
       documents: Array<{ content: string; score: number }>;
       query: string;
       limit?: number;
     }): Promise<{ documents: any[]; reranked: true }> {
       // Rerank documents by relevance
       // Return top N documents
     }
   }
   ```
   
   b. **RAGAugmentNode.ts** - Format context for LLM
   ```typescript
   export class RAGAugmentNode extends BaseNode {
     nodeType = 'rag_augment';
     
     async execute(inputs: {
       documents: any[];
       query: string;
       template?: string;
     }): Promise<{ context: string; sources: string[] }> {
       // Format documents into context string
       // Add source citations
       // Return augmented prompt
     }
   }
   ```
   
   c. **RAGGenerateNode.ts** - Generate with RAG context
   ```typescript
   export class RAGGenerateNode extends BaseAINode {
     nodeType = 'rag_generate';
     
     async execute(inputs: {
       query: string;
       context: string;
       model?: string;
     }): Promise<{ response: string; sources: string[] }> {
       // Generate response using context
       // Include source citations
       // Return final answer
     }
   }
   ```

4. **Create Node Registry** (`src/features/workflow/services/NodeRegistry.ts`)
   ```typescript
   export class NodeRegistry {
     private nodes = new Map<string, typeof BaseNode>();
     
     register(nodeType: string, nodeClass: typeof BaseNode): void {
       // Register node type
     }
     
     create(nodeType: string): BaseNode {
       // Instantiate node by type
     }
     
     list(): Array<{ type: string; category: string; description: string }> {
       // List all registered nodes
     }
   }
   
   // Global registry
   export const nodeRegistry = new NodeRegistry();
   
   // Register all nodes
   nodeRegistry.register('llm_prompt', LLMPromptNode);
   nodeRegistry.register('llm_structured', LLMStructuredNode);
   // ... etc
   ```

5. **Update PocketFlowExecutor** to use Node Registry
   ```typescript
   // In PocketFlowExecutor.ts
   private createNodeFunction(node: WorkflowNode): (state: any) => Promise<any> {
     // Check if node type is registered
     if (nodeRegistry.has(node.type)) {
       const nodeInstance = nodeRegistry.create(node.type);
       return async (state: any) => {
         return await nodeInstance.execute({
           ...node.data,
           ...state
         });
       };
     }
     
     // Fall back to default behavior
     return this.defaultNodeFunction(node);
   }
   ```

6. **Create Tests** (`test/nodes/`)
   - `test/nodes/llm.test.ts` - Tests for all LLM nodes
   - `test/nodes/rag.test.ts` - Tests for all RAG nodes
   - `test/nodes/registry.test.ts` - Node registry tests
   - Target: >90% coverage, 30+ new tests

### Week 2: Agent & Multi-Agent Nodes

**Goal**: Implement agent and multi-agent coordination nodes

**Tasks**:

1. **Implement Agent Nodes** (`src/features/workflow/nodes/agent/`)
   
   a. **AgentReActNode.ts** - ReAct (Reasoning + Acting) agent
   ```typescript
   export class AgentReActNode extends BaseAINode {
     nodeType = 'agent_react';
     
     async execute(inputs: {
       task: string;
       tools: Array<{ name: string; fn: Function }>;
       maxIterations?: number;
     }): Promise<{
       result: any;
       steps: Array<{ thought: string; action: string; observation: string }>;
     }> {
       // Implement ReAct loop
       // Thought -> Action -> Observation -> Repeat
       // Return final result and trace
     }
   }
   ```
   
   b. **AgentResearchNode.ts** - Iterative research agent
   ```typescript
   export class AgentResearchNode extends BaseAINode {
     nodeType = 'agent_research';
     
     async execute(inputs: {
       question: string;
       sources: string[];
       depth?: number;
     }): Promise<{
       answer: string;
       citations: string[];
       confidence: number;
     }> {
       // Multi-step research
       // Query sources, synthesize, iterate
       // Return comprehensive answer
     }
   }
   ```
   
   c. **AgentCodeGenNode.ts** - Code generation with validation
   ```typescript
   export class AgentCodeGenNode extends BaseAINode {
     nodeType = 'agent_code_gen';
     
     async execute(inputs: {
       specification: string;
       language: string;
       tests?: string[];
     }): Promise<{
       code: string;
       testsPass: boolean;
       errors?: string[];
     }> {
       // Generate code from spec
       // Validate with tests
       // Iterate until passing
     }
   }
   ```

2. **Implement Multi-Agent Nodes** (`src/features/workflow/nodes/multi-agent/`)
   
   a. **MultiAgentDebateNode.ts** - Agent debate/discussion
   ```typescript
   export class MultiAgentDebateNode extends BaseAINode {
     nodeType = 'multi_agent_debate';
     
     async execute(inputs: {
       question: string;
       agents: Array<{ role: string; perspective: string }>;
       rounds?: number;
     }): Promise<{
       finalAnswer: string;
       debate: Array<{ agent: string; position: string }>;
     }> {
       // Multiple agents discuss
       // Each presents perspective
       // Synthesize final answer
     }
   }
   ```
   
   b. **MultiAgentVoteNode.ts** - Majority voting
   ```typescript
   export class MultiAgentVoteNode extends BaseAINode {
     nodeType = 'multi_agent_vote';
     
     async execute(inputs: {
       question: string;
       agents: Array<{ id: string; model: string }>;
     }): Promise<{
       consensus: string;
       votes: Array<{ agent: string; answer: string }>;
       confidence: number;
     }> {
       // Each agent votes
       // Count votes
       // Return majority answer
     }
   }
   ```
   
   c. **MultiAgentConsensusNode.ts** - Consensus building
   ```typescript
   export class MultiAgentConsensusNode extends BaseAINode {
     nodeType = 'multi_agent_consensus';
     
     async execute(inputs: {
       question: string;
       agents: Array<{ id: string; expertise: string }>;
       threshold?: number;
     }): Promise<{
       consensus: string;
       agreement: number;
       iterations: number;
     }> {
       // Iterative consensus building
       // Agents refine until agreement
       // Return final consensus
     }
   }
   ```

3. **Implement Utility Nodes** (`src/features/workflow/nodes/utility/`)
   
   a. **MapNode.ts** - Parallel map operation
   ```typescript
   export class MapNode extends BaseNode {
     nodeType = 'map';
     
     async execute(inputs: {
       items: any[];
       operation: string; // Node type to apply
       parallel?: boolean;
     }): Promise<{ results: any[] }> {
       // Apply operation to each item
       // Execute in parallel if requested
       // Return array of results
     }
   }
   ```
   
   b. **ReduceNode.ts** - Aggregation operation
   ```typescript
   export class ReduceNode extends BaseNode {
     nodeType = 'reduce';
     
     async execute(inputs: {
       items: any[];
       operation: 'sum' | 'avg' | 'concat' | 'custom';
       customFn?: string;
     }): Promise<{ result: any }> {
       // Aggregate items
       // Return single result
     }
   }
   ```
   
   c. **ConditionalNode.ts** - Conditional branching
   ```typescript
   export class ConditionalNode extends BaseNode {
     nodeType = 'conditional';
     
     async execute(inputs: {
       condition: string;
       trueOutput: any;
       falseOutput: any;
     }): Promise<any> {
       // Evaluate condition
       // Return appropriate output
     }
   }
   ```

4. **Create Integration Tests** (`test/integration/`)
   - `test/integration/rag-pipeline.test.ts` - Complete RAG workflow
   - `test/integration/agent-research.test.ts` - Research agent workflow
   - `test/integration/multi-agent.test.ts` - Multi-agent coordination
   - Target: 15+ integration tests

5. **Create Node Documentation** (`docs/nodes/`)
   - `docs/nodes/README.md` - Node library overview
   - `docs/nodes/llm-nodes.md` - LLM node documentation
   - `docs/nodes/rag-nodes.md` - RAG node documentation
   - `docs/nodes/agent-nodes.md` - Agent node documentation
   - `docs/nodes/multi-agent-nodes.md` - Multi-agent documentation
   - Include usage examples for each node

6. **Create Working Examples** (`examples/phase2-examples.ts`)
   - Complete RAG pipeline example
   - Research agent example
   - Multi-agent debate example
   - Code generation example
   - Map-reduce example

---

## Technical Requirements

### Repository Structure
```
src/
├── lib/
│   └── pocketflow.ts              # Existing core engine
├── types/
│   └── pocketflow.ts              # Existing types
│   └── nodes.ts                   # NEW: Node type definitions
├── features/
│   └── workflow/
│       ├── services/
│       │   ├── PocketFlowExecutor.ts  # UPDATE: Use node registry
│       │   └── NodeRegistry.ts        # NEW: Node registration
│       └── nodes/
│           ├── base/
│           │   ├── BaseNode.ts        # NEW: Abstract base
│           │   └── BaseAINode.ts      # NEW: AI node base
│           ├── llm/
│           │   ├── LLMPromptNode.ts        # NEW
│           │   ├── LLMStructuredNode.ts    # NEW
│           │   └── LLMFunctionCallNode.ts  # NEW
│           ├── rag/
│           │   ├── RAGRetrieveNode.ts      # EXISTING (from Phase 1)
│           │   ├── RAGRerankNode.ts        # NEW
│           │   ├── RAGAugmentNode.ts       # NEW
│           │   └── RAGGenerateNode.ts      # NEW
│           ├── agent/
│           │   ├── AgentReActNode.ts       # NEW
│           │   ├── AgentResearchNode.ts    # NEW
│           │   └── AgentCodeGenNode.ts     # NEW
│           ├── multi-agent/
│           │   ├── MultiAgentDebateNode.ts    # NEW
│           │   ├── MultiAgentVoteNode.ts      # NEW
│           │   └── MultiAgentConsensusNode.ts # NEW
│           └── utility/
│               ├── MapNode.ts          # NEW
│               ├── ReduceNode.ts       # NEW
│               └── ConditionalNode.ts  # NEW

test/
├── nodes/
│   ├── llm.test.ts           # NEW: LLM node tests
│   ├── rag.test.ts           # NEW: RAG node tests (extend Phase 1)
│   ├── agent.test.ts         # NEW: Agent node tests
│   ├── multi-agent.test.ts   # NEW: Multi-agent tests
│   └── registry.test.ts      # NEW: Registry tests
└── integration/
    ├── rag-pipeline.test.ts  # NEW: RAG workflow test
    ├── agent-research.test.ts # NEW: Agent workflow test
    └── multi-agent.test.ts    # NEW: Multi-agent workflow test

docs/
└── nodes/
    ├── README.md              # NEW: Overview
    ├── llm-nodes.md          # NEW: LLM documentation
    ├── rag-nodes.md          # NEW: RAG documentation
    ├── agent-nodes.md        # NEW: Agent documentation
    └── multi-agent-nodes.md  # NEW: Multi-agent documentation

examples/
├── pocketflow-demo.ts        # EXISTING (from Phase 1)
└── phase2-examples.ts        # NEW: Phase 2 examples
```

### Build & Test Commands
```bash
# Build
yarn build:server

# Test
yarn test                          # All tests
yarn test test/nodes               # Node tests only
yarn test test/integration         # Integration tests only

# Development
yarn dev                           # Start dev server
```

### Success Criteria

**Week 1 (LLM + RAG Nodes)**:
- [ ] Base classes created (BaseNode, BaseAINode)
- [ ] 3 LLM node types implemented
- [ ] 3 RAG node types implemented (+ existing RAG Retrieve)
- [ ] Node registry system operational
- [ ] PocketFlowExecutor updated to use registry
- [ ] 30+ tests passing (node-specific tests)
- [ ] Documentation for LLM and RAG nodes

**Week 2 (Agent + Multi-Agent Nodes)**:
- [ ] 3 agent node types implemented
- [ ] 3 multi-agent node types implemented
- [ ] 3 utility node types implemented
- [ ] 15+ integration tests passing
- [ ] Complete node documentation
- [ ] Working examples for all node types
- [ ] No regressions (all Phase 1 tests still pass)

**Overall Phase 2**:
- [ ] 15+ node types operational
- [ ] Node registry with dynamic loading
- [ ] 75+ total tests passing (45 from Phase 1 + 30+ new)
- [ ] Complete documentation for all nodes
- [ ] Working examples demonstrating all capabilities
- [ ] Ready for Phase 3 (Templates)

---

## Implementation Guidelines

### Code Quality Standards
- **TypeScript**: Strict mode enabled, minimal `any` usage
- **Testing**: >90% coverage for all new nodes
- **Documentation**: JSDoc for all public APIs
- **Error Handling**: Comprehensive error messages
- **Performance**: Node execution < 100ms overhead (excluding LLM calls)

### Integration Points

1. **Anthropic SDK** (for LLM nodes)
   - Already available: `@anthropic-ai/sdk` in dependencies
   - Use existing patterns from codebase

2. **RAG API** (for RAG nodes)
   - Endpoint: `/api/v1/rag/:containerId/search`
   - Already used in Phase 1 RAGRetrieveNode

3. **Node Registry** (new)
   - Singleton pattern for global registry
   - Support for dynamic node registration
   - Type-safe node creation

### Validation Steps

1. **After Week 1 (LLM + RAG Nodes)**:
   ```bash
   yarn test test/nodes/llm.test.ts
   yarn test test/nodes/rag.test.ts
   yarn test test/nodes/registry.test.ts
   # Should show 30+ tests passing
   ```

2. **After Week 2 (Agent + Multi-Agent Nodes)**:
   ```bash
   yarn build
   yarn test
   # All tests should pass (75+ total)
   
   # Manual validation:
   # 1. Start dev server: yarn dev
   # 2. Create workflow with new node types
   # 3. Execute and verify results
   ```

---

## Example Node Implementation Pattern

### Complete Node Example (Template)

```typescript
/**
 * ExampleNode - Brief description
 * 
 * Detailed description of what this node does.
 * 
 * @example
 * ```typescript
 * const node = new ExampleNode();
 * const result = await node.execute({
 *   input1: 'value1',
 *   input2: 42
 * });
 * ```
 */

import { BaseAINode } from '../base/BaseAINode.js';

export interface ExampleNodeInput {
  /** Description of input parameter */
  input1: string;
  /** Description of input parameter */
  input2?: number;
}

export interface ExampleNodeOutput {
  /** Description of output */
  result: string;
  /** Additional metadata */
  metadata?: any;
}

export class ExampleNode extends BaseAINode {
  nodeType = 'example_node';
  
  /**
   * Execute the node with given inputs
   * 
   * @param inputs - Input parameters
   * @returns Result of execution
   * @throws Error if validation fails
   */
  async execute(inputs: ExampleNodeInput): Promise<ExampleNodeOutput> {
    // 1. Validate inputs
    this.validateInputs(inputs);
    
    // 2. Execute logic
    try {
      const result = await this.performOperation(inputs);
      
      // 3. Return formatted output
      return {
        result,
        metadata: {
          timestamp: Date.now(),
          nodeType: this.nodeType
        }
      };
    } catch (error) {
      throw new Error(`ExampleNode execution failed: ${error.message}`);
    }
  }
  
  /**
   * Validate input parameters
   * @private
   */
  private validateInputs(inputs: ExampleNodeInput): void {
    if (!inputs.input1) {
      throw new Error('input1 is required');
    }
    if (inputs.input2 !== undefined && inputs.input2 < 0) {
      throw new Error('input2 must be non-negative');
    }
  }
  
  /**
   * Perform the core operation
   * @private
   */
  private async performOperation(inputs: ExampleNodeInput): Promise<string> {
    // Implementation here
    return 'result';
  }
}

export default ExampleNode;
```

### Test Template

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ExampleNode } from '../src/features/workflow/nodes/example/ExampleNode.js';

describe('ExampleNode', () => {
  let node: ExampleNode;
  
  beforeEach(() => {
    node = new ExampleNode();
  });
  
  describe('Input Validation', () => {
    it('should require input1', async () => {
      await expect(
        node.execute({ input1: '' })
      ).rejects.toThrow('input1 is required');
    });
    
    it('should validate input2 range', async () => {
      await expect(
        node.execute({ input1: 'test', input2: -1 })
      ).rejects.toThrow('input2 must be non-negative');
    });
  });
  
  describe('Execution', () => {
    it('should execute successfully with valid inputs', async () => {
      const result = await node.execute({
        input1: 'test',
        input2: 42
      });
      
      expect(result.result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });
});
```

---

## Debugging & Troubleshooting

### Common Issues

1. **Node Registry Not Finding Node**
   - Symptom: "Node type not found" error
   - Solution: Ensure node is registered in NodeRegistry initialization

2. **Async Execution Errors**
   - Symptom: Promise rejections
   - Solution: Wrap async calls in try-catch, use retry logic

3. **LLM API Integration**
   - Symptom: API calls fail
   - Solution: Check API keys, rate limits, model availability

4. **Type Errors**
   - Symptom: TypeScript compilation errors
   - Solution: Ensure all interfaces properly exported and imported

---

## Next Phase Preview (Phase 3)

After Phase 2 completion, Phase 3 will implement:
- **Template System**: 8+ pre-built workflow templates
- **Template Marketplace**: UI for browsing and importing templates
- **Import/Export**: PocketFlow JSON format support
- **Template Versioning**: Version tracking and updates

---

## Resources

**Documentation**:
- Phase 1 Results: `docs/POCKETFLOW_PHASE1_RESULTS.md`
- Full Proposal: `docs/DISCO_POCKETFLOW_INTEGRATION_REVIEW.md`
- PocketFlow Repository: https://github.com/PocketFlow-AI/PocketFlow
- Anthropic SDK Docs: https://docs.anthropic.com/

**Code References**:
- Phase 1 Core: `src/lib/pocketflow.ts`
- Phase 1 RAG Node: `src/features/workflow/nodes/RAGRetrieveNode.ts`
- Workflow Executor: `src/features/workflow/services/PocketFlowExecutor.ts`
- RAG API: `src/api/rag.ts`

**Testing**:
- Phase 1 Tests: `test/pocketflow.test.ts`, `test/pocketflow-integration.test.ts`
- Test Setup: `test/setup.ts`

---

## Summary

**Goal**: Expand node library with 15+ AI-specific node types

**Deliverables**:
1. Base node classes (BaseNode, BaseAINode)
2. 3 LLM node types (Prompt, Structured, Function Call)
3. 4 RAG node types (Retrieve, Rerank, Augment, Generate)
4. 3 Agent node types (ReAct, Research, Code Gen)
5. 3 Multi-agent node types (Debate, Vote, Consensus)
6. 3 Utility node types (Map, Reduce, Conditional)
7. Node registry system
8. 45+ new tests (30 node tests + 15 integration tests)
9. Complete documentation for all nodes
10. Working examples demonstrating all capabilities

**Success Metric**: 15+ node types operational, 75+ total tests passing, ready for template system

**Approval**: Ready to start Phase 2 implementation

**Timeline**: 2 weeks (1 week LLM/RAG, 1 week Agent/Multi-Agent)

---

*This prompt contains all details needed to commence Phase 2 implementation. Refer to Phase 1 results and proposal documents for additional context.*
