/**
 * RAG Pipeline Template
 * 
 * Complete RAG (Retrieval-Augmented Generation) pipeline combining
 * document retrieval, reranking, context augmentation, and generation.
 */

import type { WorkflowTemplate } from '../../../types/templates.js';

export const ragPipelineTemplate: WorkflowTemplate = {
  metadata: {
    id: 'rag-pipeline',
    name: 'RAG Pipeline',
    description: 'Complete RAG workflow with retrieval, reranking, and generation',
    longDescription: `
This template implements a full RAG (Retrieval-Augmented Generation) pipeline that:
1. Retrieves relevant documents from a vector database
2. Reranks documents by relevance to the query
3. Augments the query with retrieved context
4. Generates a final answer using the LLM

Perfect for building question-answering systems, documentation search, and knowledge bases.
    `,
    version: '1.0.0',
    author: 'PocketFlow Team',
    category: 'RAG',
    tags: ['rag', 'retrieval', 'generation', 'llm', 'search'],
    difficulty: 'intermediate',
    createdAt: '2025-10-13T00:00:00.000Z',
    updatedAt: '2025-10-13T00:00:00.000Z',
    license: 'MIT',
    icon: '🔍',
  },
  stats: {
    downloads: 150,
    rating: 4.8,
    ratingCount: 32,
    forks: 15,
    stars: 45,
  },
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'User query to search for',
      required: true,
    },
    {
      name: 'containerId',
      type: 'string',
      description: 'Container ID to search within',
      required: true,
    },
    {
      name: 'limit',
      type: 'number',
      description: 'Maximum number of documents to retrieve',
      required: false,
      default: 5,
    },
  ],
  nodes: [
    {
      id: 'retrieve',
      type: 'rag_retrieve',
      label: 'Retrieve Documents',
      position: { x: 100, y: 100 },
      config: {
        limit: 10,
        useAST: true,
        semanticSearch: true,
      },
      description: 'Retrieve relevant documents from vector database',
    },
    {
      id: 'rerank',
      type: 'rag_rerank',
      label: 'Rerank Results',
      position: { x: 300, y: 100 },
      config: {
        strategy: 'semantic',
        limit: 5,
      },
      description: 'Rerank documents by relevance',
    },
    {
      id: 'augment',
      type: 'rag_augment',
      label: 'Augment Context',
      position: { x: 500, y: 100 },
      config: {
        includeCitations: true,
      },
      description: 'Format documents into context with citations',
    },
    {
      id: 'generate',
      type: 'rag_generate',
      label: 'Generate Answer',
      position: { x: 700, y: 100 },
      config: {
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
      },
      description: 'Generate final answer using LLM',
    },
  ],
  edges: [
    { from: 'retrieve', to: 'rerank', label: 'documents' },
    { from: 'rerank', to: 'augment', label: 'reranked' },
    { from: 'augment', to: 'generate', label: 'context' },
  ],
  examples: [
    {
      title: 'Documentation Search',
      description: 'Search documentation and get an answer with citations',
      inputs: {
        query: 'How do I use WebContainers?',
        containerId: 'container-123',
        limit: 5,
      },
    },
    {
      title: 'Code Search',
      description: 'Find and explain code patterns',
      inputs: {
        query: 'Show me examples of error handling',
        containerId: 'container-456',
        limit: 3,
      },
    },
  ],
  requiredNodeTypes: ['rag_retrieve', 'rag_rerank', 'rag_augment', 'rag_generate'],
};
