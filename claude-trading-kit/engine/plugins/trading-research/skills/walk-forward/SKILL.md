---
name: walk-forward
description: Run walk-forward analysis — rolling re-optimization on in-sample windows tested on subsequent out-of-sample windows — to check whether a strategy's edge survives out-of-sample. Use when validating robustness, checking for overfitting, or before approving a strategy for live/paper trading.
---

# Walk-Forward Analysis

The practitioner gold standard (Pardo): repeatedly optimize on a window, then test on the
next unseen window. An edge that only exists in-sample is overfit.

## Procedure
1. Call the **`walk_forward`** tool (backtest-engine MCP) with `csv_path` (or synthetic),
   `in_sample`, `out_sample`, `step`, and cost assumptions.
2. Report: `n_windows`, `mean_is_sharpe`, `mean_oos_sharpe`, `walk_forward_efficiency`
   (WFE = mean OOS ÷ mean IS), `oos_positive_windows`, and the `verdict`.
3. **Interpret:**
   - WFE ≥ ~0.5 **and** positive mean OOS Sharpe → reasonably stable.
   - WFE < 0.5, negative OOS, or few positive windows → the edge degrades out-of-sample;
     do **not** go live.
   - Beware **meta-overfitting**: don't tune the window sizes/fitness until WFE looks good.
4. Pair with `monte_carlo` (drawdown distribution) and `parameter_plateau` (param robustness)
   for a full picture.

## Manual vs bot
- **Manual**: gain confidence (or not) in a discretionary system before committing capital.
- **Bot**: a required gate before a strategy is promoted to paper/live.
