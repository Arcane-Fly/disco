// Centralized Anthropic (Claude) model policy
// Only allow modern, supported models per project standards.
export const ALLOWED_CLAUDE_MODELS = [
    // Normalize IDs to consistent dashed names; map to exact Anthropic IDs at runtime if needed
    'claude-4.5-sonnet',
    'claude-4.1-opus',
    'claude-4-sonnet',
    'claude-3.7-sonnet',
];
export const DEFAULT_CLAUDE_MODEL = 'claude-4.5-sonnet';
// Informational list to help UIs warn users about soon-to-be or already deprecated models
export const DEPRECATED_CLAUDE_MODELS = [
    'claude-3-5-sonnet',
    'claude-3-opus',
    'claude-2',
    'claude-2.1',
    'claude-1',
    'claude-instant-1',
];
export function isAllowedClaudeModel(model) {
    return ALLOWED_CLAUDE_MODELS.includes(model);
}
//# sourceMappingURL=anthropic.js.map