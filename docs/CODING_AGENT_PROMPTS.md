# Coding Agent Prompts - Solo Developer Implementation Guide

**Generated**: 2025-01-07  
**For**: Solo developer using coding agents  
**Project**: Disco MCP Server (uses Nx build system)

---

## 📋 Overview

This document provides a series of detailed prompts you can use with coding agents (like Cursor, Copilot, Claude, etc.) to systematically address all outstanding tasks identified in the documentation review. Each prompt is self-contained and includes Nx-specific commands.

**Project Context**:
- ✅ **Uses Nx 21.6.3** for monorepo management and caching
- ✅ Build commands: `nx run-many --target=build --all`
- ✅ Test commands: `nx run-many --target=test --all`
- ✅ Lint commands: `nx run-many --target=lint --all`
- ✅ Cache directory: `.nx/cache`

---

## 🎯 Quick Start - Week 1 Tasks (15-20 hours)

These tasks provide immediate wins and establish a clean foundation.

### Prompt 1: Fix TypeScript Errors in Test Files (3 hours)

```
I need you to fix 8 TypeScript compilation errors in the test files. This project uses Nx for builds.

CONTEXT:
- Project uses Nx 21.6.3 with TypeScript
- There are 8 errors in test files (test/api-integration.test.ts, test/auth-workflow.test.ts, test/setup.ts, test/test-env.ts, test/ultimate-mcp-integration.test.ts)
- Errors are: "Cannot assign to 'NODE_ENV' because it is a read-only property" and "Cannot find name 'app'"

TASK:
1. Run `yarn tsc --noEmit` to see all TypeScript errors
2. Fix the NODE_ENV assignment errors (5 occurrences) by using:
   ```typescript
   Object.defineProperty(process.env, 'NODE_ENV', {
     value: 'test',
     writable: true
   });
   ```
3. Fix the missing 'app' references (3 occurrences) by properly importing/defining the app variable
4. Verify fixes with `yarn tsc --noEmit` - should show 0 errors
5. Run tests with `nx run-many --target=test --all` to ensure they still pass
6. Do NOT modify any production source files, only test files

NX COMMANDS TO USE:
- Check types: `yarn tsc --noEmit`
- Run tests: `nx run-many --target=test --all`
- Run specific project tests: `nx test server`

DELIVERABLES:
- All 8 TypeScript errors resolved
- All tests passing
- No changes to production code
```

### Prompt 2: Resolve TODO Comments (2 hours)

```
I need you to review and resolve 7 TODO comments found in the codebase. This project uses Nx.

CONTEXT:
- Project: Disco MCP Server
- Found 7 TODO comments in:
  - src/lib/enhanced-rag.ts (3 TODOs)
  - src/features/auth/routes/auth-fixed.ts (4 TODOs)

TASK:
1. Review each file and determine if the feature is:
   - Needed and incomplete → Implement it
   - Not needed → Remove the file or stub
   - Future work → Create GitHub issue and link in comment

2. For enhanced-rag.ts:
   - If RAG features are not being used, remove the file
   - If needed, implement the placeholder functions
   - Decision criteria: Check if it's imported/used anywhere

3. For auth-fixed.ts:
   - Determine if this is a duplicate of existing auth
   - If duplicate, remove the file
   - If intended replacement, complete implementation
   - If future work, create issue and update TODO

4. Run build after changes: `nx run-many --target=build --all`
5. Run tests: `nx run-many --target=test --all`

NX COMMANDS TO USE:
- Search for imports: `grep -r "enhanced-rag\|auth-fixed" src/`
- Build: `nx run-many --target=build --all`
- Test: `nx run-many --target=test --all`
- Lint: `nx run-many --target=lint --all --fix`

DELIVERABLES:
- 0 TODO comments remaining OR converted to GitHub issues
- Build passing
- Tests passing
- No broken imports
```

### Prompt 3: Implement Automatic Token Refresh (4 hours)

