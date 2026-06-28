---
name: reconcile
description: Reconcile the bot's internal positions against the broker's reported positions and halt + alert on any mismatch. Use after fills, on a schedule, or when positions look wrong — a desynced position is how small bugs become large losses.
---

# Reconcile

Broker truth vs internal state. A mismatch means something is wrong — stop trading and find out.

## Procedure
1. Call **`reconcile`** (execution MCP) → per-track `{ok, mismatches}`.
2. If `ok` for all tracks → fine; log and continue.
3. If any **mismatch**:
   - **Engage the kill-switch immediately** (`flatten_all` or Telegram `/halt`) and **alert** —
     do not place new orders while desynced.
   - Inspect the mismatch (symbol, internal vs venue units). Common causes: a missed fill, a
     partial fill, a manual trade outside the bot, or a dropped order.
   - Hand off to the `incident-responder` agent to diagnose and propose a fix.
   - Resume only once internal and venue agree.
4. Run reconcile every cycle in production; treat it as a safety invariant, not a report.

## Manual vs bot
- **Manual**: confirm your records match the broker after a session of hand trading.
- **Bot**: a mandatory per-cycle safety check; mismatch → auto-halt + alert.
