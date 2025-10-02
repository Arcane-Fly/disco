# Pinecone MCP Contract

## Overview
Vector database operations for embedding storage and similarity search.

## Operations

### pinecone.upsert (v1)
**Purpose:** Insert or update vectors in a namespace.

#### Request
- `namespace` (string, required): The namespace to upsert vectors into
- `vectors[]` (array, required): Array of vectors with:
  - `id` (string, required): Unique identifier
  - `values` (number[], required): Vector embeddings (minimum 8 dimensions)
  - `metadata` (object, optional): Associated metadata
- `batchSize` (integer, default: 100): Batch processing size

**Validates against:** `contracts/pinecone/upsert.request.json`

#### Response
- `upsertedCount` (integer): Number of vectors successfully upserted
- `warnings[]` (string[]): Non-fatal warnings

**Validates against:** `contracts/pinecone/upsert.response.json`

#### Errors
Uses `error.envelope.json` with codes:
- `INVALID_INPUT`: Malformed request or validation failure
- `AUTH_REQUIRED`: Missing or invalid authentication
- `RATE_LIMIT`: Rate limit exceeded
- `UPSTREAM_ERROR`: Pinecone service error
- `UNAVAILABLE`: Service temporarily unavailable
- `INTERNAL_ERROR`: Unexpected server error

---

### pinecone.query (v1)
**Purpose:** Search for similar vectors.

#### Request
- `vector` (number[], required): Query vector (minimum 8 dimensions)
- `topK` (integer, required): Number of results to return (1-10000)
- `namespace` (string, optional): Namespace to query
- `filter` (object, optional): Metadata filter
- `includeMetadata` (boolean, default: false): Include metadata in results
- `includeValues` (boolean, default: false): Include vector values in results

**Validates against:** `contracts/pinecone/query.request.json`

#### Response
- `matches[]`: Array of matching vectors
  - `id` (string): Vector identifier
  - `score` (number): Similarity score (0-1)
  - `values` (number[], optional): Vector values
  - `metadata` (object, optional): Vector metadata
- `namespace` (string): Queried namespace

**Validates against:** `contracts/pinecone/query.response.json`

#### Errors
Same error codes as upsert operation.

---

## Version History
- **v1.0** (2024-10-02): Initial schema release
