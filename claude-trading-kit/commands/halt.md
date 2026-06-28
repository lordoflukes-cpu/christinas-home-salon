---
description: Engage the kill-switch — flatten all positions and block new orders immediately.
---

# Halt (kill-switch)

Stop everything now. This is the emergency brake.

- Call the execution layer's flatten/halt: `flatten_all` (execution MCP) or `POST /flatten` on
  the execution service, or Telegram `/halt`. All engage the kill-switch (block-new) AND
  flatten every open position across both tracks.
- Confirm the result: kill-switch engaged + the list of flattened symbols. Then `reconcile` to
  confirm internal and venue positions are both flat.
- Also hit the bridge `POST /api/kill-switch` so the risk-gate blocks new alerts upstream.

Treat as highest priority — do it before anything else in the turn. To resume later, release the
kill-switch deliberately (execution `/resume`) only once you've confirmed why you halted.