```
I need you to implement automatic JWT token refresh in the frontend to prevent the 1-hour token expiration from disrupting user workflow. This project uses Nx with Next.js frontend.

CONTEXT:
- Current: JWT tokens expire after 1 hour, requiring manual re-authentication
- Backend: Already has JWT infrastructure in src/features/auth/
- Frontend: Next.js app in frontend/ directory
- Nx project name: "frontend"

TASK:
1. Create a token refresh utility in the frontend:
   - File: `frontend/src/lib/auth/tokenRefresh.ts`
   - Function: `setupTokenRefresh()` that checks token expiry every minute
   - Refresh tokens 15 minutes before expiration
   - Store refresh tokens securely in httpOnly cookies or secure storage

2. Implement refresh endpoint if not exists:
   - Backend: `POST /api/v1/auth/refresh`
   - Accept refresh token
   - Return new access token and refresh token

3. Integrate into frontend app:
   - Call `setupTokenRefresh()` on app initialization
   - Update auth context to handle refresh
   - Add error handling for failed refresh (logout user)

4. Add monitoring:
   - Log refresh attempts
   - Track refresh success/failure rates

5. Test the implementation:
   - Build frontend: `nx build frontend`
   - Run frontend: `nx serve frontend`
   - Test token refresh flow manually
   - Verify tokens are refreshed before expiry

NX COMMANDS TO USE:
- Build frontend: `nx build frontend`
- Serve frontend: `nx serve frontend`
- Build all: `nx run-many --target=build --all`
- Test all: `nx run-many --target=test --all`

DELIVERABLES:
- Working automatic token refresh
- No manual re-authentication required during session
- Error handling for failed refresh
- Documentation of the implementation
```

### Prompt 4: Create Callback URL Configuration Guide (2 hours)

```
I need you to create comprehensive documentation for callback URL configuration across different environments.

CONTEXT:
- Users struggle with GitHub OAuth callback URL setup
- Different URLs needed for local/staging/production
- CORS configuration is unclear
- Project uses Railway for production deployment

TASK:
1. Create documentation file: `docs/CALLBACK_URL_CONFIGURATION_GUIDE.md`

2. Include these sections:
   a. Overview of callback URLs and why they're needed
   b. Environment-specific configurations:
      - Local development (localhost:3000)
      - Staging environment
      - Production (Railway)
   c. GitHub OAuth app setup with multiple callback URLs
   d. CORS configuration for each environment
   e. Troubleshooting common issues
   f. Code examples for .env files

3. Create example .env files:
   - `.env.local.example` - Local development
   - `.env.staging.example` - Staging
   - `.env.production.example` - Production

4. Add validation examples:
   - Show how to test callback URLs
   - cURL examples for testing

5. Link from main docs/README.md

NO NX COMMANDS NEEDED (documentation only)

DELIVERABLES:
- Complete callback URL configuration guide
- 3 example .env files
- Updated docs/README.md with links
- Troubleshooting section
```

### Prompt 5: Create Callback URL Validator Tool (3 hours)

```
I need you to create a command-line tool to validate callback URL configuration. This project uses Nx.

CONTEXT:
- Users often misconfigure callback URLs
- Need validation before deployment
- Should check environment variables and CORS settings

TASK:
1. Create validation script: `scripts/validate-callback-urls.ts`

2. Implement these validations:
   - Check AUTH_CALLBACK_URL is set
   - Validate URL format
   - Check ALLOWED_ORIGINS includes callback domain
   - Verify GitHub OAuth app callback URLs (if possible)
   - Test CORS preflight requests
   - Validate JWT_SECRET is set

3. Add npm script to package.json:
   ```json
   "validate:callbacks": "tsx scripts/validate-callback-urls.ts"
   ```

4. Output format:
   - ✅ or ❌ for each check
   - Detailed error messages with solutions
   - Summary report at the end

5. Add to CI/CD if appropriate:
   - Update .github/workflows/ to run validation

6. Test the tool:
   - Run with valid config: `yarn validate:callbacks`
   - Run with invalid config to test error messages
   - Verify all edge cases

NX COMMANDS TO USE:
- Build: `nx run-many --target=build --all`
- Test validator: `yarn validate:callbacks`

DELIVERABLES:
- Working validation script
- npm script added
- Clear error messages with solutions
- Documentation in script comments
```

---

## ⚡ High Priority - Weeks 2-4 (80-100 hours)

### Prompt 6: Build OAuth Setup Wizard UI (8 hours)

```
I need you to create an interactive OAuth setup wizard for the frontend that guides users through GitHub OAuth configuration. This project uses Nx with Next.js frontend.

CONTEXT:
- Current OAuth setup takes 30+ minutes and has high abandonment
- Target: Reduce to under 5 minutes
- Need step-by-step wizard with validation
- Frontend: Next.js in frontend/ directory

TASK:
1. Create wizard component: `frontend/src/components/setup/OAuthWizard.tsx`

2. Implement 5 steps:
   - Step 1: GitHub App Creation (visual guide with screenshots)
   - Step 2: Callback URL Configuration (pre-filled values)
   - Step 3: Environment Variables (copy-paste ready)
   - Step 4: Connection Test (automated validation)
   - Step 5: Success Confirmation

3. Add features:
   - Progress indicator
   - Copy-to-clipboard buttons
   - Automatic validation at each step
   - Error messages with solutions
   - "Test Connection" button

4. Create API endpoints for validation:
   - `POST /api/v1/auth/validate-config` - Check OAuth config
   - `POST /api/v1/auth/test-connection` - Test OAuth flow

5. Add route: `/setup/oauth` in Next.js

6. Build and test:
   - Build frontend: `nx build frontend`
   - Serve: `nx serve frontend`
   - Test wizard flow end-to-end
   - Verify mobile responsiveness

NX COMMANDS TO USE:
- Build frontend: `nx build frontend`
- Serve frontend: `nx serve frontend`
- Build all: `nx run-many --target=build --all`
- Lint: `nx lint frontend --fix`

DELIVERABLES:
- Complete OAuth wizard component
- 2 new API endpoints
- Setup route at /setup/oauth
- Mobile-responsive design
- Documentation for the wizard
```

