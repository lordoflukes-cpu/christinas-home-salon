---
name: ensemble
description: Build a decorrelated ensemble across multiple lookbacks and/or instruments instead of betting on one "best" parameter set — the single biggest robustness lever for a trend system. Use when combining strategies/parameters, diversifying, or hardening a system against parameter decay.
---

# Ensemble Builder

A signal that only works at one lookback is overfit; an ensemble that works across the
neighbourhood is robust. Diversifying lookbacks and instruments smooths the curve and raises
effective trade frequency.

## Procedure
1. Define the candidate set: several (fast, slow) pairs spanning a plateau (e.g. 10/40, 20/50,
   30/80) and/or several instruments (gold, silver, other trend markets).
2. Backtest each via the **`run_backtest`** tool; keep only members that individually clear the
   §11 gates (don't average in junk).
3. Check **decorrelation**: prefer members whose equity curves / returns aren't highly
   correlated (use `correlation-matrix`). Drop near-duplicates.
4. Combine: average signals or allocate risk equally / by inverse-vol across members (size each
   with `risk-check` so total risk stays within limits — treat correlated metals as one bucket).
5. Validate the ensemble as a whole: `walk-forward` + `monte-carlo`; confirm it beats its median
   member on Calmar / drawdown, not just return.

## Output
The selected members, their correlation, the combination rule, and the ensemble's scorecard vs
the best single member. Reject if the ensemble doesn't improve robustness.

## Manual vs bot
- **Manual**: a basket of settings/markets you rotate attention across.
- **Bot**: run members in parallel under one risk budget; far more decay-resistant than a single config.
