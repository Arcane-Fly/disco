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
  "model": "gpt-4",
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
  "model": "text-embedding-ada-002",
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

### Chat Models
- `gpt-4` - Most capable model
- `gpt-4-turbo-preview` - Latest GPT-4 with extended context
- `gpt-3.5-turbo` - Fast and cost-effective

### Embedding Models
- `text-embedding-ada-002` - Standard embedding model (1536 dimensions)
- `text-embedding-3-small` - Smaller, faster v3 model
- `text-embedding-3-large` - Larger, more accurate v3 model

## References

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Chat Completions Guide](https://platform.openai.com/docs/guides/gpt/chat-completions-api)
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Function Calling](https://platform.openai.com/docs/guides/gpt/function-calling)