### Prompt 7: Implement OpenAI Contract Schemas (8 hours)

```
I need you to create JSON Schema contracts for OpenAI API operations following the existing pattern. This project uses Nx and has contract validation.

CONTEXT:
- Project has contract schemas in contracts/ directory
- Existing: Pinecone, Supabase, Browserbase, GitHub
- Need: OpenAI contracts (chat completions, embeddings, fine-tuning, assistants)
- Pattern: Use shared error.envelope.json

TASK:
1. Create directory: `contracts/openai/`

2. Create these schema files:
   a. `contracts/openai/chat-completions.request.json`
   b. `contracts/openai/chat-completions.response.json`
   c. `contracts/openai/embeddings.request.json`
   d. `contracts/openai/embeddings.response.json`
   e. `contracts/openai/fine-tuning.request.json`
   f. `contracts/openai/fine-tuning.response.json`
   g. `contracts/openai/assistants.request.json`
   h. `contracts/openai/assistants.response.json`

3. Follow existing pattern:
   - Use $schema reference
   - Include $id for each schema
   - Use shared error envelope
   - Add comprehensive examples

4. Create example fixtures: `contracts/openai/examples/`
   - chat-completions-example.json
   - embeddings-example.json
   - etc.

5. Create README: `contracts/openai/README.md`
   - Describe each operation
   - Include usage examples
   - Add version history

6. Run contract validation tests:
   - Update test/contract-validation.test.ts
   - Add tests for new OpenAI schemas
   - Run: `yarn test:contracts`

7. Build project: `nx run-many --target=build --all`

NX COMMANDS TO USE:
- Test contracts: `yarn test:contracts`
- Build: `nx run-many --target=build --all`
- Test all: `nx run-many --target=test --all`

DELIVERABLES:
- 8 JSON schema files
- Example fixtures for each operation
- README documentation
- Updated test suite with 10+ new tests
- All tests passing
```

### Prompt 8: Implement OpenAI API Endpoints (10 hours)

```
I need you to implement API endpoints for OpenAI operations using the contract schemas created in Prompt 7. This project uses Nx with Express backend.

CONTEXT:
- Backend: Express in src/
- Contract schemas: contracts/openai/*.json
- Pattern: Follow existing providers in src/api/providers.ts
- Need runtime validation using contractValidator

TASK:
1. Create OpenAI provider file: `src/api/openai.ts`

2. Implement these endpoints:
   - POST /api/v1/openai/chat/completions
   - POST /api/v1/openai/embeddings
   - POST /api/v1/openai/fine-tuning/jobs
   - GET /api/v1/openai/fine-tuning/jobs/:id
   - POST /api/v1/openai/assistants
   - GET /api/v1/openai/assistants/:id

3. Add features:
   - Runtime validation using contractValidator
   - Streaming support for chat completions
   - Function calling support
   - Rate limiting
   - Error handling with proper status codes

4. Integration:
   - Add to main server.ts
   - Add OpenAI API key env variable
   - Update openapi.json specification

5. Create tests: `test/openai-integration.test.ts`
   - Test each endpoint
   - Test validation
   - Test error handling
   - Mock OpenAI API responses

6. Build and test:
   - Build: `nx build server`
   - Test: `nx test server`
   - Run: `yarn start` and test endpoints with curl

NX COMMANDS TO USE:
- Build server: `nx build server`
- Test server: `nx test server`
- Build all: `nx run-many --target=build --all`
- Test all: `nx run-many --target=test --all`
- Lint: `nx lint server --fix`

DELIVERABLES:
- Complete OpenAI provider with 6+ endpoints
- Streaming support for chat
- Test suite with 15+ tests
- Updated OpenAPI specification
- All tests passing
```

### Prompt 9: Implement Anthropic Contract Schemas (8 hours)

