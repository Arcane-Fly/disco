// Centralized Anthropic (Claude) model policy
// Only allow modern, supported models per project standards.
// Based on MODEL_MANIFEST.md - Only current models from 2025

export const ALLOWED_CLAUDE_MODELS = [
  // Claude 4.5 Series (Latest - September 2025)
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-4-5', // Alias
  
  // Claude 4 Series
  'claude-opus-4-1-20250805',
  'claude-opus-4-1', // Alias
  'claude-sonnet-4-20250514',
  'claude-sonnet-4', // Alias
  'claude-sonnet-4-0', // Alias
  'claude-opus-4-20250514',
  'claude-opus-4-0', // Alias
  
  // Claude 3.7 Series
  'claude-3-7-sonnet-20250219',
  'claude-3-7-sonnet-latest', // Alias
  
  // Claude 3.5 Series (Legacy but still available)
  'claude-3-5-haiku-20241022',
  'claude-3-5-haiku-latest', // Alias
  'claude-3-5-sonnet-20241022',
  
  // Claude 3 Series (Legacy but still available)
  'claude-3-haiku-20240307',
] as const;

export type AllowedClaudeModel = typeof ALLOWED_CLAUDE_MODELS[number];

export const DEFAULT_CLAUDE_MODEL: AllowedClaudeModel = 'claude-sonnet-4-5-20250929';

// Informational list to help UIs warn users about soon-to-be or already deprecated models
export const DEPRECATED_CLAUDE_MODELS = [
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-2.1',
  'claude-2',
  'claude-1',
  'claude-instant-1',
];

export function isAllowedClaudeModel(model: string): model is AllowedClaudeModel {
  return (ALLOWED_CLAUDE_MODELS as readonly string[]).includes(model);
}
