---
name: decay-scan
description: Run the strategy-decay dashboard — rolling expectancy, payoff compression, drawdown vs historical band, behaviour drift, and live-vs-backtest tracking error — to catch an edge eroding before the equity curve rolls over. Use for a decay check, "is the edge still working", or a periodic health step.
---

# Decay Scan

Every edge decays (~5–10%/yr, faster under crowding/stress). Watch the **distribution of
outcomes**, not just the PnL line — by the time equity clearly rolls over you've given a lot back.

## Checks (compute over the last N trades / weeks)
1. **Rolling expectancy / payoff** — is per-trade R compressing vs the tested baseline?
2. **Drawdown vs band** — is current drawdown beyond the `monte-carlo` p95 / worst tolerance?
3. **Behaviour drift** — have trade frequency, holding period, or win rate drifted from the
   tested profile? (Drift in behaviour often precedes drift in PnL.)
4. **Live-vs-backtest tracking error** — is realised slippage/fill diverging from the model?
   (A widening gap means the cost model — not necessarily the signal — is breaking.)
5. **Regime context** — has the market been in a hostile regime (`regime`), explaining weakness
   without true decay?

## Response ladder (in order — do NOT jump to rewriting the signal)
1. **De-risk first** (cut size / exposure) — safe, reversible.
2. **Re-validate** — `walk-forward` + `cost-model` on recent data: edge gone, or normal drawdown?
3. **Re-optimize or retire** — only if validation confirms structural decay (and only on the
   scheduled cadence — avoid meta-overfitting).

## Output
```
DECAY: expectancy <trend> · drawdown <in/out of band> · behaviour <stable/drift> · slippage <ok/widening>
VERDICT: healthy ✅ | de-risk ⚠️ | re-validate/retire ❌   NEXT: <one action>
```

## Manual vs bot
- **Manual**: check whether your own edge/discipline is slipping.
- **Bot**: a scheduled monitor; a red flag triggers de-risk before investigation.
