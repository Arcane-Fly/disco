# Approved AI Models (Current)

This repository enforces a strict allowlist for production use. Models older than ~8 months are not permitted. See provider-specific sections below.

## Anthropic (Claude)

Allowed (production):
- claude-4.5-sonnet
- claude-4.1-opus
- claude-4-sonnet
- claude-3.7-sonnet

Deprecated (blocked by policy):
- claude-3.5-sonnet (and any 3.5 variants)
- claude-3-opus
- claude-2, claude-2.1, claude-1, claude-instant-1

Notes:
- Names above are canonical identifiers used by this codebase. If Anthropic exposes slightly different public IDs, map them in code at the integration boundary if needed.
- Newer releases (e.g., 4.x minor updates) should be considered for inclusion if they fit latency/quality and cost targets.

## OpenAI

Use only models explicitly configured by project policy in `src/api/providers.ts`. Validate any additions through PRs referencing official docs.

## Google (Gemini)

Use only models explicitly configured by project policy in `src/api/providers.ts`. Validate any additions through PRs referencing official docs.

## Meta, xAI, Groq, Perplexity

Use only models explicitly configured by project policy in `src/api/providers.ts`.

---

Authoritative configuration files:
- `src/config/anthropic.ts` – Enforced Claude allowlist and defaults
- `src/api/providers.ts` – Provider exposure, policy endpoints

Operational guidance:
- CI enforces policy via lint/type checks and provider endpoints.
- Any model changes must update both `docs/ai-models.md` and respective `src/config/*` files.
