---
name: market-brief
description: Produce a pre-session market brief for gold/silver — macro (yields/DXY), the day's high-impact calendar, COT positioning, the intermarket read, and the current regime. Use for a morning/pre-session briefing, "what's the setup today", or a daily market summary.
---

# Market Brief (pre-session)

A tight, scannable brief that sets up the session for manual or bot trading.

## Procedure (assemble from the trading-data MCP + research)
1. **Macro** — `fred` / `intermarket`: real yields, DXY, breakeven, gold-silver ratio + read.
2. **Calendar** — `economic_calendar(hours_ahead=24)`: today's high-impact events and times;
   flag the news-windows to avoid (`news_window`).
3. **Positioning** — `cot`: managed-money net (note it's lagged); crowded extremes.
4. **Regime** — `classify_regime` (trading-research/core) on recent `candles`.
5. Synthesise into:

```
GOLD/SILVER BRIEF — <date>
Macro:    DXY <x> · 10y real <y>% · G/S ratio <z>  → <one-line>
Calendar: <events + times>; avoid <news windows>
Position: gold MM net <…> (lagged)  → <crowded? />
Regime:   <up/side/down × quiet/volatile> → posture <press/normal/shrink/stand aside>
TAKE:     <one-line plan for the session>
```

Keep it honest: data is sim unless keys are set; COT is lagged.

## Manual vs bot
- **Manual**: your morning read before deciding what to trade by hand.
- **Bot**: a daily context check; feeds regime/size and the news-window guard.
