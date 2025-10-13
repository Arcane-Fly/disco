/**
 * NodeRegistry - Central registry for all PocketFlow node types
 * 
 * Manages registration, creation, and discovery of workflow node types.
 * Provides a singleton instance for global access.
 */

import { BaseNode } from '../nodes/base/BaseNode.js';
import type { NodeMetadata } from '../../../types/nodes.js';

// Import all node types
import { LLMPromptNode } from '../nodes/llm/LLMPromptNode.js';
import { LLMStructuredNode } from '../nodes/llm/LLMStructuredNode.js';
import { LLMFunctionCallNode } from '../nodes/llm/LLMFunctionCallNode.js';

import { RAGRerankNode } from '../nodes/rag/RAGRerankNode.js';
import { RAGAugmentNode } from '../nodes/rag/RAGAugmentNode.js';
import { RAGGenerateNode } from '../nodes/rag/RAGGenerateNode.js';

import { AgentReActNode } from '../nodes/agent/AgentReActNode.js';
import { AgentResearchNode } from '../nodes/agent/AgentResearchNode.js';
import { AgentCodeGenNode } from '../nodes/agent/AgentCodeGenNode.js';

import { MultiAgentDebateNode } from '../nodes/multi-agent/MultiAgentDebateNode.js';
import { MultiAgentVoteNode } from '../nodes/multi-agent/MultiAgentVoteNode.js';
import { MultiAgentConsensusNode } from '../nodes/multi-agent/MultiAgentConsensusNode.js';

import { MapNode } from '../nodes/utility/MapNode.js';
import { ReduceNode } from '../nodes/utility/ReduceNode.js';
import { ConditionalNode } from '../nodes/utility/ConditionalNode.js';

/**
 * Node constructor type
 */
type NodeConstructor = new () => BaseNode;

/**
 * Registry entry with metadata
 */
interface RegistryEntry {
  constructor: NodeConstructor;
  metadata: NodeMetadata;
}

/**
 * NodeRegistry singleton class
 */
export class NodeRegistry {
  private static instance: NodeRegistry;
  private nodes = new Map<string, RegistryEntry>();
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.registerAllNodes();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }
  
  /**
   * Register all built-in node types
   */
  private registerAllNodes(): void {
    // LLM nodes
    this.registerNode(LLMPromptNode);
    this.registerNode(LLMStructuredNode);
    this.registerNode(LLMFunctionCallNode);
    
    // RAG nodes
    this.registerNode(RAGRerankNode);
    this.registerNode(RAGAugmentNode);
    this.registerNode(RAGGenerateNode);
    
    // Agent nodes
    this.registerNode(AgentReActNode);
    this.registerNode(AgentResearchNode);
    this.registerNode(AgentCodeGenNode);
    
    // Multi-Agent nodes
    this.registerNode(MultiAgentDebateNode);
    this.registerNode(MultiAgentVoteNode);
    this.registerNode(MultiAgentConsensusNode);
    
    // Utility nodes
    this.registerNode(MapNode);
    this.registerNode(ReduceNode);
    this.registerNode(ConditionalNode);
  }
  
  /**
   * Register a node type
   * 
   * @param nodeClass - Node constructor
   */
  registerNode(nodeClass: NodeConstructor): void {
    const instance = new nodeClass();
    const metadata = instance.getMetadata();
    
    if (this.nodes.has(metadata.nodeType)) {
      throw new Error(`Node type "${metadata.nodeType}" is already registered`);
    }
    
    this.nodes.set(metadata.nodeType, {
      constructor: nodeClass,
      metadata,
    });
  }
  
  /**
   * Create a node instance by type
   * 
   * @param nodeType - Type of node to create
   * @returns New node instance
   * @throws Error if node type is not registered
   */
  create(nodeType: string): BaseNode {
    const entry = this.nodes.get(nodeType);
    
    if (!entry) {
      throw new Error(`Node type "${nodeType}" is not registered`);
    }
    
    return new entry.constructor();
  }
  
  /**
   * Check if a node type is registered
   * 
   * @param nodeType - Type to check
   * @returns True if registered
   */
  has(nodeType: string): boolean {
    return this.nodes.has(nodeType);
  }
  
  /**
   * Get metadata for a node type
   * 
   * @param nodeType - Type to get metadata for
   * @returns Node metadata or undefined
   */
  getMetadata(nodeType: string): NodeMetadata | undefined {
    return this.nodes.get(nodeType)?.metadata;
  }
  
  /**
   * List all registered node types
   * 
   * @returns Array of node metadata
   */
  list(): NodeMetadata[] {
    return Array.from(this.nodes.values()).map(entry => entry.metadata);
  }
  
  /**
   * List nodes by category
   * 
   * @param category - Category to filter by
   * @returns Array of node metadata in category
   */
  listByCategory(category: string): NodeMetadata[] {
    return this.list().filter(meta => meta.category === category);
  }
  
  /**
   * Get all categories
   * 
   * @returns Array of unique categories
   */
  getCategories(): string[] {
    const categories = new Set(
      Array.from(this.nodes.values()).map(entry => entry.metadata.category)
    );
    return Array.from(categories).sort();
  }
  
  /**
   * Clear all registered nodes (for testing)
   */
  clear(): void {
    this.nodes.clear();
  }
  
  /**
   * Get count of registered nodes
   * 
   * @returns Number of registered nodes
   */
  count(): number {
    return this.nodes.size;
  }
}

/**
 * Global singleton instance
 */
export const nodeRegistry = NodeRegistry.getInstance();
