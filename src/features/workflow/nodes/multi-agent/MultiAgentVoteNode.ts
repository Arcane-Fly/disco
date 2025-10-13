/**
 * MultiAgentVoteNode - Multi-agent majority voting
 * 
 * Multiple agents independently vote on an answer.
 * Returns the majority consensus with vote distribution.
 * 
 * @example
 * ```typescript
 * const node = new MultiAgentVoteNode();
 * const result = await node.execute({
 *   question: 'Is this code correct?',
 *   agents: [
 *     { id: 'agent1', model: 'claude' },
 *     { id: 'agent2', model: 'gpt-4' },
 *     { id: 'agent3', model: 'claude' }
 *   ]
 * });
 * console.log(result.consensus); // Majority answer
 * console.log(result.votes); // Vote breakdown
 * ```
 */

import { BaseAINode } from '../base/BaseAINode.js';
import type { ValidationResult, AgentVote } from '../../../../types/nodes.js';

export interface MultiAgentVoteInput {
  /** Question to vote on */
  question: string;
  /** Agent configurations */
  agents: Array<{ id: string; model?: string }>;
  /** Require minimum confidence */
  minConfidence?: number;
}

export interface MultiAgentVoteOutput {
  /** Consensus answer (majority vote) */
  consensus: string;
  /** All votes cast */
  votes: AgentVote[];
  /** Confidence in consensus */
  confidence: number;
  /** Vote distribution */
  distribution: Record<string, number>;
}

export class MultiAgentVoteNode extends BaseAINode {
  nodeType = 'multi_agent_vote';
  category = 'Multi-Agent';
  description = 'Multi-agent majority voting';
  
  /**
   * Validate vote inputs
   */
  validate(inputs: any): ValidationResult {
    const errors: string[] = [];
    
    if (!inputs.question || typeof inputs.question !== 'string') {
      errors.push('question is required and must be a string');
    }
    
    if (!inputs.agents || !Array.isArray(inputs.agents) || inputs.agents.length < 2) {
      errors.push('agents is required and must be an array with at least 2 agents');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  /**
   * Execute multi-agent voting
   */
  async execute(inputs: MultiAgentVoteInput): Promise<MultiAgentVoteOutput> {
    const votes: AgentVote[] = [];
    
    // Collect votes from each agent
    for (const agent of inputs.agents) {
      await new Promise(resolve => setTimeout(resolve, 5));
      
      // In production, call each agent's LLM
      votes.push({
        agentId: agent.id,
        answer: `Answer from ${agent.id}`,
        confidence: 0.7 + Math.random() * 0.3,
        reasoning: `Mock reasoning from ${agent.id}`,
      });
    }
    
    // Count votes (simplified - in production, use similarity matching)
    const distribution: Record<string, number> = {};
    votes.forEach(vote => {
      distribution[vote.answer] = (distribution[vote.answer] || 0) + 1;
    });
    
    // Find majority answer
    const consensus = Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)[0][0];
    
    const confidence = distribution[consensus] / votes.length;
    
    return {
      consensus,
      votes,
      confidence,
      distribution,
    };
  }
}
