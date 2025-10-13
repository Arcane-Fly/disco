/**
 * RAGRerankNode - Rerank retrieved documents
 * 
 * Reranks documents by relevance to a query using various strategies.
 * Improves retrieval quality by ordering documents more effectively.
 * 
 * @example
 * ```typescript
 * const node = new RAGRerankNode();
 * const result = await node.execute({
 *   documents: [
 *     { content: 'Doc 1', score: 0.5 },
 *     { content: 'Doc 2', score: 0.8 }
 *   ],
 *   query: 'relevant query',
 *   limit: 5
 * });
 * console.log(result.documents); // Reranked by relevance
 * ```
 */

import { BaseNode } from '../base/BaseNode.js';
import type { ValidationResult, RAGDocument } from '../../../../types/nodes.js';

export interface RAGRerankInput {
  /** Documents to rerank */
  documents: RAGDocument[];
  /** Query to rank against */
  query: string;
  /** Maximum number of documents to return */
  limit?: number;
  /** Reranking strategy */
  strategy?: 'score' | 'lexical' | 'semantic';
}

export interface RAGRerankOutput {
  /** Reranked documents */
  documents: RAGDocument[];
  /** Whether documents were reranked */
  reranked: boolean;
  /** Strategy used */
  strategy: string;
}

export class RAGRerankNode extends BaseNode {
  nodeType = 'rag_rerank';
  category = 'RAG';
  description = 'Rerank documents by relevance to query';
  
  /**
   * Validate rerank inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.documents || !Array.isArray(inputs.documents)) {
      errors.push('documents is required and must be an array');
    }
    
    if (!inputs.query || typeof inputs.query !== 'string') {
      errors.push('query is required and must be a string');
    }
    
    if (inputs.limit !== undefined && (typeof inputs.limit !== 'number' || inputs.limit < 1)) {
      errors.push('limit must be a positive number');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute document reranking
   */
  async execute(inputs: RAGRerankInput): Promise<RAGRerankOutput> {
    const strategy = inputs.strategy || 'score';
    const limit = inputs.limit || inputs.documents.length;
    
    // Rerank documents based on strategy
    let reranked = [...inputs.documents];
    
    switch (strategy) {
      case 'score':
        // Sort by existing score (descending)
        reranked.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      
      case 'lexical':
        // Simple lexical matching (count query word occurrences)
        reranked = this.rerankLexical(inputs.documents, inputs.query);
        break;
      
      case 'semantic':
        // In production, use semantic similarity
        // For now, fall back to score-based
        reranked.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      
      default:
        reranked.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    
    // Limit results
    reranked = reranked.slice(0, limit);
    
    return {
      documents: reranked,
      reranked: true,
      strategy,
    };
  }
  
  /**
   * Simple lexical reranking
   */
  private rerankLexical(documents: RAGDocument[], query: string): RAGDocument[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    return documents
      .map(doc => {
        const content = doc.content.toLowerCase();
        const matches = queryTerms.filter(term => content.includes(term)).length;
        return {
          ...doc,
          score: matches / queryTerms.length,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
