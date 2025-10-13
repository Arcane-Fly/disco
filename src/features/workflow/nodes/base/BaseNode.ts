/**
 * BaseNode - Abstract base class for all PocketFlow nodes
 * 
 * Provides common functionality for all node types including:
 * - Input validation
 * - PocketFlow function creation
 * - Error handling
 * - Metadata management
 */

import type { ValidationResult, NodeMetadata } from '../../../../types/nodes.js';

/**
 * Abstract base class for all PocketFlow nodes
 */
export abstract class BaseNode {
  /** Node type identifier (must be unique) */
  abstract nodeType: string;
  
  /** Node category for organization */
  abstract category: string;
  
  /** Brief description of what this node does */
  abstract description: string;
  
  /**
   * Execute the node with given inputs
   * 
   * @param inputs - Input parameters for execution
   * @returns Execution result
   */
  abstract execute(inputs: any): Promise<any>;
  
  /**
   * Validate node inputs
   * 
   * @param inputs - Inputs to validate
   * @returns Validation result with any errors
   */
  validate(inputs: any): ValidationResult {
    // Base validation - subclasses should override
    if (!inputs || typeof inputs !== 'object') {
      return {
        valid: false,
        errors: ['Inputs must be an object'],
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Create a PocketFlow-compatible function
   * 
   * @returns Function that can be added to PocketFlow graph
   */
  createPocketFlowFunction(): (state: any) => Promise<any> {
    return async (state: any) => {
      try {
        // Validate inputs
        const validation = this.validate(state);
        if (!validation.valid) {
          throw new Error(
            `Validation failed for ${this.nodeType}: ${validation.errors?.join(', ')}`
          );
        }
        
        // Execute node
        const result = await this.execute(state);
        return result;
      } catch (error) {
        // Wrap errors with node context
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`${this.nodeType} execution failed: ${errorMessage}`);
      }
    };
  }
  
  /**
   * Get node metadata
   * 
   * @returns Node metadata including type, category, and description
   */
  getMetadata(): NodeMetadata {
    return {
      nodeType: this.nodeType,
      category: this.category,
      description: this.description,
      version: '1.0.0',
    };
  }
}
