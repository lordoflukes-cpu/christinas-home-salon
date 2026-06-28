---
name: pine-alert
description: Build and validate the TradingView alert message (the ts.alert.v1 webhook JSON) that a Pine strategy sends to the trading-bridge, and HMAC-sign a sample for testing. Use when setting up a TradingView alert/webhook, designing the alert payload, or debugging why the bridge rejects an alert.
---

# Pine Alert (the webhook payload)

The alert message is the **contract** between TradingView and the bridge. Get it right or
orders silently fail.

## Procedure
1. Build the payload with **`make_alert_payload`** (charting-tools MCP): `strategy_id`,
   `symbol`, `action` (buy/sell/close), `account_track` (cfd/spreadbet), `price`, `atr`,
   `stop_atr_mult`, `risk_frac`, and a **unique `client_order_id`** (the idempotency key).
   The tool returns the payload and a validation result.
2. **Validate** with `validate_alert` — fix every error (missing field, bad enum, entry
   without `atr`, limit without `limit_price`).
3. For the live Pine alert, use the template in `pine/alert_message.tmpl` (TradingView
   `{{...}}` placeholders resolve at fire time). Keep the **secret out of shared charts** —
   the bridge holds the HMAC key and verifies signatures.
4. To test end-to-end, **`sign_payload`** a sample with a test secret and POST it to the
   bridge with `tools/post_alert.py` (once the bridge exists); the bridge must accept it and
   reject a tampered copy.

## Notes
- `client_order_id` must be unique per intended order (e.g. `{{strategy.order.id}}-{{timenow}}`).
- entries (buy/sell) must include `atr` so the risk-gate can size the position.

## Manual vs bot
- **Manual**: an alert that just notifies you (no order) — still use ts.alert.v1 so the
  bridge can turn it into a *suggested* action in Telegram.
- **Bot**: the alert that becomes an order — must validate and be HMAC-signable.
