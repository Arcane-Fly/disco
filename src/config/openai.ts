/**
 * OpenAI API Configuration
 * Defines allowed models and configuration for OpenAI integration
 * Updated December 2025 with GPT-5.2 family
 */

export const ALLOWED_OPENAI_MODELS = [
  // GPT-5.2 Series (Latest - December 2025)
  'gpt-5.2', // Default - Best for complex reasoning and coding
  'gpt-5.2-pro', // Smarter, more precise, uses more compute
  'gpt-5.2-instant', // Optimized for fast everyday tasks
  'gpt-5.2-thinking', // Deep reasoning and complex queries
  
  // GPT-5 Series (Current)
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-5-codex',
  'gpt-5-pro',
  
  // GPT-4.1 Series (Current Recommended)
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4.1-turbo', // Legacy name
  
  // Reasoning Models (o-series)
  'o3-pro',
  'o3',
  'o4-mini',
  'o1',
  'o1-pro',
  'o3-mini',
  'o3-deep-research',
  'o4-mini-deep-research',
  
  // Legacy models (still available but discouraged)
  'gpt-4o',
  'gpt-4o-mini',
  'chatgpt-4o-latest',
  'gpt-3.5-turbo', // Deprecated but still available
] as const;

export const ALLOWED_EMBEDDING_MODELS = [
  'text-embedding-3-large',
  'text-embedding-3-small',
] as const;

export const DEFAULT_OPENAI_MODEL = 'gpt-5.2';
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';

export type OpenAIModel = typeof ALLOWED_OPENAI_MODELS[number];
export type EmbeddingModel = typeof ALLOWED_EMBEDDING_MODELS[number];

/**
 * Check if a model string is an allowed OpenAI model
 */
export function isAllowedOpenAIModel(model: string): model is OpenAIModel {
  return ALLOWED_OPENAI_MODELS.includes(model as OpenAIModel);
}

/**
 * Check if a model string is an allowed embedding model
 */
export function isAllowedEmbeddingModel(model: string): model is EmbeddingModel {
  return ALLOWED_EMBEDDING_MODELS.includes(model as EmbeddingModel);
}
