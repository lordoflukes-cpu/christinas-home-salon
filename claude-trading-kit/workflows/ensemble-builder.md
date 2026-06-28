# Workflow · Ensemble builder

**Purpose.** Combine several decorrelated, individually-valid members into one robust system —
the biggest decay-resistance lever for a solo trend trader.

**Trigger.** You have ≥2 strategies/params/instruments that each pass validation.

**Steps.**
1. Candidate members: lookback variants on a plateau and/or multiple instruments.
2. `backtest` each; keep only members clearing the §11 gates.
3. `correlation-matrix` → drop near-duplicates; prefer low pairwise correlation.
4. Combine (average signals or inverse-vol risk weights); size with `risk-check` so total +
   per-bucket risk stay within limits (`portfolio-allocator`).
5. Validate the ensemble whole: `walk-forward` + `monte-carlo`; require better Calmar/drawdown
   than the median member.

**Tools/agents.** ensemble skill, backtest-engine MCP, portfolio-allocator.

**Output.** Members + correlations + weights + the ensemble scorecard vs best single member.
Reject if it doesn't improve robustness.

**Status.** Runnable on the engine.
