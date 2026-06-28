---
name: strategy-scaffold
description: Generate a new strategy module from the engine's template — wired to the same ATR sizing, no-look-ahead backtest, and scorecard as the existing trend system — so a new idea is testable in minutes and stays parity-correct. Use when starting a new strategy, prototyping an idea, or adding a signal.
---

# Strategy Scaffold

Spin up a new strategy that plugs into the verified engine, so it inherits honest backtesting,
ATR sizing, and the scorecard for free.

## Procedure
1. Clarify the idea: instrument(s), timeframe, entry/exit logic, the signal inputs (e.g. EMAs,
   breakout, mean-reversion), and the stop basis (default ATR).
2. Copy the engine's strategy shape (`engine/vendor/gold-bot/app/strategy/trend.py` —
   `DualEMATrend`): a class with `warmup()` and `signal(highs, lows, closes) -> {direction, atr}`.
   Implement the new logic there; keep the **same interface** so `run_backtest` works unchanged.
3. **Parity**: if this strategy will also run on TradingView, mirror its logic in Pine
   (`pine-author`) and keep the two in sync.
4. Smoke-test immediately: `backtest` on synthetic + a CSV; then the validation ladder
   (`walk-forward`, `monte-carlo`, `optimize`, `deflated-sharpe`).
5. Avoid look-ahead by construction (signal on closed bars; execute next open) — the engine
   enforces this; don't bypass it.

## Output
A new strategy module (same interface as `DualEMATrend`), a first `backtest` scorecard, and the
recommended next validation steps. Note it's unproven until it clears the §11 gates + validation.

## Manual vs bot
- **Manual**: prototype a discretionary idea to see if it even has an edge before trading it.
- **Bot**: the starting point for any new automated strategy; must pass the pre-deployment gate.