```
I need you to create JSON Schema contracts for Anthropic Claude API operations. This project uses Nx and follows the same pattern as OpenAI contracts.

CONTEXT:
- Just completed OpenAI contracts (reference those)
- Need Anthropic Claude API contracts
- Operations: completions, prompt caching, batch API, tool use

TASK:
1. Create directory: `contracts/anthropic/`

2. Create these schema files:
   a. `contracts/anthropic/completions.request.json`
   b. `contracts/anthropic/completions.response.json`
   c. `contracts/anthropic/prompt-caching.request.json`
   d. `contracts/anthropic/prompt-caching.response.json`
   e. `contracts/anthropic/batch-api.request.json`
   f. `contracts/anthropic/batch-api.response.json`
   g. `contracts/anthropic/tool-use.request.json`
   h. `contracts/anthropic/tool-use.response.json`

3. Anthropic-specific features:
   - Include vision capabilities in completions
   - Document prompt caching for cost optimization
   - Add batch API with job management
   - Include tool use (function calling) schemas

4. Create example fixtures: `contracts/anthropic/examples/`

5. Create README: `contracts/anthropic/README.md`

6. Update test suite:
   - Add tests in test/contract-validation.test.ts
   - Test all Anthropic schemas
   - Run: `yarn test:contracts`

NX COMMANDS TO USE:
- Test contracts: `yarn test:contracts`
- Build: `nx run-many --target=build --all`

DELIVERABLES:
- 8 JSON schema files
- Example fixtures
- README documentation
- Test suite with 10+ new tests
- All tests passing
```

### Prompt 10: Implement Anthropic API Endpoints (10 hours)

```
I need you to implement API endpoints for Anthropic Claude API using the contract schemas. This project uses Nx with Express backend.

CONTEXT:
- Backend: Express in src/
- Contract schemas: contracts/anthropic/*.json
- Reference: OpenAI provider implementation
- Need streaming and tool use support

TASK:
1. Create Anthropic provider file: `src/api/anthropic.ts`

2. Implement these endpoints:
   - POST /api/v1/anthropic/completions
   - POST /api/v1/anthropic/cache/prompt
   - POST /api/v1/anthropic/batch
   - GET /api/v1/anthropic/batch/:id
   - POST /api/v1/anthropic/tools/use

3. Add features:
   - Runtime validation
   - Streaming support
   - Prompt caching integration
   - Tool use (function calling)
   - Vision capabilities
   - Rate limiting
   - Error handling

4. Integration:
   - Add to main server.ts
   - Add Anthropic API key env variable
   - Update openapi.json

5. Create tests: `test/anthropic-integration.test.ts`
   - Test each endpoint
   - Test streaming
   - Test tool use
   - Mock Anthropic API responses

6. Build and test:
   - Build: `nx build server`
   - Test: `nx test server`
   - Integration test with real API (optional)

NX COMMANDS TO USE:
- Build server: `nx build server`
- Test server: `nx test server`
- Build all: `nx run-many --target=build --all`
- Test all: `nx run-many --target=test --all`

DELIVERABLES:
- Complete Anthropic provider with 5+ endpoints
- Streaming and tool use support
- Test suite with 15+ tests
- Updated OpenAPI specification
- All tests passing
```

### Prompt 11: Create Platform Setup Guides (15 hours)

```
I need you to create comprehensive setup guides for 5 different platforms. Each guide should be detailed with screenshots.

CONTEXT:
- Missing: VS Code, Cursor, Warp, JetBrains, Zed
- Existing: ChatGPT guide in docs/connectors/chatgpt-setup.md (use as reference)
- Users need step-by-step instructions

TASK:
For EACH platform, create:

1. **VS Code Extension** (docs/connectors/vscode-setup.md)
   - Installation from marketplace
   - Configuration in settings.json
   - Command palette usage
   - Troubleshooting section
   - Keyboard shortcuts

2. **Cursor Integration** (docs/connectors/cursor-setup.md)
   - MCP configuration file location
   - JSON configuration format
   - AI features integration
   - Usage examples
   - Troubleshooting

3. **Warp Terminal** (docs/connectors/warp-setup.md)
   - MCP server configuration
   - Command blocks integration
   - Workflow automation examples
   - Best practices

4. **JetBrains IDEs** (docs/connectors/jetbrains-setup.md)
   - Plugin installation (IntelliJ, PyCharm, WebStorm)
   - Configuration per IDE
   - IDE-specific features
   - Debugging integration
   - Troubleshooting

5. **Zed Editor** (docs/connectors/zed-setup.md)
   - Extension installation
   - Configuration file examples
   - Collaboration features
   - Performance tips

Each guide must include:
- Prerequisites
- Step-by-step setup (numbered)
- Configuration examples (copy-paste ready)
- Usage examples
- Troubleshooting section
- Screenshots (placeholder text indicating where to add them)

Update docs/README.md to link all new guides.

NO NX COMMANDS NEEDED (documentation only)

DELIVERABLES:
- 5 comprehensive setup guides
- Updated docs/README.md
- Consistent formatting across guides
- Clear troubleshooting sections
```

