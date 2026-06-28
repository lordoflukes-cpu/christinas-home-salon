---
name: cot-report
description: Summarise CFTC Commitments of Traders positioning for gold/silver (managed-money net) and what crowded extremes imply — always flagging that it is weekly and lagged. Use when the user asks about positioning, COT, speculative longs/shorts, or crowding.
---

# COT Report

Positioning context — useful for spotting crowding and squeeze/reversal risk, never for timing.

## Procedure
1. Call **`cot`** (trading-data MCP) → managed-money net contracts for gold/silver + `as_of`.
2. **Always state the lag**: COT is Tuesday data released Friday — never treat it as real-time.
3. Interpret:
   - Very crowded **long** → vulnerable to a long-squeeze on bad news; less fuel to push higher.
   - Crowded **short** → squeeze risk on good news.
   - Trend-following note: managed money is trend-following, so extremes often coincide with
     mature trends, not turning points — use as context, not a trigger.

## Manual vs bot
- **Manual**: a sanity check on how crowded your side of the trade is.
- **Bot**: a slow context input (e.g. trim size when positioning is at an extreme) — never a
  fast signal.
