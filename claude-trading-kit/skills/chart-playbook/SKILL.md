---
name: chart-playbook
description: Run a disciplined discretionary chart-read checklist for a setup — the same rules the bot encodes — so manual and automated decisions agree. Use when the user is reading a chart by hand, deciding whether to take a discretionary trade, or wants a structured pre-trade read.
---

# Chart Playbook (discretionary read)

A manual read that mirrors the bot's logic, so you and the bot agree on what a valid setup
is. The playbook decides *whether it's a setup*; the `risk-check` decides *how big*.

## The read (in order)
1. **Trend / direction** — is EMA(fast) above/below EMA(slow)? (Load `ts_trend_indicator.pine`.)
   Only trade with the trend; flat EMAs = no setup.
2. **Regime** — directional + volatile (press), directional + quiet (normal), sideways
   (stand aside / shrink). Use the `regime` skill (trading-core) for the read.
3. **Stop & risk** — ATR-based stop (the dashed line on the indicator). Run
   `risk-check` (trading-core) to size at ≤0.5% risk before committing.
4. **Levels / structure** — is price at a sensible entry vs recent swing highs/lows, not
   mid-range chasing?
5. **Intermarket (metals)** — DXY / real yields direction; is the gold-silver ratio
   confirming or warning? (When the data plugin is available.)
6. **News window** — no entry inside the news-window (±`guard_minutes`, default 2) around
   high-impact releases; use the `news-window` skill to check.

## Decision
```
SETUP: yes/no — <trend + regime in one line>
ENTRY/STOP: <price> / <ATR-based stop>   RISK: run risk-check
GATES: regime <ok/hostile> · levels <ok/chasing> · news <clear/blocked>
```
If any gate fails, **no trade**. A "no" is a valid, common outcome.

## Manual vs bot
- **Manual**: this *is* the discretionary decision process.
- **Bot**: this is the human-readable version of the bot's coded rules — keep them in sync;
  if they disagree, that's a bug to reconcile (parity, docs/06).