### Prompt 12: Implement TypeScript Type Generation (8 hours)

```
I need you to implement automatic TypeScript type generation from JSON Schema contracts. This project uses Nx.

CONTEXT:
- Contract schemas: contracts/*/*.json
- Need TypeScript interfaces for type safety
- Use json-schema-to-typescript library

TASK:
1. Install dependency:
   ```bash
   yarn add -D json-schema-to-typescript
   ```

2. Create generation script: `scripts/generate-types.ts`
   - Read all JSON schemas from contracts/
   - Generate TypeScript interfaces
   - Output to src/types/contracts/

3. Generate types for each service:
   - src/types/contracts/pinecone.ts
   - src/types/contracts/supabase.ts
   - src/types/contracts/browserbase.ts
   - src/types/contracts/github.ts
   - src/types/contracts/openai.ts
   - src/types/contracts/anthropic.ts

4. Add npm script to package.json:
   ```json
   "generate:types": "tsx scripts/generate-types.ts"
   ```

5. Add to build pipeline:
   - Update prebuild script to run generate:types
   - Or add as Nx target in project.json

6. Update imports in codebase:
   - Replace manual types with generated types
   - Update API handlers to use generated types

7. Test type generation:
   - Run: `yarn generate:types`
   - Verify generated files
   - Build: `nx run-many --target=build --all`
   - Check for type errors: `yarn tsc --noEmit`

NX COMMANDS TO USE:
- Generate types: `yarn generate:types`
- Build: `nx run-many --target=build --all`
- Typecheck: `yarn tsc --noEmit`

DELIVERABLES:
- Working type generation script
- Generated types for all contracts
- Updated imports in codebase
- Build passing with new types
- Documentation of the process
```

### Prompt 13: Create Configuration Generator Tool (5 hours)

```
I need you to create a web-based configuration generator that produces platform-specific MCP config files. This project uses Nx with Next.js frontend.

CONTEXT:
- Users need config files for different platforms (VS Code, Cursor, Warp, etc.)
- Should generate copy-paste ready configurations
- Frontend: Next.js in frontend/

TASK:
1. Create component: `frontend/src/components/tools/ConfigGenerator.tsx`

2. Implement features:
   - Platform selector (dropdown)
   - Server URL input (with validation)
   - Auth token input (masked)
   - Generate button
   - Preview pane with syntax highlighting
   - Copy to clipboard button
   - Download config file button

3. Support these platforms:
   - VS Code (settings.json format)
   - Cursor (MCP config format)
   - Warp (YAML format)
   - JetBrains (plugin config format)
   - Zed (JSON format)
   - Claude Desktop (JSON format)

4. Add validation:
   - URL format validation
   - Token format validation
   - Required fields checking

5. Create page route: `/tools/config-generator`

6. Add to navigation/tools section

7. Build and test:
   - Build: `nx build frontend`
   - Serve: `nx serve frontend`
   - Test each platform config generation
   - Verify copy/download functionality

NX COMMANDS TO USE:
- Build frontend: `nx build frontend`
- Serve frontend: `nx serve frontend`
- Lint: `nx lint frontend --fix`

DELIVERABLES:
- Working config generator component
- Support for 6 platforms
- Copy and download functionality
- Input validation
- Route at /tools/config-generator
```

---

## 🟡 Medium Priority - Month 2 (120-150 hours)

### Prompt 14: Build Advanced Monitoring Dashboard (30 hours)

