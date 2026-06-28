# SPEC · trading-research

**Purpose.** Honest backtesting + the anti-overfitting validation suite, wrapping the
gold-bot engine. Build phase: **1** (with trading-core).

## Contents (planned)
- **Connectors (MCP)**: `backtest-engine` (P1, wraps vendor/gold-bot: run_backtest,
  position_size, cost_model, metrics), `live-monitor` (P2, wraps the FastAPI monitor +
  kill-switch).
- **Skills**: `backtest` (P1), `walk-forward` (P2), `monte-carlo` (P2), `optimize` (P2,
  plateau/anti-overfit), `deflated-sharpe` (P3), `tv-strategy-tester` (P2, cross-check).
- **Agents**: `backtest-analyst` (P1), `red-team-skeptic` (P1), `quant-validator` (P2).
- **Workflows (as skills)**: idea→backtest→validate; overfitting tournament; ensemble builder.

## Manual + bot
- Manual: validate a discretionary idea before trading it by hand.
- Bot: validate a strategy before it goes live (feeds the pre-deployment gate).

## Cross-device
MCP server runs anywhere Python runs (cloud/desktop); results viewable on any device.

## Dependencies / reuse
- `vendor/gold-bot` engine (authoritative, no-look-ahead). Requires `mcp` SDK for the server.
- Cross-checks `trading-charting` TradingView Strategy-Tester exports.

## Secrets
None for synthetic/CSV; real data via trading-data when wired.

## Definition of done
MCP tools execute; honest FAIL on synthetic data; analyst/skeptic agents flag overfitting;
tests pass; installs via `/plugin`.
