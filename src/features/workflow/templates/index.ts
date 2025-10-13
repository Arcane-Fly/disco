/**
 * PocketFlow Template Marketplace
 * 
 * Collection of pre-built workflow templates for common AI patterns.
 * Import these templates to quickly build sophisticated AI workflows.
 */

import type { WorkflowTemplate } from '../../../types/templates.js';
import { ragPipelineTemplate } from './rag-pipeline.template.js';

// Multi-Agent Vote Template
export const multiAgentVoteTemplate: WorkflowTemplate = {
  metadata: {
    id: 'multi-agent-vote',
    name: 'Multi-Agent Vote',
    description: 'Multiple AI agents vote on answers to achieve consensus',
    version: '1.0.0',
    author: 'PocketFlow Team',
    category: 'Multi-Agent',
    tags: ['multi-agent', 'voting', 'consensus', 'ai'],
    difficulty: 'advanced',
    createdAt: '2025-10-13T00:00:00.000Z',
    updatedAt: '2025-10-13T00:00:00.000Z',
    icon: '🗳️',
  },
  stats: { downloads: 89, rating: 4.6, ratingCount: 18, forks: 8, stars: 24 },
  parameters: [
    { name: 'question', type: 'string', description: 'Question for agents to vote on', required: true },
    { name: 'agentCount', type: 'number', description: 'Number of agents', required: false, default: 3 },
  ],
  nodes: [
    {
      id: 'vote',
      type: 'multi_agent_vote',
      label: 'Multi-Agent Vote',
      position: { x: 200, y: 100 },
      config: { agents: [
        { id: 'agent1', model: 'claude' },
        { id: 'agent2', model: 'gpt-4' },
        { id: 'agent3', model: 'claude' },
      ]},
      description: 'Agents vote on the answer',
    },
  ],
  edges: [],
  examples: [
    { title: 'Decision Making', description: 'Get consensus on technical decisions',
      inputs: { question: 'Should we use React or Vue?', agentCount: 3 }},
  ],
  requiredNodeTypes: ['multi_agent_vote'],
};

// Research Agent Template
export const researchAgentTemplate: WorkflowTemplate = {
  metadata: {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'AI agent that conducts multi-step research with citations',
    version: '1.0.0',
    author: 'PocketFlow Team',
    category: 'Agent',
    tags: ['research', 'agent', 'citations', 'multi-step'],
    difficulty: 'intermediate',
    createdAt: '2025-10-13T00:00:00.000Z',
    updatedAt: '2025-10-13T00:00:00.000Z',
    icon: '🔬',
  },
  stats: { downloads: 124, rating: 4.7, ratingCount: 25, forks: 12, stars: 38 },
  parameters: [
    { name: 'question', type: 'string', description: 'Research question', required: true },
    { name: 'depth', type: 'number', description: 'Research depth', required: false, default: 3 },
  ],
  nodes: [
    {
      id: 'research',
      type: 'agent_research',
      label: 'Research Agent',
      position: { x: 200, y: 100 },
      config: { sources: ['web', 'docs'], depth: 3 },
      description: 'Conduct iterative research',
    },
  ],
  edges: [],
  examples: [
    { title: 'Technical Research', description: 'Research technical topics',
      inputs: { question: 'What are best practices for WebContainers?', depth: 3 }},
  ],
  requiredNodeTypes: ['agent_research'],
};

// Code Generation Template
export const codeGenTemplate: WorkflowTemplate = {
  metadata: {
    id: 'code-generation',
    name: 'Code Generation with Validation',
    description: 'Generate code from specifications with test validation',
    version: '1.0.0',
    author: 'PocketFlow Team',
    category: 'Agent',
    tags: ['code-gen', 'validation', 'testing', 'agent'],
    difficulty: 'advanced',
    createdAt: '2025-10-13T00:00:00.000Z',
    updatedAt: '2025-10-13T00:00:00.000Z',
    icon: '⚙️',
  },
  stats: { downloads: 201, rating: 4.9, ratingCount: 45, forks: 28, stars: 67 },
  parameters: [
    { name: 'specification', type: 'string', description: 'Code specification', required: true },
    { name: 'language', type: 'string', description: 'Programming language', required: true },
  ],
  nodes: [
    {
      id: 'codegen',
      type: 'agent_code_gen',
      label: 'Code Generator',
      position: { x: 200, y: 100 },
      config: { maxAttempts: 3 },
      description: 'Generate and validate code',
    },
  ],
  edges: [],
  examples: [
    { title: 'Function Generation', description: 'Generate a sorting function',
      inputs: { specification: 'Sort array of numbers', language: 'typescript' }},
  ],
  requiredNodeTypes: ['agent_code_gen'],
};

