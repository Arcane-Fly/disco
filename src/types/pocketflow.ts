/**
 * PocketFlow Type Definitions
 * 
 * Core types for the PocketFlow graph execution engine.
 * PocketFlow is a minimalistic workflow framework based on DAG (Directed Acyclic Graph) execution.
 */

/**
 * Function type for PocketFlow nodes
 * Can be synchronous or asynchronous
 */
export type PocketFlowNodeFunction = (input: any) => any | Promise<any>;

/**
 * Represents a node in the PocketFlow graph
 */
export interface PocketFlowNode {
  name: string;
  fn: PocketFlowNodeFunction;
}

/**
 * Represents a directed edge between two nodes
 */
export interface PocketFlowEdge {
  from: string;
  to: string;
}

/**
 * Result of a PocketFlow workflow execution
 */
export interface PocketFlowExecutionResult {
  /** Output values from all nodes */
  outputs: Record<string, any>;
  /** Total execution time in milliseconds */
  executionTime: number;
  /** List of nodes executed in order */
  nodesExecuted: string[];
  /** Whether execution completed successfully */
  success: boolean;
  /** Error message if execution failed */
  error?: string;
}

/**
 * Options for PocketFlow execution
 */
export interface PocketFlowExecutionOptions {
  /** Timeout in milliseconds for the entire workflow */
  timeout?: number;
  /** Whether to stop execution on first error */
  stopOnError?: boolean;
  /** Callback for progress updates */
  onProgress?: (nodeName: string, result: any) => void;
}
