/**
 * MultiAgentConsensusNode - Multi-agent consensus building
 * 
 * Multiple agents work together to build consensus through
 * iterative refinement and discussion.
 * 
 * @example
 * ```typescript
 * const node = new MultiAgentConsensusNode();
 * const result = await node.execute({
 *   question: 'Design an API for user management',
 *   agents: [
 *     { id: 'security', expertise: 'security' },
 *     { id: 'ux', expertise: 'user experience' },
 *     { id: 'backend', expertise: 'backend architecture' }
 *   ],
 *   threshold: 0.8
 * });
 * console.log(result.consensus); // Agreed design
 * ```
 */

import { BaseAINode } from '../base/BaseAINode.js';
import type { ValidationResult } from '../../../../types/nodes.js';

export interface MultiAgentConsensusInput {
  /** Question/task for consensus */
  question: string;
  /** Agents with expertise areas */
  agents: Array<{ id: string; expertise?: string }>;
  /** Consensus threshold (0-1) */
  threshold?: number;
  /** Maximum iterations */
  maxIterations?: number;
}

export interface MultiAgentConsensusOutput {
  /** Final consensus */
  consensus: string;
  /** Agreement score achieved */
  agreementScore: number;
  /** Number of iterations used */
  iterations: number;
  /** Whether consensus was reached */
  reached: boolean;
  /** Contribution from each agent */
  contributions: Array<{ agentId: string; contribution: string }>;
}

export class MultiAgentConsensusNode extends BaseAINode {
  nodeType = 'multi_agent_consensus';
  category = 'Multi-Agent';
  description = 'Multi-agent consensus building through iteration';
  
  /**
   * Validate consensus inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.question || typeof inputs.question !== 'string') {
      errors.push('question is required and must be a string');
    }
    
    if (!inputs.agents || !Array.isArray(inputs.agents) || inputs.agents.length < 2) {
      errors.push('agents is required and must be an array with at least 2 agents');
    }
    
    if (inputs.threshold !== undefined) {
      if (typeof inputs.threshold !== 'number' || inputs.threshold < 0 || inputs.threshold > 1) {
        errors.push('threshold must be a number between 0 and 1');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute consensus building
   */
  async execute(inputs: MultiAgentConsensusInput): Promise<MultiAgentConsensusOutput> {
    const threshold = inputs.threshold || 0.8;
    const maxIterations = inputs.maxIterations || 5;
    const contributions: MultiAgentConsensusOutput['contributions'] = [];
    
    let agreementScore = 0;
    let iterations = 0;
    
    // Iterative consensus building
    for (iterations = 1; iterations <= maxIterations; iterations++) {
      // Collect contributions from each agent
      for (const agent of inputs.agents) {
        await new Promise(resolve => setTimeout(resolve, 5));
        
        contributions.push({
          agentId: agent.id,
          contribution: `[Mock] Contribution from ${agent.id} in iteration ${iterations}`,
        });
      }
      
      // Calculate agreement score (simplified)
      agreementScore = 0.5 + (iterations / maxIterations) * 0.4;
      
      // Check if threshold reached
      if (agreementScore >= threshold) {
        break;
      }
    }
    
    return {
      consensus: `[Mock Consensus] Agreed solution for: "${inputs.question}"`,
      agreementScore,
      iterations,
      reached: agreementScore >= threshold,
      contributions,
    };
  }
}
