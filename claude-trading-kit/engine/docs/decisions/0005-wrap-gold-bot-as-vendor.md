# ADR 0005 — Wrap the gold-bot as a vendored engine

**Status:** Accepted

**Context.** A prior project produced a verified engine (no-look-ahead backtest, ATR
sizing, honest scorecard, FastAPI monitor, paper executor, 18 passing tests). Reimplementing
this would waste effort and risk regressions. The user asked for a marketplace that **wraps
the gold-bot**.

**Decision.** Vendor the gold-bot into `vendor/gold-bot/` (pinned copy) and **wrap** it:
`trading-research` exposes it via MCP; `trading-core` cites its ROADMAP for risk/scorecard;
`trading-execution` reuses its `PaperBroker` as the `PaperVenue` stub.

**Consequences.** Self-contained export (no external repo dependency). The engine remains the
**source of truth for honest backtests**. Upstream changes are pulled deliberately and noted
in a new ADR. Some duplication if the upstream repo also evolves.
