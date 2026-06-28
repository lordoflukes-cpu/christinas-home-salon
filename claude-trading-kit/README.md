# Claude Trading Kit

A single, portable folder of **every trading-related Claude skill, agent, connector, and workflow**
— each documented with its use cases — that you can copy or move into any project and export. Built
around one disciplined trend-trading edge (the gold-bot engine) expressed once and exposed through
many surfaces, with **manual and bot paths in parity** and **everything runnable on simulated data
with no credentials**.

> Focus: gold/silver (extensible to FX/other trend markets). Tracks: VT Markets (CFD, MT4/5 via
> MetaApi) and UK spread-bet (IG). TradingView used for signals, charting, screeners, and backtest
> parity. Not financial or tax advice.

## What's inside
```
claude-trading-kit/
  README.md          ← you are here
  CATALOG.md         ← the full index: every item, use case, status, path
  skills/            ← 42 skills  (.claude/skills convention)
  agents/            ← 19 agents
  commands/          ← /halt /flat /status
  hooks/             ← order-guard + session brief
  connectors/        ← MCP servers: README, mcp.example.json, custom/ SPECs
  workflows/         ← 12 multi-step pipeline specs
  external-plugins/  ← companion Claude marketplace plugins (Data, Finance, Bigdata, LSEG, Bright Data)
  docs/              ← use-cases · architecture · copy-and-export · status · glossary
  engine/            ← the runnable, tested marketplace (6 plugins + vendored gold-bot + tests)
```

## Start here
1. **`CATALOG.md`** — browse everything (skills, agents, connectors, workflows) with one-line use
   cases and honest status tags.
2. **`docs/use-cases.md`** — "how do I size a trade / validate a strategy / go live / handle an
   incident?" → exactly what to reach for.
3. **`docs/copy-and-export.md`** — the 3 ways to use the kit (drop-in `.claude/`, add connectors,
   install the engine).
4. **`docs/architecture.md`** — how the signal→money pipeline fits together.
5. New? Ask the **onboarding-guide** agent to walk you through it.

## The 3 ways to use it (summary)
- **A — Drop in:** copy `skills/ agents/ commands/ hooks/` into a project's `.claude/`. Pure-reasoning
  skills/agents work immediately.
- **B — Connectors:** merge `connectors/mcp.example.json` into your `.mcp.json` (replace `${KIT}`).
  The 5 BUILT MCP servers run on simulated data, no creds.
- **C — Engine:** install `engine/` (venv + pytest) so engine-backed skills actually run; optionally
  install as a `/plugin` marketplace.

Full instructions: `docs/copy-and-export.md`.

## Honesty & status
Every item is tagged **BUILT** (tested code), **PLAYBOOK** (reasoning method, no bespoke code), or
**SPEC** (interface to wire up), plus **EXTERNAL** (a separately-installed Claude marketplace
plugin). The single source of truth is `docs/status.md`. Summary: 24 skills BUILT / 18 PLAYBOOK;
8 agents from the tested suite / 11 PLAYBOOK; 5 BUILT MCP connectors + 11 ENV + 13 custom SPECs;
11 workflows runnable + 1 partial; 5 companion EXTERNAL plugins (6 skills) — see `external-plugins/`.

## Resources
A shared Google Drive resources folder accompanies this kit, but its contents are **not yet
incorporated** — access failed (Drive connector needs approval; public link returns 403).
**See `docs/RESOURCES.md` for the link and exactly what to do to fold it in** (authorize the Drive
connector, make the link public, or drop the files in directly).

## Safety defaults (baked in)
- One **risk gate** (ATR sizing + per-trade/daily/drawdown limits) shared by manual and bot.
- **Kill-switch** always reachable (`/halt`, `/flat`, `flatten_all`, Telegram).
- Webhooks **HMAC-signed**; orders **idempotent**; positions **reconciled** before resuming.
- **No look-ahead / repaint**; costs modelled; Sharpe **deflated** for trials.
- **No secrets in the kit** — credentials come from env/secrets-manager at the destination; broker
  keys trade-only, least-privilege; Telegram commands allow-listed.

## Disclaimers
Educational tooling, not financial advice. The UK tax skills/agents (`tax-uk`, `tax-adviser-uk`)
are record-keeping/estimation only and are **not** a substitute for a qualified UK adviser. Trade
on paper until you've validated everything yourself.
