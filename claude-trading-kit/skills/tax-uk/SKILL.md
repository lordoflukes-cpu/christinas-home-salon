---
name: tax-uk
description: Keep UK tax records split by account track and estimate CGT — CFD (VT Markets) is taxable above the annual allowance, spread bet (IG) is tax-free. Use for tax record-keeping, a CGT estimate, or deciding which track suits a strategy. Not tax advice.
---

# UK Tax Records (dual track)

The two tracks are taxed differently — keep them **separate** and record every fill's track.

| Track | Product | UK tax | Losses |
|---|---|---|---|
| `cfd` (VT Markets) | CFD/forex | **CGT** above the annual allowance (£3,000, 2025/26) | offsettable / carry-forward |
| `spreadbet` (IG) | spread bet | **tax-free** (no CGT, no stamp duty) | not offsettable |

## Procedure
1. Collect realized fills as `{track, pnl}` (the journal / execution layer provides these).
2. Call **`tax_records`** (execution MCP) → per-track realized P&L, the CFD taxable amount above
   the allowance, an estimated CGT, and the spread-bet "tax-free" note.
3. Present it clearly, **with the disclaimer**: educational estimate, not tax advice — confirm
   with a qualified UK tax adviser (see the `tax-adviser-uk` agent); CGT rates/allowance change.
4. **Track-selection guidance**: the tax-free spread-bet track suits own-capital / multi-day
   holds; CFD suits cases needing instrument breadth or EA flexibility (and where loss-offset
   matters in a mixed year). Don't split one strategy's fills across tracks without intent.

## Manual vs bot
- **Manual**: tally your year and estimate what's due per track.
- **Bot**: auto-tag fills by track so records and the CGT estimate stay correct continuously.
