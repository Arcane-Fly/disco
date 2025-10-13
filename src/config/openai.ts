/**
 * OpenAI API Configuration
 * Defines allowed models and configuration for OpenAI integration
 */

export const ALLOWED_OPENAI_MODELS = [
  // GPT-4 Models
  'gpt-4',
  'gpt-4-turbo-preview',
  'gpt-4-1106-preview',
  'gpt-4-0613',
  
  // GPT-3.5 Models
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-0613',
] as const;

export const ALLOWED_EMBEDDING_MODELS = [
  'text-embedding-ada-002',
  'text-embedding-3-small',
  'text-embedding-3-large',
] as const;

export const DEFAULT_OPENAI_MODEL = 'gpt-3.5-turbo';
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-ada-002';

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
