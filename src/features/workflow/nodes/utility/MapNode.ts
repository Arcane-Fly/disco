/**
 * MapNode - Parallel operations on array
 * 
 * Applies a function to each element in an array in parallel.
 * Useful for batch processing and parallel execution.
 * 
 * @example
 * ```typescript
 * const node = new MapNode();
 * const result = await node.execute({
 *   items: ['item1', 'item2', 'item3'],
 *   operation: 'process',
 *   operationFn: (item) => `Processed: ${item}`
 * });
 * console.log(result.results); // Array of processed items
 * ```
 */

import { BaseNode } from '../base/BaseNode.js';
import type { ValidationResult } from '../../../../types/nodes.js';

export interface MapNodeInput {
  /** Items to map over */
  items: any[];
  /** Operation name/identifier */
  operation: string;
  /** Function to apply to each item (for testing) */
  operationFn?: (item: any) => any | Promise<any>;
  /** Maximum parallel operations */
  concurrency?: number;
}

export interface MapNodeOutput {
  /** Results from mapping */
  results: any[];
  /** Number of items processed */
  processedCount: number;
  /** Any errors encountered */
  errors?: Array<{ index: number; error: string }>;
}

export class MapNode extends BaseNode {
  nodeType = 'map';
  category = 'Utility';
  description = 'Apply operation to each item in parallel';
  
  /**
   * Validate map inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.items || !Array.isArray(inputs.items)) {
      errors.push('items is required and must be an array');
    }
    
    if (!inputs.operation || typeof inputs.operation !== 'string') {
      errors.push('operation is required and must be a string');
    }
    
    if (inputs.concurrency !== undefined) {
      if (typeof inputs.concurrency !== 'number' || inputs.concurrency < 1) {
        errors.push('concurrency must be a positive number');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute map operation
   */
  async execute(inputs: MapNodeInput): Promise<MapNodeOutput> {
    const errors: MapNodeOutput['errors'] = [];
    const concurrency = inputs.concurrency || inputs.items.length;
    
    // Default operation function (identity)
    const operationFn = inputs.operationFn || ((item: any) => item);
    
    // Process items with concurrency limit
    const results: any[] = [];
    
    for (let i = 0; i < inputs.items.length; i += concurrency) {
      const batch = inputs.items.slice(i, i + concurrency);
      const batchPromises = batch.map(async (item, batchIndex) => {
        const actualIndex = i + batchIndex;
        try {
          return await operationFn(item);
        } catch (error) {
          errors.push({
            index: actualIndex,
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return {
      results,
      processedCount: inputs.items.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
