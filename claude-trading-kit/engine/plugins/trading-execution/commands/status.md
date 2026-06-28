---
description: Show execution status — open positions, account equity per track, and kill-switch state.
---

# Status

A quick operational snapshot of the execution layer.

- Call `positions` and `account` (execution MCP), or `GET /positions` + `/account` on the
  service, or Telegram `/status`.
- Report: open positions (symbol, units, track, venue), equity per track, and the kill-switch
  state. Note whether each track's venue is the PaperVenue (testing) or a real broker.
- If a reconciliation has flagged a mismatch, surface it prominently and recommend `/halt`.

Keep it to a tight block. If the live-monitor or data plugins are available, add the regime /
news-window context.
