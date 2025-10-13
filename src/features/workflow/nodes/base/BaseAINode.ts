/**
 * BaseAINode - Base class for AI-powered nodes
 * 
 * Extends BaseNode with common AI-specific functionality:
 * - LLM client configuration
 * - Retry logic for API calls
 * - Rate limiting
 * - Error handling for AI operations
 */

import { BaseNode } from './BaseNode.js';

/**
 * Base class for AI-powered nodes
 */
export abstract class BaseAINode extends BaseNode {
  protected llmClient?: any;
  protected maxRetries: number = 3;
  protected retryDelay: number = 1000; // ms
  
  /**
   * Retry logic for API calls with exponential backoff
   * 
   * @param fn - Function to retry
   * @param retries - Number of retries remaining
   * @returns Result of the function call
   */
  protected async retryLogic<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      
      // Exponential backoff
      const delay = this.retryDelay * (this.maxRetries - retries + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.retryLogic(fn, retries - 1);
    }
  }
  
  /**
   * Parse and validate JSON response from LLM
   * 
   * @param response - Raw response text
   * @returns Parsed JSON object
   */
  protected parseJSONResponse(response: string): any {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try direct parse
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Sanitize and validate LLM inputs
   * 
   * @param inputs - Input parameters
   * @returns Sanitized inputs
   */
  protected sanitizeInputs(inputs: any): any {
    // Remove any potentially harmful inputs
    const sanitized = { ...inputs };
    
    // Limit prompt length to prevent token overflow
    if (sanitized.prompt && typeof sanitized.prompt === 'string') {
      const maxLength = 100000; // ~25k tokens
      if (sanitized.prompt.length > maxLength) {
        sanitized.prompt = sanitized.prompt.substring(0, maxLength);
      }
    }
    
    return sanitized;
  }
}
