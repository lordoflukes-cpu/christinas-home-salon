---
name: replay
description: Replay a historical day/session bar-by-bar against the strategy to see exactly what it would have done — entries, exits, sizing, and how the risk-gate behaved — for debugging and trust-building. Use to step through a past day, debug a signal, or understand a trade after the fact.
---

# Replay

Walk a historical session through the strategy deterministically to see and trust its behaviour.

## Procedure
1. Pick the data: a CSV / `candles` slice for the instrument, timeframe, and date range.
2. Step the engine bar-by-bar (no look-ahead): at each closed bar compute `signal`, the ATR
   stop, and the `risk-check` size; execute at the next open — exactly as `run_backtest` does.
   Annotate each decision (why it entered/exited/held).
3. Overlay the gates that would have applied: `news-window` (was a release nearby?),
   kill-switch, daily-loss — show where an entry would have been blocked.
4. Summarise the session: trades, R per trade, max adverse excursion, and any decision that
   looks wrong (→ candidate bug, e.g. repaint or cost mismodelling).
5. Cross-check vs `tv-strategy-tester` if the same logic runs in Pine — divergence is a bug.

## Output
A timeline of decisions (bar → signal → action → size → gate) and a short verdict: did the
strategy behave as designed? Any anomalies to investigate.

## Manual vs bot
- **Manual**: learn the system's behaviour and build trust before trading it by hand.
- **Bot**: debug a live discrepancy by replaying the exact bars the bot saw.
