# Workflow · Overfitting tournament

**Purpose.** Generate many candidate strategies and keep only the few that survive multiple-
testing-aware scrutiny — explicitly counting how many you tried.

**Trigger.** Broad search across ideas/params (high overfitting risk).

**Steps.**
1. Generate N candidates (`strategy-researcher` + `strategy-scaffold` / a param grid).
2. `backtest` all; shortlist by §11 gates.
3. **Deflate honestly** — `deflated-sharpe` with `n_trials = N` (every variant tried), per survivor.
   Require DSR ≥ ~0.95.
4. Survivors run the full ladder (`walk-forward`, `monte-carlo`, `parameter_plateau`).
5. `red-team-skeptic` adversarially reviews finalists.

**Tools/agents.** backtest-engine MCP, strategy-researcher, backtest-analyst, red-team-skeptic,
quant-validator.

**Output.** A small set of survivors with deflated stats + the honest trial count; everything
else discarded. Expect most (or all) to die — that's the point.

**Status.** Runnable. The discipline that matters: count ALL trials, don't cherry-pick the winner.
