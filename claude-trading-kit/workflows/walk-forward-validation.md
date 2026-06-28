# Workflow · Walk-forward validation

**Purpose.** Confirm a strategy's edge survives out-of-sample before trusting it.

**Trigger.** A strategy passed an in-sample backtest and you're considering paper/live.

**Steps.**
1. `walk_forward` (backtest-engine): rolling re-optimize in-sample → test OOS → aggregate; report
   walk-forward efficiency (WFE) + per-window OOS.
2. Require WFE ≥ ~0.5 and positive mean OOS Sharpe across most windows; watch meta-overfitting.
3. Pair with `monte-carlo` (drawdown distribution) and `parameter_plateau` (robust params).
4. `quant-validator` reads the suite → stable / unstable verdict.

**Tools/agents.** backtest-engine MCP (walk_forward, monte_carlo, parameter_plateau),
quant-validator.

**Output.** WFE, OOS stability, plateau status → GO/iterate/kill. Unstable ⇒ do **not** go live.

**Status.** Runnable on the engine.
