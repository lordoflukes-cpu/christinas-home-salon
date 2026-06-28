# trading-research

Honest backtesting + the anti-overfitting validation suite for Claude, wrapping the
verified `vendor/gold-bot` engine. Runs out of the box on synthetic data (no credentials).

## What's inside

**MCP connector — `backtest-engine`** (stdio). Tools:
- `run_backtest` — dual-EMA+ATR trend strategy → §11 scorecard + verdict
- `position_size` — ATR / vol-target sizing
- `cost_model` — all-in cost (spread + commission + carry) + suggested `cost_per_unit`
- `walk_forward` — rolling re-optimization, out-of-sample, efficiency
- `monte_carlo` — trade-reshuffle drawdown/return distribution
- `parameter_plateau` — robustness map (plateau vs overfit spike)
- `deflated_sharpe` — multiple-testing + non-normality correction
- `classify_regime` — direction × volatility + posture
- `metrics_explain` — gates & metric definitions

**Skills** (`/trading-research:<name>`): `backtest`, `walk-forward`, `monte-carlo`, `optimize`.
**Agents**: `backtest-analyst`, `red-team-skeptic`, `quant-validator`.

## Design

- The vendored engine stays **pristine** (ADR 0005); the cost model, validation suite, and
  regime classifier are NEW code in `mcp/research/` that imports the engine via a sys.path
  shim (`research/goldbot.py`).
- Pure-Python; the only runtime dependency is the **MCP SDK**.

## Setup / test

```bash
pip install -r mcp/requirements.txt      # mcp, pytest
pytest                                    # validation-suite tests
python mcp/backtest_server.py             # run the MCP server (stdio)
```

## Honesty

Synthetic data validates **plumbing only — not edge**. A FAIL verdict is the common, correct
outcome; never tune parameters to force a PASS. Validate any PASS with walk-forward +
Monte-Carlo + parameter-plateau + deflated Sharpe before trusting it.
