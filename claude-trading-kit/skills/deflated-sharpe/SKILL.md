---
name: deflated-sharpe
description: Deflate an observed Sharpe ratio for the number of strategies/parameters tried and for non-normal returns (Bailey & López de Prado), giving the probability the edge is real rather than luck. Use when judging whether a backtest's Sharpe survives multiple testing, or comparing many tested configs.
---

# Deflated Sharpe (DSR / PBO)

The more configurations you try, the higher the best Sharpe must be to be credible. DSR corrects
for that selection bias (and for skew/kurtosis).

## Procedure
1. Gather: the selected strategy's **per-period** (non-annualised) Sharpe, `n_trials` (how many
   configs/params you actually tested), `n_obs` (number of return observations), and — if known —
   return `skew` and `kurtosis`.
2. Call the **`deflated_sharpe`** tool (backtest-engine MCP). It returns the expected max Sharpe
   under the null and the **DSR** (≈ P(true Sharpe > 0)).
3. Interpret:
   - **DSR ≥ 0.95** → credible after multiple testing.
   - **0.90–0.95** → borderline; need more out-of-sample evidence.
   - **< 0.90** → likely luck from over-searching; reject or shrink expectations.
4. Be honest about `n_trials`: count **every** variant you tried (grids, instruments, windows),
   not just the winner — under-counting inflates DSR.
5. Pair with `walk-forward` and `monte-carlo`; DSR addresses selection bias, they address
   robustness and path risk.

## Manual vs bot
- **Manual**: a reality check before trusting a discretionary system you tuned.
- **Bot**: a required gate in the validation ladder before promoting a strategy.