```
I need you to build a real-time monitoring dashboard for the MCP server. This project uses Nx with Next.js frontend and Express backend.

CONTEXT:
- Need visibility into API usage, performance, errors
- Real-time updates via WebSocket
- Dashboard in Next.js frontend

TASK BREAKDOWN:

**Part 1: Backend Metrics Collection (10 hours)**

1. Create metrics service: `src/services/metrics.ts`
   - Track API request rates
   - Track response times
   - Track error rates
   - Track container usage
   - Track authentication events
   - Track WebSocket connections

2. Create metrics storage:
   - Use Redis for real-time metrics (if available)
   - Fallback to in-memory storage
   - Time-series data structure

3. Create metrics API: `src/api/metrics.ts`
   - GET /api/v1/metrics/summary
   - GET /api/v1/metrics/timeseries
   - GET /api/v1/metrics/errors
   - GET /api/v1/metrics/performance
   - WebSocket endpoint for real-time updates

**Part 2: Frontend Dashboard (15 hours)**

1. Create dashboard page: `frontend/src/app/dashboard/page.tsx`

2. Create dashboard components:
   - `MetricsSummary.tsx` - Overview cards
   - `TimeSeriesChart.tsx` - Performance graphs
   - `ErrorLog.tsx` - Recent errors
   - `LiveFeed.tsx` - Real-time updates

3. Use chart library (Chart.js or Recharts)

4. Implement real-time updates:
   - WebSocket connection
   - Auto-refresh every 30 seconds
   - Live data streaming

**Part 3: Testing and Polish (5 hours)**

1. Create tests for metrics service
2. Test dashboard rendering
3. Test WebSocket connections
4. Add loading states and error handling
5. Make responsive for mobile

Build and test:
- Backend: `nx build server`
- Frontend: `nx build frontend`
- Test: `nx run-many --target=test --all`

NX COMMANDS TO USE:
- Build all: `nx run-many --target=build --all`
- Test all: `nx run-many --target=test --all`
- Serve frontend: `nx serve frontend`
- Lint: `nx run-many --target=lint --all --fix`

DELIVERABLES:
- Complete metrics collection service
- 4+ API endpoints for metrics
- Dashboard with real-time updates
- Responsive design
- Tests for metrics service
```

### Prompt 15: DRY Refactoring Initiative (25 hours)

```
I need you to conduct a comprehensive DRY (Don't Repeat Yourself) refactoring of the codebase. This project uses Nx.

CONTEXT:
- Codebase has duplicate patterns
- Need shared utilities for common functionality
- Target: 90% reduction in code duplication

TASK BREAKDOWN:

**Part 1: Code Audit (5 hours)**

1. Identify duplicate patterns:
   - Search for repeated error handling
   - Search for repeated validation logic
   - Search for repeated response formatting
   - Search for repeated authentication checks
   - Search for repeated logging patterns

2. Create audit report:
   - List all duplicate patterns
   - Measure current duplication level
   - Prioritize by impact

**Part 2: Create Shared Utilities (12 hours)**

1. Create utility modules:
   - `src/lib/errors.ts` - Shared error handling
   - `src/lib/validation.ts` - Shared validation
   - `src/lib/responses.ts` - Response formatters
   - `src/lib/auth-utils.ts` - Auth helpers
   - `src/lib/logging.ts` - Logging utilities

2. Implement utilities:
   - Error handling wrapper
   - Common validators
   - Response formatters (success/error)
   - Auth middleware factory
   - Structured logging

**Part 3: Refactor Codebase (6 hours)**

1. Replace duplicate code with utilities:
   - Update API routes to use shared utilities
   - Update providers to use shared utilities
   - Update services to use shared utilities

2. Remove redundant code

**Part 4: Testing (2 hours)**

1. Test shared utilities
2. Verify no functionality broken
3. Run full test suite

Build and test throughout:
- Build: `nx run-many --target=build --all`
- Test: `nx run-many --target=test --all`

NX COMMANDS TO USE:
- Build: `nx run-many --target=build --all`
- Test: `nx run-many --target=test --all`
- Lint: `nx run-many --target=lint --all --fix`

DELIVERABLES:
- Code audit report
- 5+ shared utility modules
- Refactored codebase using utilities
- 90% reduction in duplication
- All tests passing
```

### Prompt 16: Implement Platform-Specific Authentication (15 hours)

```
I need you to implement platform-specific authentication tokens and flows. This project uses Nx with Express backend.

CONTEXT:
- Currently uses generic JWT for all platforms
- Different platforms have different requirements
- Need optimized tokens for Claude, ChatGPT, VS Code, etc.

TASK:

1. Create platform auth module: `src/features/auth/platform-auth.ts`

2. Implement platform detection:
   - Detect platform from User-Agent
   - Detect platform from API endpoint
   - Detect platform from custom header

3. Create platform-specific token generators:
   - Claude Desktop: HTTP Stream auth format
   - ChatGPT: OAuth2 PKCE format
   - VS Code: API key format
   - Cursor: Bearer token format
   - Warp: Custom auth format

4. Implement platform-specific token validation:
   - Different validation rules per platform
   - Platform-specific scopes
   - Platform-specific token lifetime

5. Update auth endpoints:
   - Modify /api/v1/auth/login to support platform param
   - Modify /api/v1/auth/refresh for platform-specific refresh
   - Add /api/v1/auth/platform/validate

6. Update middleware:
   - Platform-aware auth middleware
   - Token transformation middleware

7. Create tests:
   - Test each platform's auth flow
   - Test token generation/validation
   - Test platform detection

8. Build and test:
   - Build: `nx build server`
   - Test: `nx test server`

NX COMMANDS TO USE:
- Build server: `nx build server`
- Test server: `nx test server`
- Build all: `nx run-many --target=build --all`

DELIVERABLES:
- Platform auth module
- Platform detection logic
- 5+ platform-specific token formats
- Updated auth endpoints
- Test suite with 20+ tests
- All tests passing
```

