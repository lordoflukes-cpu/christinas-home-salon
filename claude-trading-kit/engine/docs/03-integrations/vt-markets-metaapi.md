# Integration · VT Markets (CFD) via MetaApi / MT5

VT Markets is a forex/CFD broker on **MetaTrader 4/5**. It has **no native REST API** —
it supports your own **Expert Advisors (EAs)** and signals. So programmatic access is
through MetaTrader, two ways:

## Option A (default, cross-device): MetaApi cloud

- **MetaApi** is a cloud REST + WebSocket API for MT4/MT5 (free tier; Python SDK
  `metaapi-cloud-sdk`, Python 3.8+). You connect your VT Markets MT4/MT5 **investor/
  trader credentials** to a MetaApi *account*, and then trade/stream via the cloud API
  from **any device** (phone/Mac/Windows) — no local terminal required.
- Capabilities: quotes/candles streaming, positions/orders, place/modify/close,
  account info, history. Good fit for our cloud-first posture.
- **Why default:** works from Mac/phone, runs 24/7 in the cloud, one integration for
  both data and execution.
- **Trade-offs:** third-party dependency; free tier limits; latency higher than a
  co-located terminal (fine for our H4/daily, swing, and manual cadence — we are not HFT).

## Option B (optional, Windows-desktop): self-hosted MT5 + Python

- The official **`MetaTrader5`** Python package drives a **locally running MT5
  terminal** — **Windows-only**. Full control, no third party, lowest latency.
- **Why optional:** can't run on the user's Mac or phone, so it's never the default;
  it's a selectable backend behind the execution interface for when the user is at the
  Windows desktop.

## The execution interface (both options implement it)

See `execution-abstraction.md`. Both backends expose: `get_price`, `get_account`,
`get_positions`, `place_order(idempotency_key, …)`, `modify`, `close`, `flatten_all`.
VT Markets orders go to the **CFD/`cfd` track**.

## Auth & secrets

- MetaApi: account token + provisioning of the MT login/password/server (VT Markets
  server name). Store via secrets manager; never commit. (docs/08)
- Self-hosted MT5: terminal login/password/server configured locally; Python connects
  to the running terminal.

## Tax

VT Markets = **CFD → taxable (UK CGT)**; losses are offsettable. Tag all VT Markets
fills `account_track: cfd` for the records the `tax-uk` skill compiles. (docs/07)

## Stub

Ship a **paper backend** implementing the same interface (reuse `vendor/gold-bot`
`PaperBroker`) so execution is fully testable with no MetaApi/MT5 connection.

## Sources
VT Markets MT4/MT5 help + EA support; MetaApi cloud SDK (free tier, MT4/MT5);
MetaTrader5 Python package (Windows).
