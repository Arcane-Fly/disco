/**
 * PocketFlow Core Engine Tests
 * 
 * Comprehensive test suite for the PocketFlow graph execution engine.
 * Tests cover node management, edge creation, topological sorting,
 * execution, error handling, and cycle detection.
 * 
 * Target: >90% code coverage, 20+ test cases
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { PocketFlow } from '../src/lib/pocketflow.js';
import type { PocketFlowExecutionResult } from '../src/types/pocketflow.js';

describe('PocketFlow Core Engine', () => {
  let flow: PocketFlow;

  beforeEach(() => {
    flow = new PocketFlow();
  });

  describe('Node Management', () => {
    it('should add a node successfully', () => {
      flow.addNode('test', (state) => 'result');
      expect(flow.hasNode('test')).toBe(true);
      expect(flow.getNodeCount()).toBe(1);
    });

    it('should throw error when adding duplicate node', () => {
      flow.addNode('test', (state) => 'result');
      expect(() => {
        flow.addNode('test', (state) => 'another');
      }).toThrow('Node "test" already exists');
    });

    it('should add multiple nodes', () => {
      flow.addNode('node1', (state) => 'result1');
      flow.addNode('node2', (state) => 'result2');
      flow.addNode('node3', (state) => 'result3');
      
      expect(flow.getNodeCount()).toBe(3);
      expect(flow.hasNode('node1')).toBe(true);
      expect(flow.hasNode('node2')).toBe(true);
      expect(flow.hasNode('node3')).toBe(true);
    });

    it('should get all node names', () => {
      flow.addNode('alpha', (state) => 'a');
      flow.addNode('beta', (state) => 'b');
      flow.addNode('gamma', (state) => 'c');
      
      const names = flow.getNodeNames();
      expect(names).toHaveLength(3);
      expect(names).toContain('alpha');
      expect(names).toContain('beta');
      expect(names).toContain('gamma');
    });

    it('should clear all nodes and edges', () => {
      flow.addNode('node1', (state) => 'result');
      flow.addNode('node2', (state) => 'result');
      flow.addEdge('node1', 'node2');
      
      flow.clear();
      
      expect(flow.getNodeCount()).toBe(0);
      expect(flow.getEdgeCount()).toBe(0);
    });
  });

  describe('Edge Management', () => {
    it('should add an edge successfully', () => {
      flow.addNode('source', (state) => 'src');
      flow.addNode('target', (state) => 'tgt');
      flow.addEdge('source', 'target');
      
      expect(flow.getEdgeCount()).toBe(1);
    });

    it('should add multiple edges', () => {
      flow.addNode('a', (state) => 'A');
      flow.addNode('b', (state) => 'B');
      flow.addNode('c', (state) => 'C');
      
      flow.addEdge('a', 'b');
      flow.addEdge('b', 'c');
      flow.addEdge('a', 'c');
      
      expect(flow.getEdgeCount()).toBe(3);
    });

    it('should handle nodes without edges', () => {
      flow.addNode('standalone', (state) => 'alone');
      
      const result = flow.execute({});
      expect(result).resolves.toMatchObject({
        success: true,
        nodesExecuted: ['standalone'],
      });
    });
  });

  describe('Execution - Simple Workflows', () => {
    it('should execute a single node', async () => {
      flow.addNode('single', (state) => ({ value: 42 }));
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(true);
      expect(result.outputs.single).toEqual({ value: 42 });
      expect(result.nodesExecuted).toEqual(['single']);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should execute a linear workflow', async () => {
      flow.addNode('input', (state) => ({ query: 'hello' }));
      flow.addNode('process', (state) => ({ result: state.input.query.toUpperCase() }));
      flow.addNode('output', (state) => state.process.result);
      
      flow.addEdge('input', 'process');
      flow.addEdge('process', 'output');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(true);
      expect(result.outputs.output).toBe('HELLO');
      expect(result.nodesExecuted).toEqual(['input', 'process', 'output']);
    });

    it('should pass state between nodes correctly', async () => {
      flow.addNode('step1', (state) => ({ count: 1 }));
      flow.addNode('step2', (state) => ({ count: state.step1.count + 1 }));
      flow.addNode('step3', (state) => ({ count: state.step2.count + 1 }));
      
      flow.addEdge('step1', 'step2');
      flow.addEdge('step2', 'step3');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(true);
      expect(result.outputs.step3.count).toBe(3);
    });

    it('should merge initial inputs with node outputs', async () => {
      flow.addNode('process', (state) => ({ processed: state.initial * 2 }));
      
      const result = await flow.execute({ initial: 10 });
      
      expect(result.success).toBe(true);
      expect(result.outputs.initial).toBe(10);
      expect(result.outputs.process.processed).toBe(20);
    });

    it('should handle branching workflows', async () => {
      // Diamond pattern: input -> [a, b] -> output
      flow.addNode('input', (state) => ({ value: 5 }));
      flow.addNode('double', (state) => ({ result: state.input.value * 2 }));
      flow.addNode('triple', (state) => ({ result: state.input.value * 3 }));
      flow.addNode('sum', (state) => ({
        total: state.double.result + state.triple.result
      }));
      
      flow.addEdge('input', 'double');
      flow.addEdge('input', 'triple');
      flow.addEdge('double', 'sum');
      flow.addEdge('triple', 'sum');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(true);
      expect(result.outputs.sum.total).toBe(25); // (5*2) + (5*3) = 25
    });
  });

  describe('Execution - Async Support', () => {
    it('should execute async node functions', async () => {
      flow.addNode('asyncNode', async (state) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ data: 'async result' }), 10);
        });
      });
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(true);
      expect(result.outputs.asyncNode.data).toBe('async result');
    });

    it('should execute mixed sync and async nodes', async () => {
      flow.addNode('sync1', (state) => ({ value: 1 }));
      flow.addNode('async1', async (state) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { value: state.sync1.value + 1 };
      });
      flow.addNode('sync2', (state) => ({ value: state.async1.value + 1 }));
      
      flow.addEdge('sync1', 'async1');
      flow.addEdge('async1', 'sync2');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(true);
      expect(result.outputs.sync2.value).toBe(3);
    });

    it('should handle multiple parallel async operations', async () => {
      flow.addNode('start', (state) => ({ value: 0 }));
      flow.addNode('async1', async (state) => {
        await new Promise(resolve => setTimeout(resolve, 20));
        return { result: 'first' };
      });
      flow.addNode('async2', async (state) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { result: 'second' };
      });
      flow.addNode('combine', (state) => ({
        combined: `${state.async1.result}-${state.async2.result}`
      }));
      
      flow.addEdge('start', 'async1');
      flow.addEdge('start', 'async2');
      flow.addEdge('async1', 'combine');
      flow.addEdge('async2', 'combine');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(true);
      expect(result.outputs.combine.combined).toBe('first-second');
    });
  });

  describe('Error Handling', () => {
    it('should detect cycles in the graph', async () => {
      flow.addNode('a', (state) => 'A');
      flow.addNode('b', (state) => 'B');
      flow.addNode('c', (state) => 'C');
      
      flow.addEdge('a', 'b');
      flow.addEdge('b', 'c');
      flow.addEdge('c', 'a'); // Creates cycle
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('cycle');
    });

    it('should detect self-referencing cycles', async () => {
      flow.addNode('self', (state) => 'value');
      flow.addEdge('self', 'self');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('cycle');
    });

    it('should handle node execution errors with stopOnError=true', async () => {
      flow.addNode('good', (state) => ({ value: 1 }));
      flow.addNode('bad', (state) => {
        throw new Error('Node failed');
      });
      flow.addNode('after', (state) => ({ value: 2 }));
      
      flow.addEdge('good', 'bad');
      flow.addEdge('bad', 'after');
      
      const result = await flow.execute({}, { stopOnError: true });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Node "bad" execution failed');
    });

    it('should continue execution with stopOnError=false', async () => {
      flow.addNode('good1', (state) => ({ value: 1 }));
      flow.addNode('bad', (state) => {
        throw new Error('Node failed');
      });
      flow.addNode('good2', (state) => ({ value: 2 }));
      
      flow.addEdge('good1', 'bad');
      flow.addEdge('bad', 'good2');
      
      const result = await flow.execute({}, { stopOnError: false });
      
      expect(result.success).toBe(true);
      expect(result.outputs.bad).toHaveProperty('error');
      expect(result.outputs.good2.value).toBe(2);
    });

    it('should validate edge references exist', async () => {
      flow.addNode('exists', (state) => 'value');
      flow.addEdge('exists', 'doesNotExist');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('non-existent target node');
    });

    it('should validate source nodes exist', async () => {
      flow.addNode('exists', (state) => 'value');
      flow.addEdge('doesNotExist', 'exists');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('non-existent source node');
    });
  });

  describe('Progress Tracking', () => {
    it('should call progress callback for each node', async () => {
      const progressCalls: Array<{ node: string; result: any }> = [];
      
      flow.addNode('step1', (state) => ({ value: 1 }));
      flow.addNode('step2', (state) => ({ value: 2 }));
      flow.addNode('step3', (state) => ({ value: 3 }));
      
      flow.addEdge('step1', 'step2');
      flow.addEdge('step2', 'step3');
      
      await flow.execute({}, {
        onProgress: (nodeName, result) => {
          progressCalls.push({ node: nodeName, result });
        }
      });
      
      expect(progressCalls).toHaveLength(3);
      expect(progressCalls[0].node).toBe('step1');
      expect(progressCalls[1].node).toBe('step2');
      expect(progressCalls[2].node).toBe('step3');
    });
  });

  describe('Performance & Timing', () => {
    it('should track execution time', async () => {
      flow.addNode('fast', (state) => 'result');
      
      const result = await flow.execute({});
      
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.executionTime).toBe('number');
    });

    it('should complete simple workflow quickly', async () => {
      flow.addNode('node1', (state) => ({ v: 1 }));
      flow.addNode('node2', (state) => ({ v: 2 }));
      flow.addNode('node3', (state) => ({ v: 3 }));
      
      flow.addEdge('node1', 'node2');
      flow.addEdge('node2', 'node3');
      
      const result = await flow.execute({});
      
      // Simple workflows should complete in under 100ms
      expect(result.executionTime).toBeLessThan(100);
    });
  });

  describe('Complex Workflows', () => {
    it('should handle complex DAG with multiple branches', async () => {
      // Create a complex workflow:
      //     input
      //    /  |  \
      //   a   b   c
      //    \ / \ /
      //     d   e
      //      \ /
      //       f
      
      flow.addNode('input', (state) => ({ value: 10 }));
      flow.addNode('a', (state) => ({ result: state.input.value + 1 }));
      flow.addNode('b', (state) => ({ result: state.input.value + 2 }));
      flow.addNode('c', (state) => ({ result: state.input.value + 3 }));
      flow.addNode('d', (state) => ({ result: state.a.result + state.b.result }));
      flow.addNode('e', (state) => ({ result: state.b.result + state.c.result }));
      flow.addNode('f', (state) => ({ result: state.d.result + state.e.result }));
      
      flow.addEdge('input', 'a');
      flow.addEdge('input', 'b');
      flow.addEdge('input', 'c');
      flow.addEdge('a', 'd');
      flow.addEdge('b', 'd');
      flow.addEdge('b', 'e');
      flow.addEdge('c', 'e');
      flow.addEdge('d', 'f');
      flow.addEdge('e', 'f');
      
      const result = await flow.execute({});
      
      expect(result.success).toBe(true);
      expect(result.outputs.f.result).toBe(48); // (11+12) + (12+13) = 23+25 = 48
      expect(result.nodesExecuted).toHaveLength(7);
    });

    it('should execute nodes in correct topological order', async () => {
      const executionOrder: string[] = [];
      
      flow.addNode('a', (state) => { executionOrder.push('a'); return 'A'; });
      flow.addNode('b', (state) => { executionOrder.push('b'); return 'B'; });
      flow.addNode('c', (state) => { executionOrder.push('c'); return 'C'; });
      flow.addNode('d', (state) => { executionOrder.push('d'); return 'D'; });
      
      // Dependencies: d->c, c->b, b->a
      // Execution order should be: a, b, c, d
      flow.addEdge('a', 'b');
      flow.addEdge('b', 'c');
      flow.addEdge('c', 'd');
      
      await flow.execute({});
      
      expect(executionOrder).toEqual(['a', 'b', 'c', 'd']);
    });
  });
});
