# MCP Contract Schemas Documentation

## Overview

The Disco MCP Server implements JSON Schema-based contracts for all Model Context Protocol (MCP) operations. This provides type-safe validation, standardized error handling, and self-documenting APIs across all integrated services.

## Purpose

### Why Contract Schemas Matter

1. **Predictable Interoperability**: Agents know exactly what inputs/outputs/errors to expect
2. **Early Failure Detection**: Validation at API boundary catches errors in milliseconds vs seconds/minutes
3. **Self-Documenting**: JSON Schemas serve as living documentation
4. **Safer Upgrades**: Schema diffs show exactly what breaks when updating dependencies
5. **Contract Testing**: Example fixtures enable automated testing in CI/CD pipelines

## Architecture

### Directory Structure

```
contracts/
├── README.md                           # Main contracts documentation
├── IMPLEMENTATION_SUMMARY.md           # Technical implementation details
├── shared/                             # Shared schemas
│   └── error.envelope.json             # Standard error response format
├── pinecone/                           # Vector database contracts
│   ├── README.md
│   ├── upsert.request.json
│   ├── upsert.response.json
│   ├── query.request.json
│   └── query.response.json
├── supabase/                           # Database contracts
│   ├── README.md
│   ├── sql.request.json
│   └── sql.response.json
├── browserbase/                        # Browser automation contracts
│   ├── README.md
│   ├── navigate.request.json
│   └── navigate.response.json
├── github/                             # GitHub API contracts
│   ├── README.md
│   ├── searchIssues.request.json
│   └── searchIssues.response.json
└── examples/                           # Example fixtures
    ├── pinecone.upsert.example.json
    ├── pinecone.query.example.json
    ├── supabase.sql.example.json
    ├── browserbase.navigate.example.json
    ├── github.searchIssues.example.json
    └── error.example.json
```

## Supported Services

### 1. Pinecone (Vector Database)

**Operations:**
- `upsert`: Insert or update vectors in a namespace
- `query`: Search for similar vectors

**Documentation:** [contracts/pinecone/README.md](../contracts/pinecone/README.md)

### 2. Supabase (Database)

**Operations:**
- `sql`: Execute SQL queries with RLS support

**Documentation:** [contracts/supabase/README.md](../contracts/supabase/README.md)

### 3. Browserbase (Browser Automation)

**Operations:**
- `navigate`: Navigate to URLs and capture page state

**Documentation:** [contracts/browserbase/README.md](../contracts/browserbase/README.md)

### 4. GitHub (API Operations)

**Operations:**
- `searchIssues`: Search for issues across repositories

**Documentation:** [contracts/github/README.md](../contracts/github/README.md)

## Error Handling

All operations use a standardized error envelope defined in `contracts/shared/error.envelope.json`.

### Error Codes

| Code | Description | Retriable |
|------|-------------|-----------|
| `INVALID_INPUT` | Malformed request or validation failure | No |
| `AUTH_REQUIRED` | Missing or invalid authentication | No |
| `NOT_FOUND` | Resource not found | No |
| `RATE_LIMIT` | Rate limit exceeded | Yes |
| `UPSTREAM_ERROR` | Third-party service error | Maybe |
| `UNAVAILABLE` | Service temporarily unavailable | Yes |
| `INTERNAL_ERROR` | Unexpected server error | No |

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Human-readable error message",
    "retriable": false,
    "details": {
      "field": "namespace",
      "constraint": "required"
    }
  }
}
```

## Runtime Validation

### TypeScript Validator

The `src/lib/contractValidator.ts` module provides runtime validation using Ajv:

```typescript
import { ContractValidator } from './src/lib/contractValidator';

const validator = new ContractValidator();

// Validate individual requests/responses
validator.validateRequest(data, 'pinecone', 'upsert');
validator.validateResponse(result, 'pinecone', 'upsert');

// Or wrap entire operations
const response = await validator.validateOperation(
  'pinecone',
  'upsert',
  request,
  async (req) => {
    return await pineconeClient.upsert(req);
  }
);
```

### Dependencies

- `ajv` ^8.17.1 - JSON Schema validator
- `ajv-formats` ^3.0.1 - Format validators (URI, date-time)

## API Endpoints

### Demo Endpoints

Live demonstration endpoints with validation are available at `/api/v1/contract-demo/*`:

- `POST /api/v1/contract-demo/pinecone/upsert`
- `POST /api/v1/contract-demo/pinecone/query`
- `POST /api/v1/contract-demo/supabase/sql`
- `POST /api/v1/contract-demo/browserbase/navigate`
- `POST /api/v1/contract-demo/github/searchIssues`
- `GET /api/v1/contract-demo/:service/:operation/:type` - Get schema
- `GET /api/v1/contract-demo/contracts` - List all contracts

### Example Request

```bash
curl -X POST https://disco-mcp.up.railway.app/api/v1/contract-demo/pinecone/upsert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "default",
    "vectors": [{
      "id": "vec1",
      "values": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
    }]
  }'
```

## Testing

### Running Tests

```bash
# Run contract validation tests
yarn test:contracts

# Expected output: 27 tests passing in <2 seconds
```

### Test Coverage

- ✅ Valid request/response acceptance
- ✅ Invalid input rejection with detailed errors
- ✅ Error envelope validation
- ✅ Complete operation flow
- ✅ Edge cases and constraints

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/contract-validation.yml` workflow automatically:

1. Validates JSON Schema syntax
2. Runs all contract tests
3. Validates example fixtures
4. Checks for breaking changes (in PRs)
5. Generates validation report
6. Comments on PRs with results

### Triggering Validation

Validation runs automatically on:
- Push to any branch (when contract files change)
- Pull requests (when contract files change)

## Railway Deployment Best Practices

### Integration with Railway

The contract validation system is designed to work seamlessly with Railway deployment:

1. **Build Integration**: Contracts are validated during the build phase
2. **Runtime Validation**: All API requests are validated before processing
3. **Error Handling**: Standardized error responses across all services
4. **Health Checks**: Demo endpoints support health monitoring

### Environment Configuration

No additional environment variables required for basic contract validation.

For production deployment with actual MCP services:

```bash
# Pinecone
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=your_environment

# Supabase
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key

# Browserbase
BROWSERBASE_API_KEY=your_api_key

# GitHub
GITHUB_TOKEN=your_personal_access_token
```

## Extending the System

### Adding New Operations

1. Create request/response schemas in `contracts/{service}/`
2. Add example fixtures in `contracts/examples/`
3. Update service README
4. Add tests in `test/contract-validation.test.ts`
5. Optionally add demo endpoint in `src/api/contract-demo.ts`

### Schema Versioning

Contracts follow semantic versioning:

- **Major**: Breaking changes to request/response structure
- **Minor**: Backward-compatible additions (new optional fields)
- **Patch**: Documentation updates, clarifications

## Resources

### Internal Documentation

- [Main Contracts README](../contracts/README.md)
- [Implementation Summary](../contracts/IMPLEMENTATION_SUMMARY.md)
- [Railway Deployment Guide](./RAILWAY_DEPLOYMENT_FIX.md)

### External References

- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/schema) - Official spec
- [Ajv Documentation](https://ajv.js.org/) - Validator documentation
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification

## Support

For issues or questions:

1. Check the [contracts README](../contracts/README.md) for detailed usage
2. Review example fixtures in `contracts/examples/`
3. Run tests with `yarn test:contracts` to verify setup
4. Check CI/CD logs for validation errors

---

**Last Updated**: 2024-10-02  
**Version**: 1.0.0  
**Status**: Production Ready ✅