---

## 🟢 Lower Priority - Month 3+ (250-300 hours)

### Prompt 17: Expand Service Operations (30 hours)

```
I need you to add additional operations to existing service contracts. This project uses Nx.

CONTEXT:
- Current contracts have basic operations
- Need to expand for full API coverage
- Pinecone, GitHub, Supabase, Browserbase

TASK:

**Pinecone Additional Operations:**
1. Delete vectors
2. Describe index statistics
3. List vectors
4. Update vector metadata
5. Fetch vectors by ID

**GitHub Additional Operations:**
1. Pull request operations (list, create, merge)
2. Commit operations (list, get, compare)
3. Repository operations (create, fork, list)
4. Branch operations (create, delete, protect)
5. Release operations (create, publish, list)

**Supabase Additional Operations:**
1. Additional database operations
2. Storage operations
3. Realtime subscription operations

**Browserbase Additional Operations:**
1. Additional browser automation
2. Session management
3. Screenshot/video recording

For EACH operation:
1. Create JSON schemas (request/response)
2. Create example fixtures
3. Implement API endpoint
4. Add tests
5. Update documentation

Build and test:
- Build: `nx run-many --target=build --all`
- Test: `nx run-many --target=test --all`

NX COMMANDS TO USE:
- Build: `nx run-many --target=build --all`
- Test: `nx run-many --target=test --all`
- Test contracts: `yarn test:contracts`

DELIVERABLES:
- 20+ new operations across 4 services
- JSON schemas for all
- API endpoints for all
- Test suite with 40+ new tests
- Updated documentation
```

### Prompt 18: Create Contract Visualization Tool (15 hours)

```
I need you to create an interactive contract schema explorer/visualizer. This project uses Nx with Next.js frontend.

CONTEXT:
- Contract schemas in contracts/ directory
- Need interactive documentation
- Should visualize schema relationships

TASK:

1. Create explorer page: `frontend/src/app/contracts/page.tsx`

2. Implement features:
   - List all services and operations
   - Click to view schema details
   - JSON schema visualization (tree view)
   - Example request/response viewer
   - Search functionality
   - Filter by service/operation

3. Create components:
   - `SchemaTree.tsx` - Tree view of schema
   - `SchemaViewer.tsx` - JSON viewer with syntax highlighting
   - `ExampleViewer.tsx` - Shows example requests/responses
   - `SearchBar.tsx` - Search contracts

4. Load contract data:
   - Read schemas at build time or runtime
   - Parse JSON schemas
   - Generate navigation

5. Build and test:
   - Build: `nx build frontend`
   - Serve: `nx serve frontend`

NX COMMANDS TO USE:
- Build frontend: `nx build frontend`
- Serve frontend: `nx serve frontend`
- Lint: `nx lint frontend --fix`

DELIVERABLES:
- Interactive contract explorer
- Schema visualization
- Search functionality
- Route at /contracts
- Mobile-responsive design
```

---

## 🔄 Continuous Tasks

### Prompt 19: Expand Test Coverage to >95% (Ongoing)

```
I need you to systematically expand test coverage across the codebase. This project uses Nx with Jest.

CONTEXT:
- Current coverage: ~60%
- Target: >95%
- Focus on integration and E2E tests

TASK (repeat for each area):

1. Check current coverage:
   ```bash
   nx run-many --target=test --all --coverage
   ```

2. Identify untested areas:
   - Look for files with <80% coverage
   - Identify missing test cases

3. Add tests for one module at a time:
   - Unit tests for utilities
   - Integration tests for API endpoints
   - E2E tests for user flows

4. For each test file:
   - Test happy path
   - Test error cases
   - Test edge cases
   - Test validation

5. Run tests:
   - Test specific project: `nx test server`
   - Test all: `nx run-many --target=test --all`

6. Check coverage improved:
   ```bash
   nx run-many --target=test --all --coverage
   ```

Repeat until >95% coverage achieved.

NX COMMANDS TO USE:
- Test with coverage: `nx run-many --target=test --all --coverage`
- Test specific project: `nx test server` or `nx test frontend`
- Run affected tests: `nx affected --target=test`

DELIVERABLES PER ITERATION:
- 5-10% coverage increase
- New test files for untested areas
- Tests passing
```

