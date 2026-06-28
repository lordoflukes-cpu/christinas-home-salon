# Workflow · Multi-instrument sweep

**Purpose.** Find which instruments and parameter regions a strategy actually works on — and
whether it's broadly robust or a one-market fluke.

**Trigger.** A promising strategy you want to generalise / diversify.

**Steps (fan-out per instrument × param grid).**
1. For each instrument (gold, silver, other trend markets) × a small param grid: `backtest`.
2. Rank by out-of-sample-relevant metrics (Calmar, profit factor, expectancy-R), not just return.
3. `parameter_plateau` on the leaders — keep only those on a plateau (drop spikes).
4. Note correlation across winners (`correlation-matrix`) → feeds the ensemble-builder.

**Tools/agents.** backtest-engine MCP, backtest-analyst, red-team-skeptic.

**Output.** A ranked instrument×param table with plateau + correlation flags; the robust subset to
take forward (or "works nowhere" → reject).

**Status.** Runnable (synthetic now; real data makes it meaningful).
