# ADR 0003 — Package as a marketplace of focused plugins

**Status:** Accepted

**Context.** The deliverable must be **exportable/shareable**. Claude Code's export vehicle
is a **plugin** (skills + agents + hooks + MCP + commands) distributed via a **marketplace**.
The capability set is large and spans research, data, charting, bridge, and execution.

**Decision.** Build a **marketplace** (`.claude-plugin/marketplace.json`) of six focused,
independently-installable plugins: `trading-core`, `trading-charting`, `trading-data`,
`trading-research`, `trading-bridge`, `trading-execution`. Saved JS workflows aren't
plugin-packable → express **workflows as skills/commands** so they ship.

**Consequences.** Users install only what they need; clear ownership boundaries; each
plugin versioned separately. MCP servers ship inside plugins (`.mcp.json`). More manifests
to maintain. Naming and namespacing follow docs/04.
