/**
 * Google Gemini API Configuration
 * Defines allowed models and configuration for Google Gemini integration
 * Updated December 2025 with Gemini 3 family
 */

export const ALLOWED_GEMINI_MODELS = [
  // Gemini 3 Series (Latest - December 2025)
  'gemini-3-pro-preview', // Preview: Advanced capabilities
  'gemini-3-flash-preview', // Preview: Fast and efficient
  
  // Gemini 2.5 Series (Stable)
  'gemini-2.5-pro', // Best for complex reasoning and multimodal tasks
  'gemini-2.5-flash', // Fast, efficient, good for most tasks
  'gemini-2.5-flash-lite', // Lightweight, optimized for speed
  
  // Specialized Agents
  'deep-research-pro-preview-12-2025', // Advanced research agent
  
  // Gemini 2.0 Series (Legacy but still available)
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  
  // Gemini 1.5 Series (Legacy)
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro', // Alias for compatibility
  'gemini-pro-vision', // Alias for compatibility
] as const;

export type AllowedGeminiModel = typeof ALLOWED_GEMINI_MODELS[number];

export const DEFAULT_GEMINI_MODEL: AllowedGeminiModel = 'gemini-2.5-flash';

// Gemini 3 capabilities
export const GEMINI_3_FEATURES = [
  'batch-api',
  'caching',
  'code-execution',
  'file-search',
  'function-calling',
  'search-grounding',
  'structured-outputs',
  'thinking',
  'url-context',
  'multimodal', // text, image, video, audio, PDF
] as const;

// Context window specifications
export const GEMINI_CONTEXT_LIMITS = {
  'gemini-3-pro-preview': 1_048_576, // ~1M tokens
  'gemini-3-flash-preview': 1_048_576,
  'gemini-2.5-pro': 1_048_576,
  'gemini-2.5-flash': 1_048_576,
  'gemini-2.5-flash-lite': 1_048_576,
} as const;

// Output token limits
export const GEMINI_OUTPUT_LIMITS = {
  'gemini-3-pro-preview': 65_536,
  'gemini-3-flash-preview': 65_536,
  'gemini-2.5-pro': 65_536,
  'gemini-2.5-flash': 65_536,
  'gemini-2.5-flash-lite': 32_768,
} as const;

export function isAllowedGeminiModel(model: string): model is AllowedGeminiModel {
  return (ALLOWED_GEMINI_MODELS as readonly string[]).includes(model);
}

// Deprecated models to warn users about
export const DEPRECATED_GEMINI_MODELS = [
  'gemini-1.0-pro',
  'gemini-ultra',
] as const;