// Map-Reduce Template
export const mapReduceTemplate: WorkflowTemplate = {
  metadata: {
    id: 'map-reduce',
    name: 'Map-Reduce Pattern',
    description: 'Parallel processing with aggregation',
    version: '1.0.0',
    author: 'PocketFlow Team',
    category: 'Utility',
    tags: ['map', 'reduce', 'parallel', 'aggregation'],
    difficulty: 'beginner',
    createdAt: '2025-10-13T00:00:00.000Z',
    updatedAt: '2025-10-13T00:00:00.000Z',
    icon: '🗺️',
  },
  stats: { downloads: 178, rating: 4.5, ratingCount: 35, forks: 20, stars: 52 },
  parameters: [
    { name: 'items', type: 'array', description: 'Items to process', required: true },
    { name: 'operation', type: 'string', description: 'Operation to perform', required: true },
  ],
  nodes: [
    {
      id: 'map',
      type: 'map',
      label: 'Map Operation',
      position: { x: 100, y: 100 },
      config: { concurrency: 5 },
      description: 'Process items in parallel',
    },
    {
      id: 'reduce',
      type: 'reduce',
      label: 'Reduce Operation',
      position: { x: 300, y: 100 },
      config: { operation: 'sum' },
      description: 'Aggregate results',
    },
  ],
  edges: [{ from: 'map', to: 'reduce' }],
  examples: [
    { title: 'Sum Numbers', description: 'Square numbers and sum them',
      inputs: { items: [1, 2, 3, 4, 5], operation: 'square' }},
  ],
  requiredNodeTypes: ['map', 'reduce'],
};

// Chat Bot Template
export const chatBotTemplate: WorkflowTemplate = {
  metadata: {
    id: 'chatbot-memory',
    name: 'Chat Bot with Memory',
    description: 'Conversational AI with context memory',
    version: '1.0.0',
    author: 'PocketFlow Team',
    category: 'Integration',
    tags: ['chatbot', 'conversation', 'memory', 'llm'],
    difficulty: 'intermediate',
    createdAt: '2025-10-13T00:00:00.000Z',
    updatedAt: '2025-10-13T00:00:00.000Z',
    icon: '💬',
  },
  stats: { downloads: 267, rating: 4.8, ratingCount: 58, forks: 34, stars: 89 },
  parameters: [
    { name: 'message', type: 'string', description: 'User message', required: true },
    { name: 'context', type: 'array', description: 'Conversation history', required: false, default: [] },
  ],
  nodes: [
    {
      id: 'respond',
      type: 'llm_prompt',
      label: 'Generate Response',
      position: { x: 200, y: 100 },
      config: { temperature: 0.7 },
      description: 'Generate contextual response',
    },
  ],
  edges: [],
  examples: [
    { title: 'Support Bot', description: 'Customer support chatbot',
      inputs: { message: 'How do I reset my password?', context: [] }},
  ],
  requiredNodeTypes: ['llm_prompt'],
};

// Text-to-SQL Template
export const textToSQLTemplate: WorkflowTemplate = {
  metadata: {
    id: 'text-to-sql',
    name: 'Text-to-SQL',
    description: 'Convert natural language to SQL queries',
    version: '1.0.0',
    author: 'PocketFlow Team',
    category: 'Integration',
    tags: ['sql', 'database', 'nlp', 'conversion'],
    difficulty: 'intermediate',
    createdAt: '2025-10-13T00:00:00.000Z',
    updatedAt: '2025-10-13T00:00:00.000Z',
    icon: '🗄️',
  },
  stats: { downloads: 145, rating: 4.6, ratingCount: 28, forks: 16, stars: 42 },
  parameters: [
    { name: 'query', type: 'string', description: 'Natural language query', required: true },
    { name: 'schema', type: 'object', description: 'Database schema', required: true },
  ],
  nodes: [
    {
      id: 'convert',
      type: 'llm_structured',
      label: 'Convert to SQL',
      position: { x: 200, y: 100 },
      config: { schema: { type: 'object', properties: { sql: { type: 'string' }}}},
      description: 'Generate SQL from natural language',
    },
  ],
  edges: [],
  examples: [
    { title: 'Query Generation', description: 'Generate SQL from question',
      inputs: { query: 'Show me all users created today', schema: {} }},
  ],
  requiredNodeTypes: ['llm_structured'],
};

// ReAct Agent Template
export const reactAgentTemplate: WorkflowTemplate = {
  metadata: {
    id: 'react-agent',
    name: 'ReAct Agent',
    description: 'Reasoning and Acting agent for complex tasks',
    version: '1.0.0',
    author: 'PocketFlow Team',
    category: 'Agent',
    tags: ['react', 'reasoning', 'acting', 'agent'],
    difficulty: 'advanced',
    createdAt: '2025-10-13T00:00:00.000Z',
    updatedAt: '2025-10-13T00:00:00.000Z',
    icon: '🤔',
  },
  stats: { downloads: 112, rating: 4.7, ratingCount: 22, forks: 9, stars: 31 },
  parameters: [
    { name: 'task', type: 'string', description: 'Task description', required: true },
    { name: 'maxSteps', type: 'number', description: 'Maximum steps', required: false, default: 5 },
  ],
  nodes: [
    {
      id: 'react',
      type: 'agent_react',
      label: 'ReAct Agent',
      position: { x: 200, y: 100 },
      config: { maxSteps: 5 },
      description: 'Reason and act to complete task',
    },
  ],
  edges: [],
  examples: [
    { title: 'Complex Task', description: 'Solve multi-step problems',
      inputs: { task: 'Research and summarize WebContainer best practices', maxSteps: 5 }},
  ],
  requiredNodeTypes: ['agent_react'],
};

/**
 * All available templates
 */
export const allTemplates: WorkflowTemplate[] = [
  ragPipelineTemplate,
  multiAgentVoteTemplate,
  researchAgentTemplate,
  codeGenTemplate,
  mapReduceTemplate,
  chatBotTemplate,
  textToSQLTemplate,
  reactAgentTemplate,
];

/**
 * Template marketplace export
 */
export { ragPipelineTemplate };
