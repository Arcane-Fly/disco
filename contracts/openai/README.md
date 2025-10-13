# OpenAI API Contracts

This directory contains JSON Schema definitions for OpenAI API endpoints.

## Available Contracts

### Chat Completions
- **Request**: `chat-completions.request.json`
- **Response**: `chat-completions.response.json`
- **Endpoint**: `/v1/chat/completions`
- **Description**: Generate conversational responses using GPT models

**Features**:
- Multiple message turns (conversation history)
- System prompts for behavior guidance
- Temperature and sampling controls
- Streaming support
- Function calling

**Example**:
```json
{
  "model": "gpt-4.1",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
```

### Embeddings
- **Request**: `embeddings.request.json`
- **Response**: `embeddings.response.json`
- **Endpoint**: `/v1/embeddings`
- **Description**: Generate vector embeddings for text

**Features**:
- Single or batch text input
- Multiple embedding models
- Configurable output dimensions (v3 models)
- Base64 or float output format

**Example**:
```json
{
  "model": "text-embedding-3-small",
  "input": "The food was delicious and the waiter was very friendly."
}
```

## Usage

### In Code
```typescript
import { Validator } from 'jsonschema';
import chatCompletionsRequest from './chat-completions.request.json';

const validator = new Validator();
const result = validator.validate(requestData, chatCompletionsRequest);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Testing
See `contracts/examples/openai/` for complete request/response examples.

## Models

> **⚠️ Note**: Only current models from 2025 as specified in MODEL_MANIFEST.md should be used.

### Chat Models (GPT-5 Series - Latest 2025)
- `gpt-5` - Best model for coding and agentic tasks
- `gpt-5-mini` - Faster, cost-efficient version
- `gpt-5-nano` - Fastest, most cost-efficient
- `gpt-5-codex` - Optimized for agentic coding

### Chat Models (GPT-4.1 Series - Current Recommended)
- `gpt-4.1` - Smartest non-reasoning model (1M context)
- `gpt-4.1-mini` - Smaller, faster, balanced (1M context)
- `gpt-4.1-nano` - Fastest, most cost-efficient (1M context)

### Reasoning Models (o-series)
- `o3-pro` - Extended reasoning for toughest problems
- `o3` - Advanced reasoning for complex problems
- `o4-mini` - Fast, affordable reasoning
- `o1` - Chain-of-thought reasoning

### Embedding Models
- `text-embedding-3-large` - Most capable embedding model
- `text-embedding-3-small` - Efficient embedding model

### ⚠️ Deprecated Models (DO NOT USE)
- ~~gpt-4-turbo~~ → Use `gpt-4.1`
- ~~gpt-4~~ → Use `gpt-4.1`
- ~~gpt-3.5-turbo~~ → Use `gpt-4.1-nano` or `gpt-5-nano`
- ~~text-embedding-ada-002~~ → Use `text-embedding-3-small` or `text-embedding-3-large`

## References

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Chat Completions Guide](https://platform.openai.com/docs/guides/gpt/chat-completions-api)
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Function Calling](https://platform.openai.com/docs/guides/gpt/function-calling)
