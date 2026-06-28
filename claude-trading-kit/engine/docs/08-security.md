# 08 · Security

This stack can move real money. Security is a build requirement, not an afterthought.

## Webhook authentication (TradingView → bridge)

- **HMAC-SHA256** over the raw body using a shared secret; reject on mismatch. The
  in-payload `secret` token is a weak fallback — pair it with HMAC.
- **IP allow-list** TradingView's webhook egress ranges where feasible.
- **HTTPS only**; reject plain HTTP.
- **Replay protection**: include `tv_time`/nonce; reject stale or duplicate timestamps.

## Idempotency (no double-fills)

- Every order carries a `client_order_id` (from the alert). The bridge and execution
  layer **dedupe** on it; a retried/duplicated alert must never create a second order.
- Persist seen ids (short TTL) so restarts don't replay.

## Risk-gate (defence in depth)

Even an authenticated alert passes the **risk-gate** before execution: size within
limits, daily-loss not breached, **news-window** clear, **kill-switch** not engaged.
The gate can always say no.

## Secrets management

- **Never commit secrets.** `.env`/`secrets/` are git-ignored; use env vars or a secrets
  manager (cloud KMS / Vault). Document required vars in each plugin SPEC, values nowhere.
- **Least privilege**: broker API keys scoped to trade-only (no withdrawals); separate
  read-only keys for data where possible.
- **Rotate** keys; revoke on exposure.

## Telegram control auth

- Only an **allow-listed chat/user id** may issue control commands; reject all others.
- Treat inbound messages as untrusted input — strict parse, never `eval`.
- Sensitive opens/scales go through the risk-gate; halt/flat are safe-by-design.

## Execution safety

- **Kill-switch** primitive (`flatten_all` + block-new) wired to Telegram and the gate.
- **Reconciliation** every cycle: broker truth vs internal state; mismatch → halt + alert.
- **Rate-limit & backoff** to respect venue API limits; dead-letter failed orders for
  human review rather than blind retry.

## Build-time

- Stub mode must use **no real keys**.
- A pre-deployment security checklist (Phase 6) verifies: HMAC on, idempotency tested,
  secrets externalised, Telegram allow-list set, kill-switch tested by actually flattening,
  least-privilege keys, logs/alerts on auth failures.
