/**
 * Comprehensive tests for PocketFlow Phase 2 nodes
 * Tests all 15+ node types implemented in Phase 2
 */

// Import base classes
import { BaseNode } from '../src/features/workflow/nodes/base/BaseNode';
import { BaseAINode } from '../src/features/workflow/nodes/base/BaseAINode';

// Import LLM nodes
import { LLMPromptNode } from '../src/features/workflow/nodes/llm/LLMPromptNode';
import { LLMStructuredNode } from '../src/features/workflow/nodes/llm/LLMStructuredNode';
import { LLMFunctionCallNode } from '../src/features/workflow/nodes/llm/LLMFunctionCallNode';

// Import RAG nodes
import { RAGRerankNode } from '../src/features/workflow/nodes/rag/RAGRerankNode';
import { RAGAugmentNode } from '../src/features/workflow/nodes/rag/RAGAugmentNode';
import { RAGGenerateNode } from '../src/features/workflow/nodes/rag/RAGGenerateNode';

// Import Agent nodes
import { AgentReActNode } from '../src/features/workflow/nodes/agent/AgentReActNode';
import { AgentResearchNode } from '../src/features/workflow/nodes/agent/AgentResearchNode';
import { AgentCodeGenNode } from '../src/features/workflow/nodes/agent/AgentCodeGenNode';

// Import Multi-Agent nodes
import { MultiAgentDebateNode } from '../src/features/workflow/nodes/multi-agent/MultiAgentDebateNode';
import { MultiAgentVoteNode } from '../src/features/workflow/nodes/multi-agent/MultiAgentVoteNode';
import { MultiAgentConsensusNode } from '../src/features/workflow/nodes/multi-agent/MultiAgentConsensusNode';

// Import Utility nodes
import { MapNode } from '../src/features/workflow/nodes/utility/MapNode';
import { ReduceNode } from '../src/features/workflow/nodes/utility/ReduceNode';
import { ConditionalNode } from '../src/features/workflow/nodes/utility/ConditionalNode';

// Import NodeRegistry
import { NodeRegistry, nodeRegistry } from '../src/features/workflow/services/NodeRegistry';

