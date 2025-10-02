# Browserbase MCP Contract

## Overview
Browser automation operations for navigation, screenshots, and page interaction.

## Operations

### browserbase.navigate (v1)
**Purpose:** Navigate to a URL and capture page state.

#### Request
- `url` (string, required): URL to navigate to (must be valid URI)
- `waitUntil` (string, default: "load"): Navigation completion signal
  - `load`: Wait for load event
  - `domcontentloaded`: Wait for DOMContentLoaded event
  - `networkidle0`: Wait for no network connections for 500ms
  - `networkidle2`: Wait for max 2 network connections for 500ms
- `timeout` (integer, default: 30000): Navigation timeout in milliseconds (0-60000)
- `viewport` (object, optional): Browser viewport dimensions
  - `width` (integer, default: 1280): Viewport width (320-3840)
  - `height` (integer, default: 720): Viewport height (240-2160)

**Validates against:** `contracts/browserbase/navigate.request.json`

#### Response
- `url` (string): Final URL after navigation (may differ due to redirects)
- `title` (string): Page title
- `statusCode` (integer): HTTP status code (100-599)
- `loadTime` (number): Page load time in milliseconds
- `screenshot` (string, optional): Base64-encoded screenshot

**Validates against:** `contracts/browserbase/navigate.response.json`

#### Errors
Uses `error.envelope.json` with codes:
- `INVALID_INPUT`: Invalid URL or parameters
- `AUTH_REQUIRED`: Missing or invalid authentication
- `RATE_LIMIT`: Rate limit exceeded
- `UPSTREAM_ERROR`: Browser automation error
- `UNAVAILABLE`: Browser service unavailable
- `INTERNAL_ERROR`: Unexpected server error

#### Usage Examples
```typescript
// Basic navigation
{
  "url": "https://example.com"
}

// Wait for network idle with custom viewport
{
  "url": "https://example.com",
  "waitUntil": "networkidle2",
  "timeout": 45000,
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

---

## Version History
- **v1.0** (2024-10-02): Initial schema release
