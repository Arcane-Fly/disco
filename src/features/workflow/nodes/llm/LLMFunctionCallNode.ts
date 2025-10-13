/**
 * LLMFunctionCallNode - LLM function/tool calling
 * 
 * Executes an LLM prompt with function definitions and returns
 * which function to call with what arguments.
 * 
 * @example
 * ```typescript
 * const node = new LLMFunctionCallNode();
 * const result = await node.execute({
 *   prompt: 'What is the weather in San Francisco?',
 *   functions: [{
 *     name: 'get_weather',
 *     description: 'Get weather for a location',
 *     parameters: {
 *       type: 'object',
 *       properties: {
 *         location: { type: 'string' }
 *       }
 *     }
 *   }]
 * });
 * console.log(result.functionName); // 'get_weather'
 * console.log(result.arguments); // { location: 'San Francisco' }
 * ```
 */

import { BaseAINode } from '../base/BaseAINode.js';
import type { ValidationResult, LLMConfig, FunctionDefinition } from '../../../../types/nodes.js';

export interface LLMFunctionCallInput extends LLMConfig {
  /** The prompt to send to the LLM */
  prompt: string;
  /** Available function definitions */
  functions: FunctionDefinition[];
}

export interface LLMFunctionCallOutput {
  /** Name of the function to call */
  functionName: string;
  /** Arguments to pass to the function */
  arguments: Record<string, any>;
  /** Whether a function was selected */
  hasFunction: boolean;
}

export class LLMFunctionCallNode extends BaseAINode {
  nodeType = 'llm_function_call';
  category = 'LLM';
  description = 'Execute LLM prompt with function calling';
  
  /**
   * Validate function call inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.prompt || typeof inputs.prompt !== 'string') {
      errors.push('prompt is required and must be a string');
    }
    
    if (!inputs.functions || !Array.isArray(inputs.functions)) {
      errors.push('functions is required and must be an array');
    } else {
      for (const fn of inputs.functions) {
        if (!fn.name || typeof fn.name !== 'string') {
          errors.push('Each function must have a name');
        }
        if (!fn.description || typeof fn.description !== 'string') {
          errors.push('Each function must have a description');
        }
        if (!fn.parameters || typeof fn.parameters !== 'object') {
          errors.push('Each function must have parameters');
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute LLM function calling
   */
  async execute(inputs: LLMFunctionCallInput): Promise<LLMFunctionCallOutput> {
    const sanitized = this.sanitizeInputs(inputs);
    
    return this.retryLogic(async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Mock function call response
      // In production, this would call LLM with function definitions
      const functionName = sanitized.functions[0]?.name || 'unknown';
      
      return {
        functionName,
        arguments: {
          mockArg: `Generated from: ${sanitized.prompt.substring(0, 30)}...`,
        },
        hasFunction: true,
      };
    });
  }
}