describe('PocketFlow Phase 2: Node Library', () => {
  
  describe('LLM Nodes', () => {
    describe('LLMPromptNode', () => {
      let node: LLMPromptNode;
      
      beforeEach(() => {
        node = new LLMPromptNode();
      });
      
      test('should have correct metadata', () => {
        expect(node.nodeType).toBe('llm_prompt');
        expect(node.category).toBe('LLM');
      });
      
      test('should validate required prompt', () => {
        const validation = node.validate({});
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('prompt is required and must be a string');
      });
      
      test('should execute with valid prompt', async () => {
        const result = await node.execute({
          prompt: 'Test prompt',
          temperature: 0.7,
        });
        expect(result.response).toBeDefined();
        expect(result.model).toBeDefined();
        expect(result.usage).toBeDefined();
      });
    });
    
    describe('LLMStructuredNode', () => {
      let node: LLMStructuredNode;
      
      beforeEach(() => {
        node = new LLMStructuredNode();
      });
      
      test('should validate schema requirement', () => {
        const validation = node.validate({ prompt: 'test' });
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('schema is required and must be an object');
      });
      
      test('should execute with schema', async () => {
        const result = await node.execute({
          prompt: 'Extract data',
          schema: { type: 'object' },
        });
        expect(result.data).toBeDefined();
        expect(result.valid).toBeDefined();
      });
    });
    
    describe('LLMFunctionCallNode', () => {
      let node: LLMFunctionCallNode;
      
      beforeEach(() => {
        node = new LLMFunctionCallNode();
      });
      
      test('should validate functions array', () => {
        const validation = node.validate({ prompt: 'test' });
        expect(validation.valid).toBe(false);
      });
      
      test('should execute with functions', async () => {
        const result = await node.execute({
          prompt: 'Call a function',
          functions: [{
            name: 'test_function',
            description: 'Test function',
            parameters: { type: 'object' },
          }],
        });
        expect(result.functionName).toBeDefined();
        expect(result.arguments).toBeDefined();
      });
    });
  });
  
  describe('RAG Nodes', () => {
    describe('RAGRerankNode', () => {
      let node: RAGRerankNode;
      
      beforeEach(() => {
        node = new RAGRerankNode();
      });
      
      test('should rerank documents by score', async () => {
        const result = await node.execute({
          documents: [
            { content: 'Doc 1', score: 0.3 },
            { content: 'Doc 2', score: 0.9 },
            { content: 'Doc 3', score: 0.6 },
          ],
          query: 'test query',
          strategy: 'score',
        });
        expect(result.documents[0].score).toBeGreaterThanOrEqual(result.documents[1].score);
        expect(result.reranked).toBe(true);
      });
      
      test('should limit results', async () => {
        const result = await node.execute({
          documents: [
            { content: 'Doc 1', score: 0.3 },
            { content: 'Doc 2', score: 0.9 },
            { content: 'Doc 3', score: 0.6 },
          ],
          query: 'test',
          limit: 2,
        });
        expect(result.documents.length).toBe(2);
      });
    });
    
    describe('RAGAugmentNode', () => {
      let node: RAGAugmentNode;
      
      beforeEach(() => {
        node = new RAGAugmentNode();
      });
      
      test('should format documents into context', async () => {
        const result = await node.execute({
          documents: [
            { content: 'Content 1', score: 0.8, path: 'file1.ts' },
            { content: 'Content 2', score: 0.7, path: 'file2.ts' },
          ],
          query: 'test query',
        });
        expect(result.context).toContain('Content 1');
        expect(result.context).toContain('Content 2');
        expect(result.sources.length).toBe(2);
      });
    });
    
    describe('RAGGenerateNode', () => {
      let node: RAGGenerateNode;
      
      beforeEach(() => {
        node = new RAGGenerateNode();
      });
      
      test('should generate with context', async () => {
        const result = await node.execute({
          query: 'How to use feature?',
          context: 'Feature documentation...',
        });
        expect(result.response).toBeDefined();
        expect(result.model).toBeDefined();
      });
    });
  });
  
  describe('Agent Nodes', () => {
    describe('AgentReActNode', () => {
      let node: AgentReActNode;
      
      beforeEach(() => {
        node = new AgentReActNode();
      });
      
      test('should execute ReAct steps', async () => {
        const result = await node.execute({
          task: 'Research something',
          maxSteps: 3,
        });
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.steps.length).toBeLessThanOrEqual(3);
        expect(result.completed).toBe(true);
      });
    });
    
    describe('AgentResearchNode', () => {
      let node: AgentResearchNode;
      
      beforeEach(() => {
        node = new AgentResearchNode();
      });
      
      test('should perform research with citations', async () => {
        const result = await node.execute({
          question: 'What is X?',
          sources: ['docs', 'web'],
          depth: 2,
        });
        expect(result.answer).toBeDefined();
        expect(result.citations.length).toBeGreaterThan(0);
        expect(result.confidence).toBeGreaterThan(0);
      });
    });
    
    describe('AgentCodeGenNode', () => {
      let node: AgentCodeGenNode;
      
      beforeEach(() => {
        node = new AgentCodeGenNode();
      });
      
      test('should generate code', async () => {
        const result = await node.execute({
          specification: 'Create a sort function',
          language: 'typescript',
        });
        expect(result.code).toBeDefined();
        expect(result.testsPass).toBeDefined();
        expect(result.attempts).toBeGreaterThan(0);
      });
    });
  });
  
  describe('Multi-Agent Nodes', () => {
    describe('MultiAgentDebateNode', () => {
      let node: MultiAgentDebateNode;
      
      beforeEach(() => {
        node = new MultiAgentDebateNode();
      });
      
      test('should conduct debate rounds', async () => {
        const result = await node.execute({
          question: 'What is best?',
          agents: [
            { id: 'agent1' },
            { id: 'agent2' },
          ],
          rounds: 2,
        });
        expect(result.debates.length).toBe(2);
        expect(result.consensus).toBeDefined();
      });
      
      test('should require at least 2 agents', () => {
        const validation = node.validate({
          question: 'test',
          agents: [{ id: 'agent1' }],
        });
        expect(validation.valid).toBe(false);
      });
    });
    
    describe('MultiAgentVoteNode', () => {
      let node: MultiAgentVoteNode;
      
      beforeEach(() => {
        node = new MultiAgentVoteNode();
      });
      
      test('should collect votes and determine consensus', async () => {
        const result = await node.execute({
          question: 'Is this correct?',
          agents: [
            { id: 'agent1' },
            { id: 'agent2' },
            { id: 'agent3' },
          ],
        });
        expect(result.votes.length).toBe(3);
        expect(result.consensus).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
      });
    });
    
    describe('MultiAgentConsensusNode', () => {
      let node: MultiAgentConsensusNode;
      
      beforeEach(() => {
        node = new MultiAgentConsensusNode();
      });
      
      test('should build consensus iteratively', async () => {
        const result = await node.execute({
          question: 'Design solution',
          agents: [
            { id: 'agent1', expertise: 'security' },
            { id: 'agent2', expertise: 'ux' },
          ],
          threshold: 0.7,
        });
        expect(result.consensus).toBeDefined();
        expect(result.reached).toBeDefined();
        expect(result.contributions.length).toBeGreaterThan(0);
      });
    });
  });
  
  describe('Utility Nodes', () => {
    describe('MapNode', () => {
      let node: MapNode;
      
      beforeEach(() => {
        node = new MapNode();
      });
      
      test('should map over items', async () => {
        const result = await node.execute({
          items: [1, 2, 3],
          operation: 'double',
          operationFn: (x: number) => x * 2,
        });
        expect(result.results).toEqual([2, 4, 6]);
        expect(result.processedCount).toBe(3);
      });
      
      test('should handle errors gracefully', async () => {
        const result = await node.execute({
          items: [1, 2, 3],
          operation: 'fail',
          operationFn: (x: number) => {
            if (x === 2) throw new Error('Test error');
            return x;
          },
        });
        expect(result.errors).toBeDefined();
        expect(result.errors!.length).toBe(1);
      });
    });
    
    describe('ReduceNode', () => {
      let node: ReduceNode;
      
      beforeEach(() => {
        node = new ReduceNode();
      });
      
      test('should sum numbers', async () => {
        const result = await node.execute({
          items: [1, 2, 3, 4, 5],
          operation: 'sum',
        });
        expect(result.result).toBe(15);
      });
      
      test('should calculate product', async () => {
        const result = await node.execute({
          items: [2, 3, 4],
          operation: 'product',
        });
        expect(result.result).toBe(24);
      });
      
      test('should concat arrays', async () => {
        const result = await node.execute({
          items: [[1, 2], [3, 4], [5]],
          operation: 'concat',
        });
        expect(result.result).toEqual([1, 2, 3, 4, 5]);
      });
      
      test('should merge objects', async () => {
        const result = await node.execute({
          items: [{ a: 1 }, { b: 2 }, { c: 3 }],
          operation: 'merge',
        });
        expect(result.result).toEqual({ a: 1, b: 2, c: 3 });
      });
    });
    
    describe('ConditionalNode', () => {
      let node: ConditionalNode;
      
      beforeEach(() => {
        node = new ConditionalNode();
      });
      
      test('should return ifTrue when condition is true', async () => {
        const result = await node.execute({
          condition: true,
          ifTrue: 'yes',
          ifFalse: 'no',
        });
        expect(result.value).toBe('yes');
        expect(result.branch).toBe('true');
      });
      
      test('should return ifFalse when condition is false', async () => {
        const result = await node.execute({
          condition: false,
          ifTrue: 'yes',
          ifFalse: 'no',
        });
        expect(result.value).toBe('no');
        expect(result.branch).toBe('false');
      });
      
      test('should evaluate function condition', async () => {
        const result = await node.execute({
          condition: (state: any) => state.score > 0.5,
          ifTrue: 'pass',
          ifFalse: 'fail',
          state: { score: 0.8 },
        });
        expect(result.value).toBe('pass');
      });
    });
  });
  
  describe('NodeRegistry', () => {
    test('should register all node types', () => {
      const count = nodeRegistry.count();
      expect(count).toBeGreaterThanOrEqual(15);
    });
    
    test('should create node instances', () => {
      const node = nodeRegistry.create('llm_prompt');
      expect(node).toBeInstanceOf(LLMPromptNode);
    });
    
    test('should check if node type exists', () => {
      expect(nodeRegistry.has('llm_prompt')).toBe(true);
      expect(nodeRegistry.has('non_existent')).toBe(false);
    });
    
    test('should list all nodes', () => {
      const nodes = nodeRegistry.list();
      expect(nodes.length).toBeGreaterThanOrEqual(15);
      expect(nodes[0]).toHaveProperty('nodeType');
      expect(nodes[0]).toHaveProperty('category');
      expect(nodes[0]).toHaveProperty('description');
    });
    
    test('should list nodes by category', () => {
      const llmNodes = nodeRegistry.listByCategory('LLM');
      expect(llmNodes.length).toBeGreaterThanOrEqual(3);
    });
    
    test('should get all categories', () => {
      const categories = nodeRegistry.getCategories();
      expect(categories).toContain('LLM');
      expect(categories).toContain('RAG');
      expect(categories).toContain('Agent');
      expect(categories).toContain('Multi-Agent');
      expect(categories).toContain('Utility');
    });
    
    test('should throw error for unregistered node', () => {
      expect(() => nodeRegistry.create('invalid_type')).toThrow('Node type "invalid_type" is not registered');
    });
    
    test('should get node metadata', () => {
      const metadata = nodeRegistry.getMetadata('llm_prompt');
      expect(metadata).toBeDefined();
      expect(metadata!.nodeType).toBe('llm_prompt');
    });
  });
});
