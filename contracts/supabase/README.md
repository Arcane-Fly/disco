# Supabase MCP Contract

## Overview
PostgreSQL database operations with Row Level Security (RLS) support.

## Operations

### supabase.sql (v1)
**Purpose:** Execute SQL queries on Supabase database.

#### Request
- `query` (string, required): SQL query to execute
- `params` (array, optional): Parameterized query values
- `timeout` (integer, default: 30000): Query timeout in milliseconds (1000-300000)
- `readonly` (boolean, default: false): Execute in read-only mode

**Validates against:** `contracts/supabase/sql.request.json`

#### Response
- `data[]`: Array of result rows (objects)
- `rowCount` (integer): Number of rows affected or returned
- `executionTime` (number): Query execution time in milliseconds
- `warnings[]` (string[]): Non-fatal warnings

**Validates against:** `contracts/supabase/sql.response.json`

#### Errors
Uses `error.envelope.json` with codes:
- `INVALID_INPUT`: Malformed query or parameters
- `AUTH_REQUIRED`: Missing or invalid authentication
- `NOT_FOUND`: Database or table not found
- `RATE_LIMIT`: Rate limit exceeded
- `UPSTREAM_ERROR`: Database error
- `UNAVAILABLE`: Service temporarily unavailable
- `INTERNAL_ERROR`: Unexpected server error

#### Security Notes
- RLS policies are enforced based on authentication context
- Use parameterized queries to prevent SQL injection
- Read-only mode provides additional safety for query operations

---

## Version History
- **v1.0** (2024-10-02): Initial schema release
