---
name: risk-check
description: Pre-trade risk gate — compute ATR/volatility-targeted position size and validate it against per-trade, daily-loss and max-drawdown limits before any order. Use whenever the user is about to enter a trade, asks "how big", "what size", "can I take this trade", or mentions sizing/risk for a position in gold, silver, FX or any instrument.
---

# Risk Check (pre-trade gate)

Run this BEFORE any entry, manual or automated. Survival beats edge: a trade that passes
the rules but loses is fine; a trade that breaks the rules is a failure even if it wins.

## Inputs (ask if missing — never invent)
- Account equity; risk per trade (default **0.5%**); instrument price and **ATR**; stop
  distance in ATR multiples (default **2.0**); point value (1.0 for spot/oz); today's
  realized P&L + daily-loss limit (default **5%**); max-drawdown state; **account track**
  (`cfd` or `spreadbet`).

## Procedure
1. Compute size via the **`position_size`** tool (backtest-engine MCP):
   `position_size(equity, atr, risk_frac, stop_atr_mult, point_value)` → `units`,
   `dollar_risk_at_stop`. *(Fallback if the tool is unavailable: units =
   (equity × risk_frac) / (atr × stop_atr_mult × point_value).)*
2. **Validate the gates — REFUSE if any fail:**
   - `dollar_risk_at_stop` must equal `risk_frac × equity` (sanity).
   - A single stop-out must not breach the **daily-loss limit** given today's P&L.
   - Correlated instruments (gold + silver) are **one risk bucket** — size the bucket, not
     each leg.
   - If the kill-switch is engaged or a high-impact **news window** is active → BLOCK.
3. Output recommended units, dollar risk, stop price, and PASS/BLOCK with reasons.

## Output
```
SIZE: <units> units  (risk $<x> = <risk_frac>% of $<equity>)  track:<cfd|spreadbet>
STOP: <stop_atr_mult>×ATR = <distance> → stop @ <price>
GATES: daily-loss <ok/breach> · bucket <ok/note> · news/kill <clear/blocked>
VERDICT: PASS ✅  |  BLOCK ❌ — <reason>
```
If a gate can't be verified, default to BLOCK and say what's missing. For high-stakes
decisions, hand off to the `risk-manager` agent for an independent veto.

## Manual vs bot
- **Manual**: size a discretionary trade before you click; the output is your ticket.
- **Bot**: this is the risk-gate the bridge runs before placing an order.
