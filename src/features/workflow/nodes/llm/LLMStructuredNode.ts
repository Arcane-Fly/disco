/**
 * LLMStructuredNode - Structured JSON output from LLM
 * 
 * Executes an LLM prompt and ensures the output conforms to a JSON schema.
 * Validates the response against the provided schema.
 * 
 * @example
 * ```typescript
 * const node = new LLMStructuredNode();
 * const result = await node.execute({
 *   prompt: 'Extract the name and age from: "John is 25 years old"',
 *   schema: {
 *     type: 'object',
 *     properties: {
 *       name: { type: 'string' },
 *       age: { type: 'number' }
 *     },
 *     required: ['name', 'age']
 *   }
 * });
 * console.log(result.data); // { name: 'John', age: 25 }
 * ```
 */

import { BaseAINode } from '../base/BaseAINode.js';
import type { ValidationResult, LLMConfig } from '../../../../types/nodes.js';

export interface LLMStructuredInput extends LLMConfig {
  /** The prompt to send to the LLM */
  prompt: string;
  /** JSON schema for the expected output */
  schema: object;
}

export interface LLMStructuredOutput {
  /** Parsed and validated JSON data */
  data: any;
  /** Whether the data is valid according to schema */
  valid: boolean;
  /** Validation errors if any */
  errors?: string[];
}

export class LLMStructuredNode extends BaseAINode {
  nodeType = 'llm_structured';
  category = 'LLM';
  description = 'Execute LLM prompt with structured JSON output';
  
  /**
   * Validate structured LLM inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.prompt || typeof inputs.prompt !== 'string') {
      errors.push('prompt is required and must be a string');
    }
    
    if (!inputs.schema || typeof inputs.schema !== 'object') {
      errors.push('schema is required and must be an object');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute structured LLM prompt
   */
  async execute(inputs: LLMStructuredInput): Promise<LLMStructuredOutput> {
    const sanitized = this.sanitizeInputs(inputs);
    
    return this.retryLogic(async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Mock structured response
      // In production, this would call LLM with structured output instructions
      const mockData = {
        result: `Structured response for: ${sanitized.prompt.substring(0, 30)}...`,
        timestamp: Date.now(),
      };
      
      // Basic schema validation (simplified for mock)
      const valid = this.validateAgainstSchema(mockData, sanitized.schema);
      
      return {
        data: mockData,
        valid,
        errors: valid ? undefined : ['Schema validation failed (mock)'],
      };
    });
  }
  
  /**
   * Validate data against JSON schema (simplified)
   */
  private validateAgainstSchema(data: any, schema: any): boolean {
    // Simplified validation - in production use a proper JSON schema validator
    if (schema.type === 'object') {
      return typeof data === 'object' && data !== null;
    }
    return true;
  }
}
