---
name: trade-journal
description: Record a structured trade-journal entry (rationale, setup, risk, outcome in R, and plan-adherence) and append it to the journal log; summarise recent entries on request. Use when the user wants to log/journal a trade, record why they entered or exited, or review their trading.
---

# Trade Journal

Discipline is the decisive edge, and the journal is how you measure it. Crucially, **track
plan-adherence separately from P&L**: a profitable trade with poor adherence is a warning,
not a win.

## Fields to capture
- Date/time, instrument, direction, timeframe, **account track** (`cfd`/`spreadbet`).
- Setup / rationale (the rule that fired — regime, signal, confluence).
- Entry, stop, target; initial risk in account currency and in **R**.
- Size (units) and how derived (link to a `risk-check`).
- Outcome: exit, P&L, **R-multiple** (= P&L ÷ initial risk).
- Plan adherence (1–5): did you follow the rules? Note any override and why.
- Emotion / lesson.

## Procedure
1. Gather fields (ask only for what's missing; compute R from risk and P&L).
2. Append a Markdown entry to the journal file — default `./trading-journal.md` (create with
   a header if absent):

```md
## <YYYY-MM-DD HH:MM> · <INSTRUMENT> · <LONG/SHORT> · <TF> · <cfd|spreadbet>
- Setup: <rule/rationale>
- Entry/Stop/Target: <e>/<s>/<t>   Risk: $<r> (1R)
- Size: <units>  (from risk-check)
- Outcome: exit <x>, P&L $<p>, **<R>R**
- Adherence: <1-5> — <override note or "followed plan">
- Notes: <emotion / lesson>
```

3. On request, **summarise**: expectancy (avg R), win rate, average adherence, and any
   pattern (e.g. overrides cluster on losing days). Keep per-track records separate (tax).

Never fabricate numbers; leave unknown fields blank and flag them.

## Manual vs bot
- **Manual**: log discretionary trades and your adherence/emotion.
- **Bot**: auto-log fills with adherence = "followed plan" (overrides flagged) for the same
  expectancy/adherence analytics.
