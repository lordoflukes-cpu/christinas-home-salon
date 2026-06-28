# SPEC · trading-bridge

**Purpose.** The single inbound entry point: TradingView alert → verify → risk-gate →
route. The junction where manual and bot flows split. Build phase: **3**.

## Contents (planned)
- **Service**: a cloud-hostable webhook receiver (FastAPI) implementing the `ts.alert.v1`
  contract: **HMAC verify → idempotency (client_order_id) → risk-gate → route**.
  - route = **bot**: hand to `trading-execution`; **manual**: send a Telegram suggestion.
- **Connector (MCP)**: `tradingview-bridge` to inspect/control the service (recent alerts,
  health, replay a test alert).
- **Skills**: `webhook-design` (P1, author/validate the JSON contract), `route-test` (P2,
  dry-run an alert through auth/idempotency/risk-gate).

## Manual + bot
- Manual: a valid alert produces a risk-gated **suggested action** via Telegram.
- Bot: a valid alert produces a risk-gated **order** via execution. Same gate, same checks.

## Cross-device
**Cloud-hosted** so it runs 24/7 independent of the user's device — central to ADR 0007.

## Dependencies / reuse
- Risk-gate reuses `trading-core` sizing/limits and `trading-data` news-window/kill state.
- Routes to `trading-execution`; notifies via the Telegram connector.

## Secrets
HMAC secret; Telegram token. Never committed (docs/08). Stub: a local poster that signs
sample alerts so the whole pipeline is testable with no TradingView.

## Definition of done
Rejects bad HMAC; dedupes repeated `client_order_id`; blocks on news-window/kill-switch;
routes correctly in a dry-run; fully testable via the stub poster.
