---
name: kelly
description: Compute fractional-Kelly position sizing from a strategy's edge (win rate + payoff or per-trade expectancy) and recommend a safe fraction (quarter–half Kelly), with hard caps. Use when the user asks about Kelly, optimal sizing, or how aggressively to size given an edge.
---

# Kelly (fractional)

Full Kelly maximises growth but has brutal drawdowns and is hypersensitive to estimation error.
Use **quarter- to half-Kelly**; never exceed ~2× Kelly (the "crazy zone" where growth → 0).

## Procedure
1. Gather the edge from realised stats (`trade-journal` / `backtest`): win rate `p` and
   reward:risk `b` (avg win ÷ avg loss), or per-trade expectancy in R.
2. Kelly fraction `f* = p − (1 − p)/b` (for a binary win/loss bet). Guard: if `f* ≤ 0`, there's
   no edge — size zero.
3. Apply a **safety fraction**: recommend **0.25–0.5 × f*** (half-Kelly keeps ~75% of the growth
   rate at ~50% of the volatility). Show full, half, and quarter Kelly.
4. **Reconcile with the risk framework**: convert to risk-per-trade and ensure it does **not**
   exceed the fixed-fractional cap (default 0.5–1%) or the daily-loss limit. The smaller of
   {fractional-Kelly, the risk cap} wins. Hand the final number to `risk-check`.
5. Caveats: edge estimates are noisy and decay; re-estimate periodically (`decay-scan`); Kelly
   assumes you know the true edge — you don't, so stay fractional.

## Output
```
EDGE: p=<…> b=<…> (or expectancy <…>R)   f*(full Kelly)=<…>
RECOMMEND: half-Kelly <…> → risk/trade <…>%  (capped at <cap>%)
```

## Manual vs bot
- **Manual**: a sanity bound on how big a high-conviction discretionary trade should be.
- **Bot**: an input to the sizing config — but the fixed-fractional cap and kill-switch always win.
