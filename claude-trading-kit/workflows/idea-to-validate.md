# Workflow · Idea → design → backtest → validate

**Purpose.** Turn a raw idea into a strategy that's either validated for paper/live or honestly
rejected — fast and overfit-resistant.

**Trigger.** "I have a strategy idea" / a market observation worth testing.

**Steps (fan-out where useful).**
1. **Generate** — `strategy-researcher`: 1–3 cited, testable hypotheses + the failure modes.
2. **Scaffold** — `strategy-scaffold`: implement each on the engine interface (parity-aware).
3. **Backtest** — `backtest` per idea (realistic `cost-model`); keep those clearing §11 gates.
4. **Validate (parallel)** — for survivors: `walk-forward`, `monte-carlo`, `optimize`
   (plateau), `deflated-sharpe` (honest n_trials).
5. **Adversarial check** — `red-team-skeptic` tries to refute each; `quant-validator` gives GO/NO-GO.

**Tools/agents.** strategy-researcher, strategy-scaffold, backtest-analyst, quant-validator,
red-team-skeptic; backtest-engine MCP.

**Output.** A ranked shortlist with scorecards, validation results, and a GO/NO-GO per idea +
the single biggest risk to each. Most ideas should die here — that's success.

**Status.** Runnable on the engine (synthetic or your CSV). Real edge needs real data.
