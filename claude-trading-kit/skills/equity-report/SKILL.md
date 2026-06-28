---
name: equity-report
description: Produce a performance report from the equity curve and trade log — returns, Sharpe/Sortino/Calmar, max drawdown, profit factor, expectancy-R, win rate, plus per-track (CFD vs spread-bet) breakdown — with charts. Use for a performance review, monthly/quarterly report, or an investor/self summary.
---

# Equity Report

A clear, honest performance summary — the same scorecard used to judge backtests, applied to
live/paper results.

## Procedure
1. Gather realised trades + the equity curve (`trade-journal` store / execution `account`).
2. Compute the scorecard (reuse the engine's `compute_metrics` via the `backtest-engine` tools
   or directly): total return, CAGR, **Sharpe, Sortino, Calmar, max drawdown, profit factor,
   expectancy-R, win rate, # trades**.
3. **Per-track split** (CFD vs spread-bet) for tax + venue insight (`tax-uk`); note which track
   drove returns.
4. Charts (via Wolfram or a plotting step / the dashboard): equity curve, drawdown underwater
   plot, R-multiple distribution, rolling expectancy.
5. **Context, honestly**: compare to the backtest expectancy (live should be within tolerance —
   a big gap means cost-model error); flag if the sample is too small to be significant; note
   benchmark (e.g. buy-and-hold) where relevant.
6. Deliver: a Markdown/PDF report (optionally email via Gmail / save to Drive).

## Output
A scorecard table + charts + a one-paragraph honest read (what's working, what's not, sample
significance). No vanity framing — show drawdown and losing periods plainly.

## Manual vs bot
- **Manual**: your periodic self-review of discretionary trading.
- **Bot**: an automated weekly/monthly report (see the weekly-performance-report workflow).
