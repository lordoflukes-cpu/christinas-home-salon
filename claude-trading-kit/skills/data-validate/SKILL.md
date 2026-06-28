---
name: data-validate
description: Audit a trading workbook, broker statement, dashboard export, or backtest result file for integrity — broken/inconsistent calculations, duplicates, impossible values, look-ahead leaks, and audit risks — and produce a structured validation report. Use before trusting a spreadsheet's numbers or a backtest export, or to reconcile a reported figure.
---

# Data Validate

Audit a trading dataset or workbook for the errors that quietly mislead — a wrong formula, a
duplicated fill, a leaked future value. This is the trading-scoped, portable version of the **Data
plugin's Validate Data** skill; use that plugin for large workbooks/dashboards with deep formula
tracing, and this for fast, targeted integrity checks.

## Checks
1. **Calculation integrity** — recompute key figures from raw inputs (PnL, R, win rate, returns,
   drawdown, Sharpe) and compare to the reported cells; flag any mismatch with the formula at fault.
2. **Consistency** — totals = sum of parts; per-track splits reconcile to the whole; equity curve
   ties to the trade ledger; units consistent (lots vs stake-per-point, %, currency).
3. **Duplicates & gaps** — repeated trade ids / timestamps; missing periods; double-counted fees.
4. **Impossible values** — negative prices/sizes, win rate > 100%, Sharpe implausibly high,
   drawdown > 100%, fills outside the bar's high/low.
5. **Look-ahead / leakage** — any column using information unavailable at decision time (e.g.
   same-bar close used for an entry signaled at open); a backtest-invalidating red flag.
6. **Methodology** — are costs/slippage included? is the sample long enough? are the §11 gates
   computed the same way as the engine?

## Output
```
VALIDATION: calcs <n ok / n broken> · consistency <ok/issues> · dupes <n> · impossible <n> · leakage <none/FOUND>
FINDINGS: <each issue → location → impact → fix>
VERDICT: trustworthy ✅ | fix-before-use ⚠️ | reject ❌
```
Code-level review of a backtest/execution script → `trading-code-reviewer`; live position vs broker
mismatch → `reconcile`; TV-vs-engine divergence → `tv-strategy-tester`.

## Manual vs bot
- **Manual**: audit a strategy spreadsheet or broker statement before acting on its numbers.
- **Bot**: a CI/pipeline gate that validates report/backtest outputs and blocks on integrity errors.
