---
name: variance-analysis
description: Compare trading plan vs actual — expected vs realized return, expectancy-R, win rate, costs, and risk — across instruments, strategies, sessions, and tracks; build the variance bridge and write an FP&A-style narrative of the main drivers. Use for budget-vs-actual on trading performance, a monthly/quarterly review, or attributing a P&L gap.
---

# Variance Analysis

Explain the gap between what you *expected* and what you *got*, and which drivers caused it — the
FP&A discipline applied to trading. This is the trading-scoped, portable version of the **Finance
plugin's Variance Analysis** skill; use that plugin for full budget/forecast/actual workbooks and
executive financial narratives, and this for a focused trading P&L bridge.

## Method
1. **Baseline (plan)** — the expectation: backtested expectancy-R, expected return/Sharpe, planned
   trade count, modelled costs, and the risk budget (from `backtest` / `equity-report`).
2. **Actual** — realized return, expectancy-R, win rate, costs/slippage, trade count, max drawdown.
3. **Variance bridge** — decompose the total return gap into additive drivers:
   `volume` (trade count) · `win rate` · `payoff/R` · `cost/slippage` · `sizing/risk` · `mix`
   (instrument/strategy/session weighting). Each driver in return or R terms; they sum to the gap.
4. **Attribution** — by instrument / strategy / session / track (CFD vs spread-bet): where did the
   variance come from, and is it favourable or adverse?
5. **Signal vs noise** — is the variance within the `monte-carlo` band (normal variance) or beyond
   it (a real driver / decay)? Don't write a story around luck.

## Output
```
VARIANCE: plan <x> → actual <y> = <gap>
BRIDGE: volume <±> · win% <±> · payoff <±> · cost <±> · sizing <±> · mix <±>  (= gap)
DRIVERS: <largest adverse> , <largest favourable>
NARRATIVE: <2–4 sentences, executive-ready>   NEXT: <one action>
```
Feeds `report-writer` and the weekly-performance-report workflow; confirmed decay → `decay-scan`.

## Manual vs bot
- **Manual**: review why this month's results differ from plan and what to change.
- **Bot**: a scheduled attribution step in the performance report; flags adverse drivers beyond the
  variance band.
