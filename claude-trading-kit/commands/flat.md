---
description: Flatten — close all open positions across both tracks (without necessarily blocking new orders).
---

# Flat (close positions)

Bring every position to zero.

- Call `flatten_all` (execution MCP) / `POST /flatten` (service) / Telegram `/flat`.
- Report the flattened symbols and then `reconcile` to confirm internal and venue are flat.
- If you want to ALSO stop new trading, use `/halt` instead (that engages the kill-switch).
- Note the track of each close for tax records (`tax-uk`).

If a high-impact news window is active, fills may be poor — say so.
