# GitHub MCP Contract

## Overview
GitHub API operations for issue search, pull requests, and repository management.

## Operations

### github.searchIssues (v1)
**Purpose:** Search for issues across GitHub repositories.

#### Request
- `query` (string, required): GitHub search query string
- `sort` (string, optional): Sort field
  - `comments`: Sort by comment count
  - `reactions`: Sort by reaction count
  - `reactions-+1`: Sort by +1 reactions
  - `created`: Sort by creation date
  - `updated`: Sort by last update date
- `order` (string, default: "desc"): Sort order (`asc` or `desc`)
- `perPage` (integer, default: 30): Results per page (1-100)
- `page` (integer, default: 1): Page number for pagination

**Validates against:** `contracts/github/searchIssues.request.json`

#### Response
- `totalCount` (integer): Total number of matching issues
- `items[]`: Array of matching issues
  - `id` (integer): Issue ID
  - `number` (integer): Issue number
  - `title` (string): Issue title
  - `state` (string): Issue state (`open` or `closed`)
  - `url` (string): Issue URL
  - `body` (string, optional): Issue description
  - `labels[]` (string[], optional): Issue labels
  - `createdAt` (string, optional): Creation timestamp (ISO 8601)
  - `updatedAt` (string, optional): Last update timestamp (ISO 8601)
- `pagination` (object, optional): Pagination metadata
  - `page` (integer): Current page number
  - `perPage` (integer): Results per page
  - `hasNextPage` (boolean): Whether more pages exist

**Validates against:** `contracts/github/searchIssues.response.json`

#### Errors
Uses `error.envelope.json` with codes:
- `INVALID_INPUT`: Invalid query syntax
- `AUTH_REQUIRED`: Missing or invalid authentication
- `RATE_LIMIT`: GitHub API rate limit exceeded (retriable: true)
- `UPSTREAM_ERROR`: GitHub API error
- `UNAVAILABLE`: GitHub service unavailable
- `INTERNAL_ERROR`: Unexpected server error

#### Usage Examples
```typescript
// Basic search
{
  "query": "is:issue is:open label:bug"
}

// Advanced search with pagination
{
  "query": "repo:owner/repo is:issue state:open",
  "sort": "updated",
  "order": "desc",
  "perPage": 50,
  "page": 2
}
```

---

## Version History
- **v1.0** (2024-10-02): Initial schema release
