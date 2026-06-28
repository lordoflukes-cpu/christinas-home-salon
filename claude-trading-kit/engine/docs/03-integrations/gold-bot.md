# Integration · gold-bot (the wrapped engine)

`vendor/gold-bot/` is the verified research/engine/monitor from the earlier project. We
**wrap** it (don't reimplement) for research, risk, and a reference live monitor.

## What it provides (already built & tested)

- **Engine** (`app/strategy`, `app/sizing.py`, `app/backtest`, `app/indicators.py`):
  dual-EMA+ATR trend strategy, ATR/vol-target sizing, **no-look-ahead** backtest,
  scorecard metrics (Sharpe/Sortino/PF/expectancy-R/Calmar/maxDD). 18 passing tests.
- **Live monitor** (`app/main.py`, `app/feeds`, `app/alerts`, `app/bus.py`): FastAPI +
  WebSocket dashboard, tiered feeds, alert engine, **kill-switch**.
- **Paper executor** (`app/execution`): `PaperBroker` + executor honouring kill-switch
  and news-window — reused as the **`PaperVenue`** stub for `trading-execution`.
- **Docs**: `ROADMAP.md` (strategy, §5 validation, §6 risk, §11 scorecard, §16 health
  review) and `MARKET-DRIVERS-AND-MONITORING.md` (drivers + monitoring tiers). These are
  the **authoritative references** the skills cite.

## How each plugin wraps it

- **trading-research** → `backtest-engine` MCP server exposing `run_backtest`,
  `position_size`, `cost_model`, `metrics` over the engine; `live-monitor` MCP over the
  FastAPI app.
- **trading-core** → `risk-check`, `cost-model`, `health-review`, `regime` skills cite
  ROADMAP §6/§11/§16 and call the engine's sizing/cost functions.
- **trading-execution** → reuse `PaperBroker` as the no-creds `PaperVenue` behind the
  execution interface.

## Rule

The engine is the **source of truth for honest backtests** (no look-ahead, pessimistic
costs). Where TradingView's Strategy Tester disagrees, trust the engine and investigate
the TV cost/fill model (see tradingview.md cross-check).

## Maintenance

Keep `vendor/gold-bot` as a pinned copy for a self-contained export. If it evolves
upstream, update deliberately and note it in an ADR.
