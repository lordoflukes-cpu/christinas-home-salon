---
name: route-test
description: Dry-run a ts.alert.v1 alert through the bridge pipeline (validate → auth → idempotency → risk-gate → route) and explain the decision — which stage fired, the computed size/stop, and where it routed. Use to test or debug an alert before/without wiring TradingView, or to check what the bridge would do right now.
---

# Route Test (dry-run an alert)

See exactly what the bridge does with an alert — without TradingView, without a server.

## Procedure
1. Build (or take) a `ts.alert.v1` payload (use charting's `make_alert_payload`).
2. Call **`dry_run_alert`** (bridge-control MCP). It signs (if a secret is set) and runs the
   full pipeline in-process, returning a Decision with `status`, `stage`, `reason`, `mode`,
   `units`, `stop`, `route`.
3. **Explain the result**:
   - `rejected` (parse/validate/auth) → the alert is malformed or unsigned/tampered.
   - `duplicate` → the `client_order_id` was already seen (idempotency working as intended).
   - `blocked` (riskgate) → say which guard fired: kill-switch, news-window, daily-loss,
     missing ATR, or size-over-cap.
   - `routed` → `mode=auto` (paper execution) or `mode=manual` (suggestion), with `units`/`stop`.
4. To probe guards: `set_kill_switch(true)` / `set_news_window(true)` then re-run and show the
   block; reset after. Use `recent_decisions` / `bridge_status` to inspect.

## Manual vs bot
- **Manual**: confirm an alert would produce the *suggestion* you expect, and why.
- **Bot**: confirm an auto strategy sizes and routes correctly, and that the kill-switch and
  news-window actually block it — before trusting it live.
