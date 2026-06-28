# 04 · Authoring Conventions

How we build every artifact, so the suite is consistent and safe. CLAUDE.md enforces
these; this is the detail.

## Universal rules

- **Manual + bot parity**: every capability's doc/frontmatter states how it serves
  discretionary and automated trading. No bot-only feature without its manual analogue.
- **Cross-device**: no capability may *require* a Windows-only path in its default mode.
- **Stub-first**: every external dependency has a simulated mode that runs with no creds.
- **Honest by construction**: no look-ahead; pessimistic costs; never massage to PASS.
- **Security**: money-touching paths use HMAC + idempotency + kill-switch (docs/08).
- **Naming**: kebab-case for skills/agents/plugins; tools `snake_case`; tracks are
  exactly `cfd` | `spreadbet`.

## Skills — `plugins/<p>/skills/<name>/SKILL.md`

```markdown
---
name: risk-check
description: <trigger-rich, so auto-invocation is reliable — say WHEN to use it>
---

# <Title>
<Concrete procedure. Inputs to gather. Tool calls to make. Output format.>
## Manual vs bot
<one line each>
```
- Description is the most important field — it drives auto-invocation. Be explicit
  about the user phrasings that should trigger it.
- Prefer calling an MCP tool or the engine over re-deriving math in prose.

## Agents — `plugins/<p>/agents/<name>.md`

```markdown
---
name: risk-manager
description: <when Claude should delegate to this agent>
tools: ["Read", "Grep", "Glob"]   # least privilege
model: sonnet
---
<Sharp system prompt: mandate, method, output contract, and its authority/limits.>
```

## MCP connectors — `plugins/<p>/mcp/<server>.py` + `.mcp.json`

- stdio server (FastMCP or equivalent); tools are pure where possible.
- Every server ships a **stub mode** (env flag) returning simulated data.
- Document required env/secrets in the plugin SPEC; never hardcode keys.
- Register in the plugin's `.mcp.json` using `${CLAUDE_PLUGIN_ROOT}`.

## Hooks — `plugins/<p>/hooks/hooks.json`

- Non-blocking by default; **exit 0 even on error** (never break a tool call).
- Read the JSON payload from stdin; match narrowly to avoid nagging.

## Commands — `plugins/<p>/commands/<name>.md`

- Frontmatter `description`; body is the prompt. Safe-by-default (halt/flat reduce risk).

## Tests & validation

- Any code carries `tests/` (pytest). Engine-wrapping tools reuse vendor/gold-bot tests.
- All manifests must `json.load` clean. A plugin isn't "built" until tests pass and it
  installs via `/plugin`.

## Plugin SPEC.md (required per plugin)

Each plugin folder has a `SPEC.md`: purpose, the skills/agents/connectors/hooks it will
contain (from the catalog), its manual+bot story, its cross-device story, dependencies,
secrets, and its build-phase. Scaffolds carry SPEC.md now; code comes later.
