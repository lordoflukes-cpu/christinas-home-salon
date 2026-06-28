---
name: webhook-design
description: Configure and validate the TradingView → bridge webhook end-to-end — the alert JSON contract, the HMAC secret, per-strategy auto/manual routing, and the bridge endpoint. Use when setting up the webhook, wiring a strategy to the bridge, or debugging why alerts aren't acted on.
---

# Webhook Design (TradingView → bridge)

Wire the alert path so it's correct and safe before any money moves.

## Procedure
1. **Contract** — the alert must be valid `ts.alert.v1` (use charting's `pine-alert` /
   `validate_alert`). Required: `schema, strategy_id, client_order_id, account_track,
   symbol, action, order_type`; entries also need `atr`. `client_order_id` must be unique
   (idempotency key).
2. **Secret / HMAC** — set `BRIDGE_SECRET` on the bridge (never in the chart). The bridge
   verifies the signature over the canonical body; an unsigned/tampered alert is rejected.
   Keep the secret in a secrets manager (docs/08).
3. **Routing** — decide per strategy: `manual` (the bridge sends a *suggested action*) or
   `auto` (the bridge executes). Default is **manual**; opt a strategy into auto via
   `BRIDGE_AUTO_STRATEGIES="<strategy_id>,…"`. Start every new strategy in manual.
4. **Endpoint** — point the TradingView alert webhook at the bridge `POST /tv-webhook`
   (cloud-hosted URL). Put the signature in an `X-Signature` header or the body `signature`.
5. **Verify** — use `route-test` (or `tools/post_signed_alert.py`) to send a signed sample
   and confirm it routes; send a tampered one and confirm a 401.

## Manual vs bot
- **Manual**: configure a strategy as `manual` so alerts become Telegram suggestions you act on.
- **Bot**: promote a *validated* strategy to `auto` once you trust it (after Phase-5 execution
  and a passing pre-deployment gate).
