/**
 * ConditionalNode - Conditional branching
 * 
 * Evaluates a condition and returns one of two values based on result.
 * Enables workflow branching logic.
 * 
 * @example
 * ```typescript
 * const node = new ConditionalNode();
 * const result = await node.execute({
 *   condition: (state) => state.score > 0.8,
 *   ifTrue: { action: 'proceed' },
 *   ifFalse: { action: 'retry' },
 *   state: { score: 0.9 }
 * });
 * console.log(result.value); // { action: 'proceed' }
 * ```
 */

import { BaseNode } from '../base/BaseNode.js';
import type { ValidationResult } from '../../../../types/nodes.js';

export interface ConditionalNodeInput {
  /** Condition to evaluate (function or boolean) */
  condition: ((state: any) => boolean | Promise<boolean>) | boolean;
  /** Value to return if condition is true */
  ifTrue: any;
  /** Value to return if condition is false */
  ifFalse: any;
  /** State to pass to condition function */
  state?: any;
}

export interface ConditionalNodeOutput {
  /** Selected value based on condition */
  value: any;
  /** Whether condition was true */
  conditionResult: boolean;
  /** Branch taken */
  branch: 'true' | 'false';
}

export class ConditionalNode extends BaseNode {
  nodeType = 'conditional';
  category = 'Utility';
  description = 'Conditional branching based on evaluation';
  
  /**
   * Validate conditional inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (inputs.condition === undefined) {
      errors.push('condition is required');
    }
    
    if (typeof inputs.condition !== 'boolean' && typeof inputs.condition !== 'function') {
      errors.push('condition must be a boolean or function');
    }
    
    if (inputs.ifTrue === undefined) {
      errors.push('ifTrue is required');
    }
    
    if (inputs.ifFalse === undefined) {
      errors.push('ifFalse is required');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute conditional evaluation
   */
  async execute(inputs: ConditionalNodeInput): Promise<ConditionalNodeOutput> {
    let conditionResult: boolean;
    
    // Evaluate condition
    if (typeof inputs.condition === 'boolean') {
      conditionResult = inputs.condition;
    } else if (typeof inputs.condition === 'function') {
      const result = inputs.condition(inputs.state || {});
      conditionResult = result instanceof Promise ? await result : result;
    } else {
      throw new Error('Invalid condition type');
    }
    
    // Select value based on condition
    const value = conditionResult ? inputs.ifTrue : inputs.ifFalse;
    
    return {
      value,
      conditionResult,
      branch: conditionResult ? 'true' : 'false',
    };
  }
}
