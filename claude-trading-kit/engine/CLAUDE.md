# CLAUDE.md — trading-suite

> Operating manual for this repository. Read this first, then `docs/` in the order
> given under **Reading order**. This file is the contract for *how* we build here.

## Mission

Build and **export** a comprehensive, risk-first suite of trading capabilities for
Claude — **skills, connectors (MCP), workflows, and agents** — packaged as a
shareable Claude Code **plugin marketplace**. The suite is **TradingView-centric**
(Pine signals, charts, screeners, alerts), executes on **VT Markets (CFD)** *and* a
**UK spread-bet** account (tax-free), is operable **from phone, Mac, or Windows**,
and serves **both manual (discretionary) and automated (bot) trading** with equal
weight. We optimise for the **best** path, not the fastest.

> Educational tooling — **not financial or tax advice**. Trading leveraged products
> risks losing money. See `docs/07-risk-and-compliance.md`.

## The four artifact types & the export vehicle

| Artifact | Lives in | Packaged as |
|---|---|---|
| **Skill** (`/plugin:name`) | `plugins/<p>/skills/<name>/SKILL.md` | plugin |
| **Agent** (subagent) | `plugins/<p>/agents/<name>.md` | plugin |
| **Connector** (MCP server) | `plugins/<p>/.mcp.json` (+ `mcp/`) | plugin |
| **Hook / command / monitor** | `plugins/<p>/hooks|commands|monitors/` | plugin |
| **Workflow** (multi-agent) | expressed as **skills/commands** (saved JS workflows aren't plugin-packable) | plugin |

Export = a **marketplace** (`.claude-plugin/marketplace.json`) listing plugins,
installed with `/plugin marketplace add <owner>/trading-suite` then
`/plugin install <plugin>@trading-suite`.

## Architecture (summary)

TradingView is the **signal/charting brain** → Pine `alert()` emits **webhook JSON**
→ a **cloud-hosted bridge** (HMAC auth, idempotency, risk-gate) → **venue-abstracted
execution** (VT Markets via MetaApi cloud *or* self-hosted MT5; UK spread-bet via IG
API) → **Telegram** for alerts/control → the **gold-bot** engine powers research,
backtesting and risk. Manual and bot **share** the signal/risk/journal core and
diverge only at the execution step. Full diagram + data flows: `docs/01-architecture.md`.

## Repository map

```
CLAUDE.md                     ← you are here
README.md                     ← human overview + install
.claude-plugin/marketplace.json
docs/                         ← planning + specs (the source of truth for builds)
  00-vision-and-principles.md   01-architecture.md   02-capability-catalog.md
  03-integrations/  04-conventions.md  05-roadmap.md  06-manual-vs-bot.md
  07-risk-and-compliance.md  08-security.md  glossary.md  decisions/ (ADRs)
plugins/                      ← trading-core, -charting, -data, -research, -bridge, -execution
vendor/gold-bot/              ← the wrapped research/engine/monitor (verified)
```

## Non-negotiable principles

1. **Risk-first.** Survival → expectancy → compounding, in that order. Every
   money-touching path has sizing limits, a daily-loss limit, and a **kill-switch**.
2. **Manual + bot parity.** Every capability states how it serves *discretionary* and
   *automated* trading. Don't build a bot-only feature without its manual counterpart
   (and vice-versa). See `docs/06-manual-vs-bot.md`.
3. **Cross-device / cloud-first.** Default paths must work from **phone, Mac, and
   Windows** — favour cloud (MetaApi, cloud bridge, Telegram, TradingView web/mobile).
   Never put a hard **Windows-only** (self-hosted MT5) dependency in the default path;
   it's an optional backend behind the execution interface.
4. **Venue-abstracted execution.** One interface; backends = VT Markets (CFD) and IG
   spread-bet (tax-free). Strategies pick a track for tax/cost reasons, not code reasons.
5. **TradingView-maximal.** Prefer Pine/TradingView for signals, charts, screeners,
   and a Strategy-Tester cross-check before reinventing them in code.
6. **Stub-first.** Build every external integration as a working **simulated stub**
   that runs with no credentials; wire real keys later. Nothing should require secrets
   to demo.
7. **Honest validation.** No look-ahead in backtests; model costs pessimistically;
   report **honest verdicts** (never massage parameters to force a PASS); treat
   "too good" metrics as a bug signal. See `vendor/gold-bot/ROADMAP.md` §5/§11.
8. **Security-by-default.** Webhooks require **HMAC**; orders are **idempotent**
   (client_order_id); secrets never committed; least-privilege keys. See `docs/08`.
9. **Best path, not fastest.** Spec before code; ADR for any significant choice.

## Authoring conventions (full detail: `docs/04-conventions.md`)

- **Skills**: `skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`).
  The `description` must make auto-invocation reliable. Body = a concrete procedure.
- **Agents**: `agents/<name>.md` with frontmatter (`name`, `description`, `tools`,
  `model`). Body = a sharp system prompt with a clear mandate.
- **MCP connectors**: a stdio server under `mcp/`, registered in `.mcp.json`. Pure
  tools where possible; document required env/secrets; ship a stub mode.
- **Hooks**: non-blocking by default; never break a tool call on error (exit 0).
- **Every capability** documents its **manual vs bot** use and its **cross-device** story.
- **Tests**: each plugin carries `tests/` (pytest) for any code; manifests must parse.

## Build workflow & quality gates (`docs/05-roadmap.md`)

A plugin graduates from *scaffold → built* only when: its SPEC is complete, its
skills/agents/connectors exist with stub modes, tests pass, manifests validate, and
it installs cleanly via `/plugin`. Phases are sequenced so each builds on verified
foundations.

## How to run / test

```bash
# validate manifests
python3 -c "import json,glob;[json.load(open(f)) for f in glob.glob('**/*.json',recursive=True)]"
# per-plugin tests (once code exists)
cd plugins/<plugin> && pytest
# run an MCP server standalone (stdio)
python3 plugins/<plugin>/mcp/<server>.py
# install locally
/plugin marketplace add /path/to/trading-suite
/plugin install <plugin>@trading-suite
```

## Reading order (onboarding a fresh session)

1. This file. 2. `docs/00-vision-and-principles.md`. 3. `docs/01-architecture.md`.
4. `docs/02-capability-catalog.md`. 5. `docs/04-conventions.md`. 6. `docs/05-roadmap.md`.
Dip into `docs/03-integrations/*`, `06`, `07`, `08`, and `decisions/` as needed.

## Status

**Foundation phase.** Docs + structure + plugin scaffolds only — no capability code
yet. The `vendor/gold-bot` engine is the verified base the research/risk plugins wrap.
