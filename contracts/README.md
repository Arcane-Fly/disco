# MCP Server Contracts

This directory contains JSON Schema contracts for all MCP (Model Context Protocol) server operations. These schemas provide type-safe, validated interfaces between agents and MCP services.

## Purpose

**Why Contracts Matter:**
- ✅ **Predictable Interoperability**: Agents know exactly what inputs/outputs/errors to expect
- ✅ **Early Failures > Late Bugs**: Validate requests/responses at the boundary, not after a 500
- ✅ **Self-Documenting**: Discover capabilities without spelunking code
- ✅ **Safer Upgrades**: Schema diffs show what breaks when SDKs bump versions

## Directory Structure

```
contracts/
├── shared/              # Shared schemas across all services
│   └── error.envelope.json
├── pinecone/           # Vector database operations
│   ├── README.md
│   ├── upsert.request.json
│   ├── upsert.response.json
│   ├── query.request.json
│   └── query.response.json
├── supabase/           # Database operations
│   ├── README.md
│   ├── sql.request.json
│   └── sql.response.json
├── browserbase/        # Browser automation
│   ├── README.md
│   ├── navigate.request.json
│   └── navigate.response.json
├── github/             # GitHub API operations
│   ├── README.md
│   ├── searchIssues.request.json
│   └── searchIssues.response.json
└── examples/           # Example valid requests/responses
    ├── pinecone.upsert.example.json
    ├── pinecone.query.example.json
    ├── supabase.sql.example.json
    ├── browserbase.navigate.example.json
    ├── github.searchIssues.example.json
    └── error.example.json
```

## Contract Components

Each MCP operation defines:

1. **Request Schema**: Input parameters, types, validation rules
2. **Response Schema**: Output structure, success data format
3. **Error Envelope**: Standardized error codes and messages (shared across all operations)
4. **Documentation**: README with usage examples and version history

## Error Codes

All operations use the standard error envelope (`shared/error.envelope.json`) with these codes:

- `INVALID_INPUT`: Malformed request or validation failure
- `AUTH_REQUIRED`: Missing or invalid authentication
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT`: Rate limit exceeded (retriable)
- `UPSTREAM_ERROR`: Third-party service error
- `UNAVAILABLE`: Service temporarily unavailable (retriable)
- `INTERNAL_ERROR`: Unexpected server error

## Usage

### TypeScript (with Ajv)

```typescript
import { ContractValidator, validateRequest, validateResponse } from './src/lib/contractValidator';

// Initialize validator
const validator = new ContractValidator();

// Validate a Pinecone upsert request
const request = {
  namespace: "default",
  vectors: [
    {
      id: "vec1",
      values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
      metadata: { source: "doc-123" }
    }
  ],
  batchSize: 100
};

try {
  validator.validateRequest(request, 'pinecone', 'upsert');
  // Request is valid, proceed with operation
} catch (error) {
  // Handle validation error
  console.error(error.message);
}

// Or use the validateOperation wrapper for full request/response validation
const response = await validator.validateOperation(
  'pinecone',
  'upsert',
  request,
  async (req) => {
    // Your implementation here
    return await pineconeClient.upsert(req);
  }
);
```

### Helper Functions

```typescript
import { validateRequest, validateResponse, createErrorEnvelope, ErrorCode } from './src/lib/contractValidator';

// Quick validation
validateRequest(data, 'github', 'searchIssues');
validateResponse(result, 'supabase', 'sql');

// Create standardized errors
const error = createErrorEnvelope(
  ErrorCode.RATE_LIMIT,
  'Rate limit exceeded: 100 requests per minute',
  true, // retriable
  { limit: 100, window: '1m', retryAfter: 45 }
);
```

## Testing

Example fixtures in `contracts/examples/` demonstrate valid request/response pairs for each operation. Use these for:

1. **Unit Tests**: Validate your implementation against known-good data
2. **Integration Tests**: Test actual API calls match the schema
3. **Documentation**: Show developers what valid payloads look like

## Schema Validation in CI

To validate all example fixtures against their schemas:

```bash
yarn test:contracts
```

This ensures:
- All schemas are valid JSON Schema
- Example fixtures match their respective schemas
- No breaking changes to existing contracts

## Versioning

Contracts follow semantic versioning:
- **Major**: Breaking changes to request/response structure
- **Minor**: Backward-compatible additions (new optional fields)
- **Patch**: Documentation updates, clarifications

Each contract README documents version history and migration notes.

## Adding New Contracts

To add a new MCP service contract:

1. Create a new directory: `contracts/new-service/`
2. Add request schema: `new-service/operation.request.json`
3. Add response schema: `new-service/operation.response.json`
4. Create README: `new-service/README.md` (document all operations)
5. Add examples: `examples/new-service.operation.example.json`
6. Update this README to list the new service

## References

- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/schema)
- [Ajv JSON Schema Validator](https://ajv.js.org/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Last Updated**: 2024-10-02  
**Contract Version**: 1.0.0  
**Schema Standard**: JSON Schema Draft 2020-12
