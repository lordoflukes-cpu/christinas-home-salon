# trading-suite

A risk-first, **TradingView-centric** suite of trading capabilities for Claude —
**skills, MCP connectors, agents, hooks and workflows** — packaged as a Claude Code
**plugin marketplace**. Built for **both manual and automated trading**, across
**VT Markets (CFD)** and a **UK spread-bet** account, operable from **phone, Mac or
Windows**.

> Educational tooling — **not financial or tax advice**. Trading leveraged products
> risks losing money.

## Status: foundation phase

This repo currently contains the **planning foundation** — `CLAUDE.md`, the `docs/`
specs, and plugin **scaffolds**. Capability code is built in later phases, governed
by the docs. Start with **[CLAUDE.md](./CLAUDE.md)**.

## What it will provide

- **trading-core** — sizing, cost model, journaling, regime, health review.
- **trading-charting** — TradingView/Pine indicators, strategies, screeners, alert
  templates, chart playbooks.
- **trading-data** — market data + FRED + COT + economic-calendar connectors.
- **trading-research** — backtesting/validation wrapping the gold-bot engine, with a
  TradingView Strategy-Tester cross-check.
- **trading-bridge** — cloud webhook receiver (TradingView → auth/idempotency/risk → route).
- **trading-execution** — VT Markets (MetaApi/MT5) + IG spread-bet, Telegram control,
  kill-switch.

## Architecture in one line

TradingView (Pine signals/charts/screeners) → webhook → cloud bridge (HMAC, idempotency,
risk-gate) → venue-abstracted execution (VT Markets / IG) → Telegram control; the
**gold-bot** engine (`vendor/gold-bot`) powers research, backtests and risk.

See **[docs/01-architecture.md](./docs/01-architecture.md)**.

## Install (once plugins are built)

```bash
/plugin marketplace add lordoflukes-cpu/trading-suite     # or a local path
/plugin install trading-core@trading-suite
```

## Docs

Read **[CLAUDE.md](./CLAUDE.md)**, then `docs/` in the order listed there:
vision → architecture → capability catalog → conventions → roadmap, plus
integrations, manual-vs-bot, risk/compliance, security, and the ADRs in
`docs/decisions/`.
