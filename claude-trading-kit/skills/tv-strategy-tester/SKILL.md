---
name: tv-strategy-tester
description: Cross-check TradingView Strategy-Tester results against the gold-bot engine backtest on the same data, and explain any divergence (usually cost/fill modelling). Use when comparing a TradingView backtest to the engine, or when TradingView results look too good.
---

# TradingView Strategy-Tester Cross-Check

TradingView's Strategy Tester is fast but its cost/fill model differs from ours. Treat the
gold-bot engine (no-look-ahead, honest costs) as the **authority**; use TV for speed, then
reconcile.

## Procedure
1. Get the TradingView results: net profit, profit factor, max drawdown %, number of trades,
   win rate (from the Strategy Tester "Overview"/"Performance Summary"). Capture the symbol,
   timeframe, and date range used.
2. Run the engine on the **same** instrument/timeframe/range via the `backtest` skill /
   `run_backtest` tool (trading-research). Use a realistic `cost_per_unit` (`cost_model`).
3. Compare with the **`diff_metrics`** tool (charting-tools MCP), mapping fields
   (profit_factor↔profit_factor, max_drawdown↔max DD%, num_trades↔num trades).
4. **Interpret divergence**:
   - Engine worse than TV → TV is under-charging costs/slippage or has look-ahead/repaint.
     Trust the engine; fix the TV cost settings (commission, slippage, "on bar close").
   - Trade counts far apart → different fill timing or repainting signals.
   - Small diffs within tolerance → consistent; proceed to the validation ladder.
5. Never adopt the rosier number because it's rosier. Reconcile, then validate
   (`walk-forward`, `monte-carlo`).

## Manual vs bot
- **Manual**: sanity-check a TradingView backtest before trusting a discretionary system.
- **Bot**: a required reconciliation before promoting a Pine strategy toward live.
