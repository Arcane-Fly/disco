/**
 * Node Type Definitions for PocketFlow Phase 2
 * 
 * Type definitions for all AI-specific node types including LLM, RAG,
 * Agent, Multi-Agent, and Utility nodes.
 */

/**
 * Validation result for node input validation
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Node execution context
 */
export interface NodeExecutionContext {
  /** Current workflow state */
  state: Record<string, any>;
  /** Node configuration */
  config?: Record<string, any>;
  /** Execution metadata */
  metadata?: {
    workflowId?: string;
    executionId?: string;
    timestamp?: number;
  };
}

/**
 * Base node metadata
 */
export interface NodeMetadata {
  /** Node type identifier */
  nodeType: string;
  /** Human-readable category */
  category: string;
  /** Brief description */
  description: string;
  /** Version */
  version?: string;
}

/**
 * LLM model configuration
 */
export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * LLM usage statistics
 */
export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Function definition for LLM function calling
 */
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: object;
}

/**
 * Document for RAG operations
 */
export interface RAGDocument {
  content: string;
  score: number;
  metadata?: Record<string, any>;
  path?: string;
  lineNumbers?: { start: number; end: number };
}

/**
 * Agent step in ReAct pattern
 */
export interface AgentStep {
  thought: string;
  action: string;
  observation: string;
}

/**
 * Multi-agent vote
 */
export interface AgentVote {
  agentId: string;
  answer: string;
  confidence: number;
  reasoning?: string;
}
