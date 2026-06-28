---
name: explain-signal
description: Explain why a TradingView/Pine signal or alert is firing right now — the underlying logic, the regime context, and whether it is trustworthy. Use when the user asks "why did this fire", "why is it long/short", or wants to understand or sanity-check a signal/alert.
---

# Explain Signal

Make a signal legible so the user can trust or veto it — for manual or automated decisions.

## Procedure
1. **Restate the trigger in plain terms**: which Pine condition fired (e.g. EMA(20) crossed
   above EMA(50) at bar close) and the values involved. If you have the alert payload, read
   the `action`, `price`, `atr`, `account_track`.
2. **Context**: classify the `regime` (trading-core) — does the signal agree with the regime,
   or is it a counter-trend/sideways trigger likely to whipsaw? Add the intermarket read for
   metals when available.
3. **Trust check**: is this a confirmed bar-close signal (not repainting)? Does it match the
   engine's logic (parity)? Would it survive costs (`cost-model`)?
4. **Verdict**: take / skip / wait-for-confirmation, with the one reason that matters.

## Manual vs bot
- **Manual**: understand the alert ping before you act on it.
- **Bot**: audit why the bot is about to trade — a quick legibility check before/after a fill.
