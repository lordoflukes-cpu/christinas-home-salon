---
name: news-window
description: Check upcoming high-impact economic releases (CPI/FOMC/NFP/PMI) and whether a news-window is active right now, and recommend halting new entries. Use when the user asks about news, economic events, whether it's safe to trade now, or why the bridge is blocking entries.
---

# News Window

The single highest-value live rule for a metals bot: **don't open new positions in the
±N-minute window around a high-impact release** (slippage and whipsaw are worst there).

## Procedure
1. Call **`news_window`** (trading-data MCP) → `{active, next_event, guard_minutes}`.
2. Call **`economic_calendar(hours_ahead)`** for the schedule (title, impact, minutes away).
3. Recommend:
   - `active: true` → **do not open new entries**; existing positions/closes are fine.
   - approaching (next_event within ~2× the guard) → prepare to stand aside.
   - clear → normal.
4. Explain the bridge link: the **news-window poller** (`tools/news_window_poller.py`) POSTs
   this state to the bridge's `/api/news-window`, so the risk-gate blocks entries automatically.
   If the bridge isn't blocking when it should, check that the poller is running.

## Manual vs bot
- **Manual**: a "don't trade now" reminder before you place a discretionary order.
- **Bot**: the poller flips the bridge guard so automated entries are blocked around releases.
