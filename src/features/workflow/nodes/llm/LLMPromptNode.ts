/**
 * LLMPromptNode - Basic LLM completion
 * 
 * Executes a basic LLM prompt and returns the completion.
 * Supports various models and configuration options.
 * 
 * @example
 * ```typescript
 * const node = new LLMPromptNode();
 * const result = await node.execute({
 *   prompt: 'Explain WebContainers in simple terms',
 *   model: 'claude-3-5-sonnet-20241022',
 *   temperature: 0.7,
 *   maxTokens: 1000
 * });
 * console.log(result.response);
 * ```
 */

import { BaseAINode } from '../base/BaseAINode.js';
import type { ValidationResult, LLMConfig, LLMUsage } from '../../../../types/nodes.js';

export interface LLMPromptInput extends LLMConfig {
  /** The prompt to send to the LLM */
  prompt: string;
}

export interface LLMPromptOutput {
  /** The LLM's response */
  response: string;
  /** Token usage statistics */
  usage?: LLMUsage;
  /** Model used */
  model: string;
}

export class LLMPromptNode extends BaseAINode {
  nodeType = 'llm_prompt';
  category = 'LLM';
  description = 'Execute basic LLM completion with a prompt';
  
  /**
   * Validate LLM prompt inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.prompt || typeof inputs.prompt !== 'string') {
      errors.push('prompt is required and must be a string');
    }
    
    if (inputs.prompt && inputs.prompt.trim().length === 0) {
      errors.push('prompt cannot be empty');
    }
    
    if (inputs.temperature !== undefined) {
      if (typeof inputs.temperature !== 'number' || inputs.temperature < 0 || inputs.temperature > 2) {
        errors.push('temperature must be a number between 0 and 2');
      }
    }
    
    if (inputs.maxTokens !== undefined) {
      if (typeof inputs.maxTokens !== 'number' || inputs.maxTokens < 1) {
        errors.push('maxTokens must be a positive number');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute LLM prompt
   */
  async execute(inputs: LLMPromptInput): Promise<LLMPromptOutput> {
    const sanitized = this.sanitizeInputs(inputs);
    
    // Default configuration
    const model = sanitized.model || 'claude-3-5-sonnet-20241022';
    const temperature = sanitized.temperature ?? 0.7;
    const maxTokens = sanitized.maxTokens ?? 4096;
    
    // Mock implementation - in production, this would call actual LLM API
    // For now, return a mock response to enable testing
    return this.retryLogic(async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return {
        response: `[Mock LLM Response] Received prompt: "${sanitized.prompt.substring(0, 50)}..."`,
        model,
        usage: {
          promptTokens: Math.ceil(sanitized.prompt.length / 4),
          completionTokens: 50,
          totalTokens: Math.ceil(sanitized.prompt.length / 4) + 50,
        },
      };
    });
  }
}
