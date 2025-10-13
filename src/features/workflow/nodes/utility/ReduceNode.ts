/**
 * ReduceNode - Aggregate array values
 * 
 * Reduces an array to a single value using an aggregation operation.
 * Supports various aggregation strategies.
 * 
 * @example
 * ```typescript
 * const node = new ReduceNode();
 * const result = await node.execute({
 *   items: [1, 2, 3, 4, 5],
 *   operation: 'sum'
 * });
 * console.log(result.result); // 15
 * ```
 */

import { BaseNode } from '../base/BaseNode.js';
import type { ValidationResult } from '../../../../types/nodes.js';

export interface ReduceNodeInput {
  /** Items to reduce */
  items: any[];
  /** Reduction operation */
  operation: 'sum' | 'product' | 'concat' | 'merge' | 'custom';
  /** Custom reducer function (for custom operation) */
  reducerFn?: (accumulator: any, item: any) => any;
  /** Initial value */
  initialValue?: any;
}

export interface ReduceNodeOutput {
  /** Reduced result */
  result: any;
  /** Number of items reduced */
  itemCount: number;
}

export class ReduceNode extends BaseNode {
  nodeType = 'reduce';
  category = 'Utility';
  description = 'Reduce array to single value through aggregation';
  
  /**
   * Validate reduce inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.items || !Array.isArray(inputs.items)) {
      errors.push('items is required and must be an array');
    }
    
    if (!inputs.operation || typeof inputs.operation !== 'string') {
      errors.push('operation is required and must be a string');
    }
    
    if (inputs.operation === 'custom' && !inputs.reducerFn) {
      errors.push('reducerFn is required when operation is "custom"');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute reduce operation
   */
  async execute(inputs: ReduceNodeInput): Promise<ReduceNodeOutput> {
    let result: any;
    
    switch (inputs.operation) {
      case 'sum':
        result = inputs.items.reduce((acc, item) => {
          const num = typeof item === 'number' ? item : parseFloat(item);
          return acc + (isNaN(num) ? 0 : num);
        }, inputs.initialValue || 0);
        break;
      
      case 'product':
        result = inputs.items.reduce((acc, item) => {
          const num = typeof item === 'number' ? item : parseFloat(item);
          return acc * (isNaN(num) ? 1 : num);
        }, inputs.initialValue || 1);
        break;
      
      case 'concat':
        result = inputs.items.reduce((acc, item) => {
          if (Array.isArray(item)) {
            return [...acc, ...item];
          }
          return [...acc, item];
        }, inputs.initialValue || []);
        break;
      
      case 'merge':
        result = inputs.items.reduce((acc, item) => {
          if (typeof item === 'object' && item !== null) {
            return { ...acc, ...item };
          }
          return acc;
        }, inputs.initialValue || {});
        break;
      
      case 'custom':
        if (inputs.reducerFn) {
          result = inputs.items.reduce(
            inputs.reducerFn,
            inputs.initialValue
          );
        } else {
          throw new Error('Custom reducer function not provided');
        }
        break;
      
      default:
        throw new Error(`Unknown operation: ${inputs.operation}`);
    }
    
    return {
      result,
      itemCount: inputs.items.length,
    };
  }
}
