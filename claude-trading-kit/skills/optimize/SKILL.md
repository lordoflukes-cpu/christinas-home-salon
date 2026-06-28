---
name: optimize
description: Tune strategy parameters the safe way — sweep a neighbourhood and check the chosen point sits on a robust performance PLATEAU, not a lone overfit spike — and deflate the resulting Sharpe for the number of trials. Use when optimizing/selecting parameters or worried a backtest is overfit.
---

# Optimize (plateau + deflated Sharpe)

Parameter optimization is where overfitting is born. The goal is **robust** parameters, not
the single best-looking ones.

## Procedure
1. **Plateau check** — call **`parameter_plateau`** (backtest-engine MCP) around your
   candidate `center_fast`/`center_slow`. Report `grid_mean`, `grid_std`, `on_plateau`, and
   the grid. Robust params have neighbours that perform similarly (low `grid_std` vs
   `grid_mean`); if performance collapses at ±10%, it's overfit — reject that point.
2. **Deflate the Sharpe** — every parameter you tried is a trial. Call **`deflated_sharpe`**
   with the selected strategy's **per-period** Sharpe, `n_trials` (how many configs you
   tested), `n_obs`, and (if known) `skew`/`kurtosis`. A DSR < 0.90 means the result is
   likely luck from multiple testing.
3. Confirm survivors with `walk_forward` and `monte_carlo`.
4. **Discipline:** pick parameters on a plateau even if a spike scores higher; never iterate
   until the metrics pass (that's fitting the test).

## Manual vs bot
- **Manual**: choose discretionary settings (e.g. MA lengths) you can trust across conditions.
- **Bot**: select live parameters and record `n_trials` so the deflated Sharpe stays honest.
