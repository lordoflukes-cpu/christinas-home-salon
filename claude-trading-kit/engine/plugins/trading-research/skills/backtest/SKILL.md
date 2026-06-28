---
name: backtest
description: Backtest the dual-EMA + ATR trend strategy on OHLC data and report the §11 scorecard (Sharpe, profit factor, expectancy-R, Calmar, max drawdown) with a go/no-go verdict. Use when the user wants to test a strategy, run a backtest, check historical performance, or evaluate parameters for gold/silver or any OHLC series.
---

# Backtest

Evaluate the trend strategy honestly and report whether it clears the go-live gates.

## Procedure
1. Choose the data source:
   - User CSV (`ts,open,high,low,close`) → pass `csv_path`.
   - Else synthetic demo data (empty `csv_path`) — and STATE that synthetic results
     validate the pipeline only, they are **not evidence of edge**.
2. Call the **`run_backtest`** tool (backtest-engine MCP) with `fast`, `slow`,
   `risk_frac`, `cost_per_unit`, `bars_per_year` (H4≈1512, daily=252). If costs are
   unknown, first call `cost_model` to get a realistic `suggested_cost_per_unit`.
3. Present `metrics` as a scorecard plus `verdict` and `gate_failures`. Always show the
   data source and trade count (a great Sharpe on 15 trades is noise).
4. **Interpret like a skeptic:** Sharpe >3 / profit factor >3 / "too good" drawdown →
   suspect look-ahead, leakage, or optimistic costs, not genius. A FAIL is the common,
   correct outcome — never tune parameters to force a PASS.
5. **Always recommend validation before trusting a PASS**: `walk_forward`, `monte_carlo`,
   `parameter_plateau`, `deflated_sharpe`. Offer to hand off to the `backtest-analyst` or
   `red-team-skeptic` agents.

## Gates (§11)
sharpe ≥ 0.7 · profit_factor ≥ 1.3 · expectancy_r ≥ 0.2 · calmar ≥ 0.5

## Manual vs bot
- **Manual**: validate a discretionary idea before trading it by hand.
- **Bot**: validate a strategy before it goes live (feeds the pre-deployment gate).
