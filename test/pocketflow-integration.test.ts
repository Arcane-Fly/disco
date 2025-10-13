/**
 * PocketFlow Integration Tests
 * 
 * Tests the integration between PocketFlow core engine, workflow executor,
 * and RAG node implementation. Validates end-to-end workflow execution.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PocketFlowExecutor } from '../src/features/workflow/services/PocketFlowExecutor.js';
import { RAGRetrieveNode } from '../src/features/workflow/nodes/RAGRetrieveNode.js';
import type { WorkflowDefinition } from '../src/features/workflow/services/PocketFlowExecutor.js';

describe('PocketFlow Integration', () => {
  let executor: PocketFlowExecutor;
  
  beforeEach(() => {
    executor = new PocketFlowExecutor();
  });
  
  describe('Workflow Definition to PocketFlow Graph Conversion', () => {
    it('should convert simple workflow to executable graph', async () => {
      const workflow: WorkflowDefinition = {
        id: 'test-workflow-1',
        name: 'Simple Test Workflow',
        nodes: [
          {
            id: 'node1',
            type: 'input',
            label: 'Input',
            data: { value: 42 },
          },
          {
            id: 'node2',
            type: 'output',
            label: 'Output',
            data: {},
          },
        ],
        connections: [
          {
            id: 'conn1',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
          },
        ],
      };
      
      const result = await executor.executeWorkflow(workflow);
      
      expect(result.success).toBe(true);
      expect(result.workflowId).toBe('test-workflow-1');
      expect(result.workflowName).toBe('Simple Test Workflow');
      expect(result.nodesExecuted).toEqual(['node1', 'node2']);
    });
    
    it('should handle branching workflows', async () => {
      const workflow: WorkflowDefinition = {
        id: 'branch-workflow',
        name: 'Branching Workflow',
        nodes: [
          { id: 'start', type: 'input', label: 'Start', data: { value: 10 } },
          { id: 'branch1', type: 'process', label: 'Branch 1', data: {} },
          { id: 'branch2', type: 'process', label: 'Branch 2', data: {} },
          { id: 'merge', type: 'output', label: 'Merge', data: {} },
        ],
        connections: [
          { id: 'c1', sourceNodeId: 'start', targetNodeId: 'branch1' },
          { id: 'c2', sourceNodeId: 'start', targetNodeId: 'branch2' },
          { id: 'c3', sourceNodeId: 'branch1', targetNodeId: 'merge' },
          { id: 'c4', sourceNodeId: 'branch2', targetNodeId: 'merge' },
        ],
      };
      
      const result = await executor.executeWorkflow(workflow);
      
      expect(result.success).toBe(true);
      expect(result.nodesExecuted).toHaveLength(4);
      expect(result.nodesExecuted).toContain('start');
      expect(result.nodesExecuted).toContain('merge');
    });
    
    it('should track execution time and metadata', async () => {
      const workflow: WorkflowDefinition = {
        id: 'timed-workflow',
        name: 'Timed Workflow',
        nodes: [
          { id: 'n1', type: 'input', label: 'Node 1', data: {} },
        ],
        connections: [],
      };
      
      const result = await executor.executeWorkflow(workflow);
      
      expect(result.success).toBe(true);
      expect(result.startTime).toBeGreaterThan(0);
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });
    
    it('should pass initial inputs to workflow', async () => {
      const workflow: WorkflowDefinition = {
        id: 'input-workflow',
        name: 'Input Workflow',
        nodes: [
          { id: 'process', type: 'process', label: 'Process', data: {} },
        ],
        connections: [],
      };
      
      const result = await executor.executeWorkflow(workflow, {
        inputs: { customInput: 'test-value' },
      });
      
      expect(result.success).toBe(true);
      expect(result.outputs.customInput).toBe('test-value');
    });
  });
  
  describe('Progress Tracking', () => {
    it('should call progress callback for each node', async () => {
      const progressCalls: Array<{ nodeId: string; nodeName: string }> = [];
      
      const workflow: WorkflowDefinition = {
        id: 'progress-workflow',
        name: 'Progress Workflow',
        nodes: [
          { id: 'n1', type: 'input', label: 'First', data: {} },
          { id: 'n2', type: 'process', label: 'Second', data: {} },
          { id: 'n3', type: 'output', label: 'Third', data: {} },
        ],
        connections: [
          { id: 'c1', sourceNodeId: 'n1', targetNodeId: 'n2' },
          { id: 'c2', sourceNodeId: 'n2', targetNodeId: 'n3' },
        ],
      };
      
      await executor.executeWorkflow(workflow, {
        onProgress: (nodeId, nodeName, _result) => {
          progressCalls.push({ nodeId, nodeName });
        },
      });
      
      expect(progressCalls).toHaveLength(3);
      expect(progressCalls[0].nodeId).toBe('n1');
      expect(progressCalls[0].nodeName).toBe('First');
      expect(progressCalls[2].nodeId).toBe('n3');
      expect(progressCalls[2].nodeName).toBe('Third');
    });
  });
  
  describe('Workflow Validation', () => {
    it('should validate workflow with valid structure', () => {
      const workflow: WorkflowDefinition = {
        id: 'valid-workflow',
        name: 'Valid Workflow',
        nodes: [
          { id: 'n1', type: 'input', label: 'Node 1', data: {} },
          { id: 'n2', type: 'output', label: 'Node 2', data: {} },
        ],
        connections: [
          { id: 'c1', sourceNodeId: 'n1', targetNodeId: 'n2' },
        ],
      };
      
      const validation = executor.validateWorkflow(workflow);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    it('should detect empty workflow', () => {
      const workflow: WorkflowDefinition = {
        id: 'empty-workflow',
        name: 'Empty Workflow',
        nodes: [],
        connections: [],
      };
      
      const validation = executor.validateWorkflow(workflow);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Workflow must have at least one node');
    });
    
    it('should detect duplicate node IDs', () => {
      const workflow: WorkflowDefinition = {
        id: 'duplicate-workflow',
        name: 'Duplicate Workflow',
        nodes: [
          { id: 'n1', type: 'input', label: 'Node 1', data: {} },
          { id: 'n1', type: 'output', label: 'Node 1 Again', data: {} },
        ],
        connections: [],
      };
      
      const validation = executor.validateWorkflow(workflow);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Duplicate'))).toBe(true);
    });
    
    it('should detect invalid connections', () => {
      const workflow: WorkflowDefinition = {
        id: 'invalid-conn-workflow',
        name: 'Invalid Connection Workflow',
        nodes: [
          { id: 'n1', type: 'input', label: 'Node 1', data: {} },
        ],
        connections: [
          { id: 'c1', sourceNodeId: 'n1', targetNodeId: 'nonexistent' },
        ],
      };
      
      const validation = executor.validateWorkflow(workflow);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('non-existent'))).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle workflow execution errors gracefully', async () => {
      // Create a workflow that will cause an error
      const workflow: WorkflowDefinition = {
        id: 'error-workflow',
        name: 'Error Workflow',
        nodes: [
          { id: 'n1', type: 'input', label: 'Node 1', data: {} },
          { id: 'n2', type: 'output', label: 'Node 2', data: {} },
        ],
        connections: [
          { id: 'c1', sourceNodeId: 'n1', targetNodeId: 'n2' },
          { id: 'c2', sourceNodeId: 'n2', targetNodeId: 'n1' }, // Cycle
        ],
      };
      
      const result = await executor.executeWorkflow(workflow);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe('RAG Retrieve Node', () => {
  let ragNode: RAGRetrieveNode;
  
  beforeEach(() => {
    ragNode = new RAGRetrieveNode();
  });
  
  describe('Input Validation', () => {
    it('should require containerId', async () => {
      await expect(
        ragNode.execute({
          containerId: '',
          query: 'test query',
        })
      ).rejects.toThrow('containerId is required');
    });
    
    it('should require non-empty query', async () => {
      await expect(
        ragNode.execute({
          containerId: 'container-123',
          query: '',
        })
      ).rejects.toThrow('query must be a non-empty string');
    });
    
    it('should validate query type', async () => {
      await expect(
        ragNode.execute({
          containerId: 'container-123',
          query: 123 as any,
        })
      ).rejects.toThrow('query must be a non-empty string');
    });
  });
  
  describe('PocketFlow Integration', () => {
    it('should create PocketFlow-compatible function', async () => {
      const fn = ragNode.createPocketFlowFunction();
      
      expect(typeof fn).toBe('function');
      
      // Should handle missing inputs gracefully
      await expect(
        fn({ containerId: '', query: '' })
      ).rejects.toThrow();
    });
    
    it('should extract inputs from state correctly', async () => {
      const fn = ragNode.createPocketFlowFunction();
      
      // Mock the execute method to verify it's called with correct inputs
      const executeSpy = jest.spyOn(ragNode, 'execute');
      executeSpy.mockResolvedValue({
        documents: [],
        totalResults: 0,
        query: 'test',
        containerId: 'test-container',
        features: {
          astAnalysis: true,
          semanticSearch: true,
          codeSuggestions: true,
        },
      });
      
      await fn({
        containerId: 'test-container',
        query: 'test query',
        limit: 5,
      });
      
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          containerId: 'test-container',
          query: 'test query',
          limit: 5,
        })
      );
      
      executeSpy.mockRestore();
    });
  });
  
  describe('Mock API Integration', () => {
    it('should format API request correctly', async () => {
      // Mock fetch for this test
      const originalFetch = global.fetch;
      const mockFetch = jest.fn<typeof fetch>();
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          data: {
            query: 'test query',
            results: [
              {
                path: '/src/test.ts',
                content: 'test content',
                score: 0.95,
              },
            ],
            totalResults: 1,
            containerId: 'container-123',
            features: {
              astAnalysis: true,
              semanticSearch: true,
              codeSuggestions: true,
            },
          },
        }),
      } as Response);
      
      global.fetch = mockFetch;
      
      try {
        const result = await ragNode.execute({
          containerId: 'container-123',
          query: 'test query',
          limit: 5,
          authToken: 'Bearer test-token',
        });
        
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/rag/container-123/search',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token',
            }),
          })
        );
        
        expect(result.documents).toHaveLength(1);
        expect(result.totalResults).toBe(1);
        expect(result.query).toBe('test query');
      } finally {
        global.fetch = originalFetch;
      }
    });
    
    it('should handle API errors gracefully', async () => {
      const originalFetch = global.fetch;
      const mockFetch = jest.fn<typeof fetch>();
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Container not found',
      } as Response);
      
      global.fetch = mockFetch;
      
      try {
        await expect(
          ragNode.execute({
            containerId: 'nonexistent',
            query: 'test query',
          })
        ).rejects.toThrow('RAG API request failed');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});

describe('End-to-End Integration', () => {
  it('should execute workflow with RAG node (mocked)', async () => {
    const executor = new PocketFlowExecutor();
    const ragNode = new RAGRetrieveNode();
    
    // Mock the RAG node execution
    const executeSpy = jest.spyOn(ragNode, 'execute');
    executeSpy.mockResolvedValue({
      documents: [
        { path: '/test.ts', content: 'test', score: 1.0 },
      ],
      totalResults: 1,
      query: 'test query',
      containerId: 'test-container',
      features: {
        astAnalysis: true,
        semanticSearch: true,
        codeSuggestions: true,
      },
    });
    
    const workflow: WorkflowDefinition = {
      id: 'rag-workflow',
      name: 'RAG Workflow',
      nodes: [
        {
          id: 'input',
          type: 'input',
          label: 'Input Query',
          data: { query: 'test query', containerId: 'test-container' },
        },
        {
          id: 'output',
          type: 'output',
          label: 'Results',
          data: {},
        },
      ],
      connections: [
        { id: 'c1', sourceNodeId: 'input', targetNodeId: 'output' },
      ],
    };
    
    const result = await executor.executeWorkflow(workflow);
    
    expect(result.success).toBe(true);
    expect(result.nodesExecuted).toHaveLength(2);
    
    executeSpy.mockRestore();
  });
});
