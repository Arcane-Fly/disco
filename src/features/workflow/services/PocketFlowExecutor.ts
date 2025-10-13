/**
 * PocketFlow Executor Service
 * 
 * Converts Disco workflow definitions to PocketFlow graphs and executes them.
 * Provides progress tracking, error handling, and result formatting.
 */

import { PocketFlow } from '../../../lib/pocketflow.js';
import type { PocketFlowExecutionResult } from '../../../types/pocketflow.js';

/**
 * Workflow definition compatible with existing WorkflowBuilder
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  data: Record<string, unknown>;
  config?: {
    category?: string;
    description?: string;
    [key: string]: unknown;
  };
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

/**
 * Result of workflow execution with additional metadata
 */
export interface ExecutionResult extends PocketFlowExecutionResult {
  workflowId: string;
  workflowName: string;
  startTime: number;
  endTime: number;
}

/**
 * Options for workflow execution
 */
export interface ExecutionOptions {
  /** Initial inputs for the workflow */
  inputs?: Record<string, any>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Stop on first error */
  stopOnError?: boolean;
  /** Progress callback */
  onProgress?: (nodeId: string, nodeName: string, result: any) => void;
}

/**
 * PocketFlow Executor Service
 * 
 * Bridges the gap between Disco's workflow definitions and PocketFlow's
 * graph execution engine.
 */
export class PocketFlowExecutor {
  /**
   * Execute a workflow definition using PocketFlow
   * 
   * @param workflow - The workflow definition to execute
   * @param options - Execution options
   * @returns Execution result with outputs and metadata
   * 
   * @example
   * ```typescript
   * const executor = new PocketFlowExecutor();
   * const result = await executor.executeWorkflow(myWorkflow, {
   *   inputs: { query: 'Hello World' },
   *   onProgress: (nodeId, nodeName, result) => {
   *     console.log(`Node ${nodeName} completed:`, result);
   *   }
   * });
   * ```
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Create a new PocketFlow instance
      const flow = new PocketFlow();
      
      // Create a map of node ID to node for quick lookup
      const nodeMap = new Map<string, WorkflowNode>();
      for (const node of workflow.nodes) {
        nodeMap.set(node.id, node);
      }
      
      // Add nodes to the PocketFlow graph
      for (const node of workflow.nodes) {
        // Create a node function that executes this workflow node
        const nodeFn = this.createNodeFunction(node, nodeMap);
        flow.addNode(node.id, nodeFn);
      }
      
      // Add edges based on connections
      for (const connection of workflow.connections) {
        flow.addEdge(connection.sourceNodeId, connection.targetNodeId);
      }
      
      // Execute the workflow
      const result = await flow.execute(options.inputs || {}, {
        timeout: options.timeout,
        stopOnError: options.stopOnError,
        onProgress: options.onProgress ? (nodeName, result) => {
          const node = nodeMap.get(nodeName);
          options.onProgress!(nodeName, node?.label || nodeName, result);
        } : undefined,
      });
      
      const endTime = Date.now();
      
      // Return enhanced result
      return {
        ...result,
        workflowId: workflow.id,
        workflowName: workflow.name,
        startTime,
        endTime,
      };
    } catch (error) {
      const endTime = Date.now();
      
      return {
        outputs: {},
        executionTime: endTime - startTime,
        nodesExecuted: [],
        success: false,
        error: error instanceof Error ? error.message : String(error),
        workflowId: workflow.id,
        workflowName: workflow.name,
        startTime,
        endTime,
      };
    }
  }
  
  /**
   * Create a node function for PocketFlow from a workflow node
   * 
   * @param node - The workflow node to convert
   * @param nodeMap - Map of all nodes for reference
   * @returns A function that executes the node logic
   * 
   * @private
   */
  private createNodeFunction(
    node: WorkflowNode,
    nodeMap: Map<string, WorkflowNode>
  ): (state: any) => any | Promise<any> {
    // Return a function that executes based on node type
    return async (state: any) => {
      // For now, return the node's data
      // In Phase 2, this will dispatch to specific node implementations
      // based on node.type (e.g., 'rag_retrieve', 'llm_call', etc.)
      
      switch (node.type) {
        case 'input':
          // Input nodes pass through their data
          return node.data;
          
        case 'output':
          // Output nodes collect results from previous nodes
          return {
            ...node.data,
            inputs: state,
          };
          
        case 'process':
        case 'custom':
        default:
          // Other nodes return their data merged with state
          return {
            ...node.data,
            state,
          };
      }
    };
  }
  
  /**
   * Validate a workflow definition
   * 
   * @param workflow - The workflow to validate
   * @returns Validation result with errors if any
   */
  validateWorkflow(workflow: WorkflowDefinition): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check if workflow has nodes
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }
    
    // Check for duplicate node IDs
    const nodeIds = new Set<string>();
    for (const node of workflow.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      }
      nodeIds.add(node.id);
    }
    
    // Validate connections reference existing nodes
    for (const connection of workflow.connections) {
      if (!nodeIds.has(connection.sourceNodeId)) {
        errors.push(`Connection references non-existent source node: ${connection.sourceNodeId}`);
      }
      if (!nodeIds.has(connection.targetNodeId)) {
        errors.push(`Connection references non-existent target node: ${connection.targetNodeId}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default PocketFlowExecutor;
