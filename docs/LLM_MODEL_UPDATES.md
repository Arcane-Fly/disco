# LLM Model Updates - December 2025

## Overview
Updated all AI model configurations to the latest versions available as of December 2025, including Claude 4.5, GPT-5.2, and Gemini 3 families.

## Claude 4.5 (Anthropic)

### New Models Added
- `claude-haiku-4-5-20251001` - Fastest and most intelligent Haiku model
  - Near-frontier performance
  - First Haiku with extended thinking
  - Optimized for real-time applications
- `claude-haiku-4-5` - Alias for latest Haiku 4.5

### Key Features
- Best-in-class reasoning and coding
- Long-running agent capabilities
- Tool use and streaming support
- Vision capabilities
- Extended thinking mode

### Default Model
`claude-sonnet-4-5-20250929` - Optimal balance of intelligence and performance

## GPT-5.2 (OpenAI)

### New Models Added
- `gpt-5.2` - Core model (400K context, 128K output)
  - Best for complex reasoning and coding
  - Knowledge cutoff: August 31, 2025
- `gpt-5.2-pro` - Enhanced precision
  - Uses more compute for better answers
- `gpt-5.2-instant` - Speed-optimized
  - Fast everyday tasks
- `gpt-5.2-thinking` - Deep reasoning
  - Complex queries and planning

### Key Features
- 400,000 token context window
- 128,000 token output limit
- Reasoning effort control (none/low/medium/high/xhigh)
- Function calling and structured outputs
- Tool calling: web search, file search, image generation, code interpreter
- Multimodal: text and image input

### Pricing (per million tokens)
- Input: $1.75
- Cached input: $0.175
- Output: $14.00

### Default Model
`gpt-5.2` - Optimal for most use cases

## Gemini 3 (Google)

### New Models Added
- `gemini-3-pro-preview` - Preview: Advanced capabilities
- `gemini-3-flash-preview` - Preview: Fast and efficient
- `gemini-2.5-pro` - Stable: Complex reasoning and multimodal
- `gemini-2.5-flash` - Stable: Fast, efficient, general purpose
- `gemini-2.5-flash-lite` - Stable: Lightweight, optimized for speed

### Specialized Agent
- `deep-research-pro-preview-12-2025` - Advanced research capabilities

### Key Features
- 1,048,576 token context limit (1M tokens)
- 65,536 token output limit
- Multimodal: text, image, video, audio, PDF
- Batch API, caching, code execution
- File search, function calling, search grounding
- Structured outputs, thinking mode
- URL context support

### Default Model
`gemini-2.5-flash` - Best balance of speed and capability

## Migration Guide

### From Claude 3.x to 4.5
```typescript
// Old
model: 'claude-3-5-sonnet-20241022'

// New
model: 'claude-sonnet-4-5-20250929'
```

### From GPT-4/GPT-5 to GPT-5.2
```typescript
// Old
model: 'gpt-4.1-nano'

// New
model: 'gpt-5.2' // or 'gpt-5.2-instant' for faster responses
```

### From Gemini Pro to Gemini 3
```typescript
// Old
model: 'gemini-pro'

// New
model: 'gemini-2.5-flash' // or 'gemini-3-flash-preview' for latest
```

## API Changes

### Provider Policy Endpoint
```bash
GET /api/v1/providers/policy
```

Response now includes all three providers:
```json
{
  "anthropic": {
    "default": "claude-sonnet-4-5-20250929",
    "allowed": [...],
    "deprecated": [...]
  },
  "openai": {
    "default": "gpt-5.2",
    "allowed": [...]
  },
  "google": {
    "default": "gemini-2.5-flash",
    "allowed": [...]
  }
}
```

## Files Modified

### Configuration Files
- `src/config/anthropic.ts` - Updated with Claude 4.5 Haiku
- `src/config/openai.ts` - Added GPT-5.2 family
- `src/config/gemini.ts` - **NEW** - Complete Gemini 3 configuration
- `src/config/index.ts` - Added Gemini exports

### API Files
- `src/api/providers.ts` - Updated provider models and capabilities

## Compatibility

All new models maintain backward compatibility with existing APIs. Legacy model names are preserved for gradual migration.

### Deprecated Models (Still Available)
- Claude: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`
- OpenAI: `gpt-3.5-turbo`, `gpt-4o`, `gpt-4o-mini`
- Gemini: `gemini-1.0-pro`, `gemini-ultra`

## Performance Improvements

### Claude 4.5
- 2x faster for complex coding tasks
- Enhanced vision capabilities
- Improved reasoning accuracy

### GPT-5.2
- 400K context (4x increase from GPT-4)
- Better factual accuracy
- Reduced hallucinations
- Improved multilingual support

### Gemini 3
- New API parameters for latency/cost/fidelity control
- Enhanced multimodal processing
- Better structured output support

## References

- [Claude 4.5 Release Notes](https://docs.claude.com/en/docs/about-claude/models/whats-new-claude-4-5)
- [GPT-5.2 Documentation](https://platform.openai.com/docs/models/gpt-5.2)
- [Gemini 3 API Documentation](https://ai.google.dev/gemini-api/docs/gemini-3)

---

**Updated:** December 23, 2024
**Commit:** 42177be
