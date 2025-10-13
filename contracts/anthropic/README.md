# Anthropic API Contracts

This directory contains JSON Schema definitions for Anthropic Claude API endpoints.

## Available Contracts

### Messages API
- **Request**: `messages.request.json`
- **Response**: `messages.response.json`
- **Endpoint**: `/v1/messages`
- **Description**: Generate conversational responses using Claude models

**Features**:
- Multi-turn conversations
- System prompts
- Vision support (image inputs)
- Tool use (function calling)
- Streaming support
- Temperature and sampling controls

**Example**:
```json
{
  "model": "claude-3-opus-20240229",
  "messages": [
    {
      "role": "user",
      "content": "Hello! Can you explain what quantum computing is?"
    }
  ],
  "max_tokens": 1024,
  "system": "You are a helpful AI assistant.",
  "temperature": 0.7
}
```

### Prompt Caching
- **Request**: `prompt-caching.request.json`
- **Description**: Use Anthropic's prompt caching feature for cost optimization

**Features**:
- Cache frequently used prompts
- Reduce latency and costs
- Ephemeral caching (5-minute TTL)
- Cache control on system prompts and messages

**Example**:
```json
{
  "model": "claude-3-opus-20240229",
  "system": [
    {
      "type": "text",
      "text": "You are an AI assistant...",
      "cache_control": { "type": "ephemeral" }
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "What is the meaning of life?"
    }
  ],
  "max_tokens": 1024
}
```

### Tool Use (Function Calling)
**Features**:
- Define custom tools/functions
- Claude decides when to use tools
- Structured JSON output
- Multi-step tool orchestration

**Example**: See `contracts/examples/anthropic/tool-use.example.json`

## Usage

### In Code
```typescript
import { Validator } from 'jsonschema';
import messagesRequest from './messages.request.json';

const validator = new Validator();
const result = validator.validate(requestData, messagesRequest);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Testing
See `contracts/examples/anthropic/` for complete request/response examples.

## Models

### Claude 3 Family
- `claude-3-opus-20240229` - Most capable, best for complex tasks
- `claude-3-sonnet-20240229` - Balanced performance and speed
- `claude-3-haiku-20240307` - Fastest, best for simple tasks

## Key Differences from OpenAI

1. **System Prompts**: Separate field, not in messages array
2. **Tool Use**: Different structure from OpenAI's function calling
3. **Prompt Caching**: Unique to Anthropic, not available in OpenAI
4. **Content Blocks**: Messages use structured content arrays
5. **Vision**: Native support for image inputs

## References

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference)
- [Messages API Guide](https://docs.anthropic.com/claude/reference/messages_post)
- [Prompt Caching](https://docs.anthropic.com/claude/docs/prompt-caching)
- [Tool Use Guide](https://docs.anthropic.com/claude/docs/tool-use)
- [Vision Guide](https://docs.anthropic.com/claude/docs/vision)
