---
name: deploy-check
description: Run the pre-deployment gate before a strategy goes live — tests green, backtest + validation gates passed, risk limits and kill-switch configured, reconciliation working, secrets set — and give a GO / NO-GO. Use before promoting a strategy to paper/live or flipping a strategy to auto.
---

# Deploy Check (pre-deployment gate)

The last gate between a good idea and real money. **GO only if every box is green** — any red
is a NO-GO.

## Checklist
1. **Tests** — the engine/plugin pytest suites pass (`engine/` plugins). No skips.
2. **Validation ladder passed** — `backtest` clears §11 gates; `walk-forward` stable (WFE ≥ ~0.5,
   positive OOS); `monte-carlo` p95 drawdown survivable; `parameter_plateau` on a plateau;
   `deflated-sharpe` ≥ ~0.95 (with honest `n_trials`).
3. **Risk configured** — risk-per-trade ≤ cap; daily-loss + max-drawdown limits set; correlated
   buckets capped; `prop-firm-check` passed if on a funded account.
4. **Kill-switch + reconciliation** — kill-switch flattens and blocks (test it for real);
   `reconcile` returns ok; idempotency on (no double-fills).
5. **News-window wired** — the data poller is setting the bridge guard; entries block around releases.
6. **Ops** — execution venue configured for the chosen track; cloud bridge/execution reachable;
   Telegram alerts + `/halt` working; secrets set via env/secrets-manager (not committed).
7. **Paper first** — has it run on paper/demo within tolerance of backtest for the agreed period?

## Output
```
GATE: tests <✓/✗> · validation <✓/✗> · risk <✓/✗> · kill/reconcile <✓/✗> · news <✓/✗> · ops <✓/✗> · paper <✓/✗>
VERDICT: GO ✅  |  NO-GO ❌ — <the failing item(s)>   (start a new strategy in MANUAL, not auto)
```

## Manual vs bot
- **Manual**: confirm you've done the homework before committing real capital to a discretionary system.
- **Bot**: the mandatory gate before flipping a strategy_id to `auto` in the bridge.