### Prompt 20: Documentation Maintenance (Ongoing)

```
I need you to keep documentation up-to-date as features are added. This project uses Nx.

TASK (after implementing any feature):

1. Update relevant documentation:
   - API.md for new endpoints
   - README.md for new features
   - Setup guides for new configurations
   - Troubleshooting for known issues

2. Update OpenAPI specification:
   - Add new endpoints to openapi.json
   - Update schemas
   - Add examples

3. Update inline documentation:
   - JSDoc comments for new functions
   - README in new directories
   - Comments for complex logic

4. Check documentation quality:
   - No broken links: `yarn docs:check-links`
   - Consistent formatting
   - Up-to-date examples

NO NX COMMANDS NEEDED (documentation only)

DELIVERABLES PER UPDATE:
- Updated documentation
- No broken links
- Current examples
```

---

## 📊 Progress Tracking

Use this checklist to track your progress through the prompts:

### Week 1 - Quick Wins ✅
- [ ] Prompt 1: Fix TypeScript errors (3h)
- [ ] Prompt 2: Resolve TODOs (2h)
- [ ] Prompt 3: Token auto-refresh (4h)
- [ ] Prompt 4: Callback URL guide (2h)
- [ ] Prompt 5: Callback validator (3h)

### Weeks 2-4 - High Priority ⚡
- [ ] Prompt 6: OAuth wizard UI (8h)
- [ ] Prompt 7: OpenAI schemas (8h)
- [ ] Prompt 8: OpenAI endpoints (10h)
- [ ] Prompt 9: Anthropic schemas (8h)
- [ ] Prompt 10: Anthropic endpoints (10h)
- [ ] Prompt 11: Platform guides (15h)
- [ ] Prompt 12: Type generation (8h)
- [ ] Prompt 13: Config generator (5h)

### Month 2 - Medium Priority 🟡
- [ ] Prompt 14: Monitoring dashboard (30h)
- [ ] Prompt 15: DRY refactoring (25h)
- [ ] Prompt 16: Platform-specific auth (15h)

### Month 3+ - Lower Priority 🟢
- [ ] Prompt 17: Expand operations (30h)
- [ ] Prompt 18: Contract visualization (15h)

### Continuous ♻️
- [ ] Prompt 19: Test coverage (ongoing)
- [ ] Prompt 20: Documentation (ongoing)

---

## 💡 Tips for Success

### Using Nx Efficiently
```bash
# Run affected tasks only (faster)
nx affected --target=build
nx affected --target=test
nx affected --target=lint

# View dependency graph
nx graph

# Clear cache if issues
nx reset

# Run tasks in parallel
nx run-many --target=build --all --parallel=3
```

### Working with Coding Agents

1. **One Prompt at a Time**: Complete each prompt fully before moving to the next
2. **Verify Results**: Always test and verify the agent's work
3. **Iterate**: If the first result isn't perfect, refine and re-prompt
4. **Save Context**: Keep the agent informed of what was done previously
5. **Use Nx Cache**: Leverage Nx caching for faster builds

### Testing Strategy

Always test in this order:
1. Typecheck: `yarn tsc --noEmit`
2. Lint: `nx run-many --target=lint --all`
3. Build: `nx run-many --target=build --all`
4. Test: `nx run-many --target=test --all`

### Git Workflow

After completing each prompt:
```bash
git add .
git commit -m "feat: [description from prompt]"
git push
```

---

## 🎯 Success Metrics

Track these metrics weekly:

- **Code Quality**
  - TypeScript errors: 0
  - Test coverage: >95%
  - Build time: <2s (cached)

- **Features Completed**
  - Week 1: 5 prompts
  - Week 4: 13 prompts
  - Month 2: 16 prompts

- **Documentation**
  - All platforms documented: 6/6
  - API coverage: 100%
  - Examples up-to-date: Yes

---

## 🔗 References

- [Nx Documentation](https://nx.dev)
- [Project Roadmap](./improvement_roadmap.md)
- [Outstanding Tasks Review](./OUTSTANDING_TASKS_COMPREHENSIVE_REVIEW.md)
- [Action Checklist](./ACTION_CHECKLIST.md)
- [Build Tooling Guide](./BUILD_TOOLING_README.md)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-07  
**For**: Solo Developer  
**Build System**: Nx 21.6.3  
**Total Estimated Time**: ~500 hours across 20 prompts
