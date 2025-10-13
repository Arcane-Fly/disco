/**
 * PocketFlow - Minimalistic LLM Workflow Framework
 * 
 * A lightweight, TypeScript-based graph execution engine for AI workflows.
 * Based on DAG (Directed Acyclic Graph) execution with topological sorting.
 * 
 * Key Features:
 * - 100-line core implementation
 * - Zero dependencies (beyond TypeScript)
 * - WebContainer compatible
 * - Async/await support
 * - Cycle detection
 * 
 * @example
 * ```typescript
 * const flow = new PocketFlow();
 * 
 * flow.addNode('input', (state) => ({ query: 'Hello' }));
 * flow.addNode('process', (state) => ({ result: state.query + ' World' }));
 * flow.addNode('output', (state) => state.result);
 * 
 * flow.addEdge('input', 'process');
 * flow.addEdge('process', 'output');
 * 
 * const result = await flow.execute({});
 * console.log(result); // { input: {...}, process: {...}, output: 'Hello World' }
 * ```
 */

import type {
  PocketFlowNodeFunction,
  PocketFlowExecutionResult,
  PocketFlowExecutionOptions,
} from '../types/pocketflow.js';

/**
 * PocketFlow graph execution engine
 */
export class PocketFlow {
  private nodes = new Map<string, PocketFlowNodeFunction>();
  private edges: Array<[string, string]> = [];

  /**
   * Add a node to the workflow graph
   * 
   * @param name - Unique identifier for the node
   * @param fn - Function to execute for this node (can be async)
   * 
   * @example
   * ```typescript
   * flow.addNode('fetchData', async (state) => {
   *   const data = await fetch('/api/data');
   *   return await data.json();
   * });
   * ```
   */
  addNode(name: string, fn: PocketFlowNodeFunction): void {
    if (this.nodes.has(name)) {
      throw new Error(`Node "${name}" already exists`);
    }
    this.nodes.set(name, fn);
  }

  /**
   * Add a directed edge between two nodes
   * 
   * @param from - Source node name
   * @param to - Target node name
   * 
   * @example
   * ```typescript
   * flow.addEdge('input', 'process');
   * flow.addEdge('process', 'output');
   * ```
   */
  addEdge(from: string, to: string): void {
    this.edges.push([from, to]);
  }

  /**
   * Execute the workflow graph with given inputs
   * 
   * @param inputs - Initial state/inputs for the workflow
   * @param options - Execution options (timeout, error handling, progress)
   * @returns Execution result with outputs, timing, and execution order
   * 
   * @throws Error if workflow contains cycles or invalid nodes
   * 
   * @example
   * ```typescript
   * const result = await flow.execute(
   *   { query: 'What is PocketFlow?' },
   *   { timeout: 5000, stopOnError: true }
   * );
   * console.log(result.outputs);
   * ```
   */
  async execute(
    inputs: Record<string, any>,
    options?: PocketFlowExecutionOptions
  ): Promise<PocketFlowExecutionResult> {
    const startTime = Date.now();
    const nodesExecuted: string[] = [];
    
    try {
      // Validate edges reference existing nodes
      for (const [from, to] of this.edges) {
        if (!this.nodes.has(from)) {
          throw new Error(`Edge references non-existent source node: "${from}"`);
        }
        if (!this.nodes.has(to)) {
          throw new Error(`Edge references non-existent target node: "${to}"`);
        }
      }

      // Perform topological sort to determine execution order
      const sorted = this.topologicalSort();
      
      // Initialize state with input values
      let state = { ...inputs };

      // Execute nodes in topological order
      for (const nodeName of sorted) {
        const fn = this.nodes.get(nodeName)!;
        
        try {
          // Execute node function (handles both sync and async)
          const result = await fn(state);
          state[nodeName] = result;
          nodesExecuted.push(nodeName);
          
          // Call progress callback if provided
          if (options?.onProgress) {
            options.onProgress(nodeName, result);
          }
        } catch (error) {
          if (options?.stopOnError) {
            throw new Error(
              `Node "${nodeName}" execution failed: ${error instanceof Error ? error.message : String(error)}`
            );
          }
          // Store error in state
          state[nodeName] = { error: error instanceof Error ? error.message : String(error) };
          nodesExecuted.push(nodeName);
        }
      }

      const executionTime = Date.now() - startTime;

      return {
        outputs: state,
        executionTime,
        nodesExecuted,
        success: true,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        outputs: {},
        executionTime,
        nodesExecuted,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Perform topological sort using Kahn's algorithm
   * 
   * @returns Array of node names in execution order
   * @throws Error if the graph contains cycles
   * 
   * @private
   */
  private topologicalSort(): string[] {
    // Build adjacency list and calculate in-degrees
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // Initialize all nodes with in-degree 0
    for (const nodeName of this.nodes.keys()) {
      inDegree.set(nodeName, 0);
      adjList.set(nodeName, []);
    }

    // Build adjacency list and count in-degrees
    for (const [from, to] of this.edges) {
      adjList.get(from)!.push(to);
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    }

    // Find all nodes with no incoming edges (starting nodes)
    const queue: string[] = [];
    for (const [nodeName, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeName);
      }
    }

    // Process nodes in topological order
    const result: string[] = [];
    
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      // For each neighbor, reduce in-degree
      const neighbors = adjList.get(node) || [];
      for (const neighbor of neighbors) {
        const degree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, degree);
        
        // If in-degree becomes 0, add to queue
        if (degree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check for cycles - if result doesn't contain all nodes, there's a cycle
    if (result.length !== this.nodes.size) {
      throw new Error(
        `Workflow contains cycles. Expected ${this.nodes.size} nodes, but only ${result.length} are reachable.`
      );
    }

    return result;
  }

  /**
   * Get the number of nodes in the graph
   */
  getNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Get the number of edges in the graph
   */
  getEdgeCount(): number {
    return this.edges.length;
  }

  /**
   * Check if a node exists in the graph
   */
  hasNode(name: string): boolean {
    return this.nodes.has(name);
  }

  /**
   * Get all node names
   */
  getNodeNames(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Clear all nodes and edges from the graph
   */
  clear(): void {
    this.nodes.clear();
    this.edges = [];
  }
}

export default PocketFlow;
