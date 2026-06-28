---
name: monte-carlo
description: Run a Monte-Carlo trade-order reshuffle to see the distribution of drawdowns and returns a strategy's trade sequence could have produced, so you size for the drawdown you must survive — not just the one that happened. Use when assessing drawdown risk, robustness, or worst-case sizing.
---

# Monte-Carlo (trade reshuffle)

Your realised equity curve is one ordering of your trades; many other orderings were
equally possible. Reshuffling reveals the drawdown you should actually plan for.

## Procedure
1. Call the **`monte_carlo`** tool (backtest-engine MCP) with `csv_path` (or synthetic),
   `fast`, `slow`, `runs` (≥1000 for a real read), and cost assumptions.
2. Report the **return** percentiles (p5/p50/p95), the **max-drawdown** p50/p95/worst, and
   **prob_loss** = P(final equity < start).
3. **Interpret:** size so you can survive the **p95 (or worst) drawdown**, not the median.
   A high `prob_loss` or a p95 drawdown beyond your tolerance means de-risk or reject —
   even if the single historical run looked fine.
4. Needs ≥5 trades; if too few, widen the sample first.

## Manual vs bot
- **Manual**: set a position-size / max-risk you can stomach through the bad orderings.
- **Bot**: feed the p95 drawdown into the kill-switch / max-drawdown limit configuration.
