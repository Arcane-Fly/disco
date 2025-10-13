/**
 * RAGGenerateNode - Generate response with RAG context
 * 
 * Generates an LLM response using RAG context.
 * Combines retrieval-augmented generation in a single node.
 * 
 * @example
 * ```typescript
 * const node = new RAGGenerateNode();
 * const result = await node.execute({
 *   query: 'How do WebContainers work?',
 *   context: 'WebContainers are...',
 *   model: 'claude-3-5-sonnet-20241022'
 * });
 * console.log(result.response); // LLM response using context
 * ```
 */

import { BaseAINode } from '../base/BaseAINode.js';
import type { ValidationResult, LLMConfig } from '../../../../types/nodes.js';

export interface RAGGenerateInput extends LLMConfig {
  /** User's query */
  query: string;
  /** Context from RAG retrieval */
  context: string;
  /** Source documents (optional, for citations) */
  sources?: string[];
}

export interface RAGGenerateOutput {
  /** Generated response */
  response: string;
  /** Sources cited in response */
  sources: string[];
  /** Model used */
  model: string;
}

export class RAGGenerateNode extends BaseAINode {
  nodeType = 'rag_generate';
  category = 'RAG';
  description = 'Generate LLM response with RAG context';
  
  /**
   * Validate generate inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.query || typeof inputs.query !== 'string') {
      errors.push('query is required and must be a string');
    }
    
    if (!inputs.context || typeof inputs.context !== 'string') {
      errors.push('context is required and must be a string');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute RAG generation
   */
  async execute(inputs: RAGGenerateInput): Promise<RAGGenerateOutput> {
    const sanitized = this.sanitizeInputs(inputs);
    const model = sanitized.model || 'claude-3-5-sonnet-20241022';
    
    return this.retryLogic(async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Mock RAG generation
      // In production, this would call LLM with the context and query
      const response = `[Mock RAG Response] Based on the provided context, here's an answer to "${sanitized.query.substring(0, 50)}..."`;
      
      return {
        response,
        sources: sanitized.sources || [],
        model,
      };
    });
  }
}
