/**
 * RAGAugmentNode - Format context for LLM
 * 
 * Formats retrieved documents into a context string suitable for LLM prompts.
 * Adds source citations and applies templating.
 * 
 * @example
 * ```typescript
 * const node = new RAGAugmentNode();
 * const result = await node.execute({
 *   documents: [
 *     { content: 'Doc 1 content', path: 'file1.ts' },
 *     { content: 'Doc 2 content', path: 'file2.ts' }
 *   ],
 *   query: 'How to use feature X?',
 *   template: 'Context: {context}\n\nQuestion: {query}'
 * });
 * console.log(result.context); // Formatted context with citations
 * ```
 */

import { BaseNode } from '../base/BaseNode.js';
import type { ValidationResult, RAGDocument } from '../../../../types/nodes.js';

export interface RAGAugmentInput {
  /** Documents to format */
  documents: RAGDocument[];
  /** Original query */
  query: string;
  /** Template for formatting (optional) */
  template?: string;
  /** Include source citations */
  includeCitations?: boolean;
}

export interface RAGAugmentOutput {
  /** Formatted context string */
  context: string;
  /** List of sources cited */
  sources: string[];
  /** Number of documents included */
  documentCount: number;
}

export class RAGAugmentNode extends BaseNode {
  nodeType = 'rag_augment';
  category = 'RAG';
  description = 'Format documents into context string for LLM';
  
  private defaultTemplate = `Based on the following context, please answer the question.

Context:
{context}

Question: {query}

Please provide a detailed answer based on the context above.`;
  
  /**
   * Validate augment inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.documents || !Array.isArray(inputs.documents)) {
      errors.push('documents is required and must be an array');
    }
    
    if (!inputs.query || typeof inputs.query !== 'string') {
      errors.push('query is required and must be a string');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute context augmentation
   */
  async execute(inputs: RAGAugmentInput): Promise<RAGAugmentOutput> {
    const template = inputs.template || this.defaultTemplate;
    const includeCitations = inputs.includeCitations ?? true;
    
    // Format documents into context
    const sources: string[] = [];
    const contextParts: string[] = [];
    
    inputs.documents.forEach((doc, index) => {
      const sourceNum = index + 1;
      
      // Extract source identifier
      const source = doc.path || doc.metadata?.path || `Document ${sourceNum}`;
      sources.push(source);
      
      // Format document with or without citation
      let docText = doc.content;
      if (includeCitations) {
        docText = `[${sourceNum}] ${source}\n${doc.content}`;
      }
      
      contextParts.push(docText);
    });
    
    // Join context parts
    const contextStr = contextParts.join('\n\n---\n\n');
    
    // Apply template
    const context = template
      .replace('{context}', contextStr)
      .replace('{query}', inputs.query);
    
    return {
      context,
      sources,
      documentCount: inputs.documents.length,
    };
  }
}
