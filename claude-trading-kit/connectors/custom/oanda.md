# Connector · OANDA v20 (SPEC)

**Purpose.** Spot metals/FX execution + data via OANDA's v20 REST/streaming API — an alternative
execution venue (the kit's primary venues are VT Markets via MetaApi and IG spread-bet).

**Status.** SPEC. Implement as an `ExecutionVenue` backend
(`engine/plugins/trading-execution/exec/interface.py`) alongside MetaApi/IG.

**Auth.** OANDA account id + API token (practice or live), from the OANDA account "Manage API
Access" page. Env: `OANDA_TOKEN`, `OANDA_ACCOUNT`, `OANDA_ENV` (practice|live → base host
`api-fxpractice.oanda.com` vs `api-fxtrade.oanda.com`). Token = trade-only, least-privilege, in a
secrets-manager, never committed; revoke/rotate if leaked. Reference: the official **OANDA v20 REST
API** docs (developer.oanda.com).

**Tools / endpoints to expose** (REST: `/v3/accounts/{id}/...`, pricing via `/pricing` +
streaming).
- `get_price(symbol)` → `{symbol, bid, ask, time}` — pricing snapshot/stream (XAU_USD, XAG_USD).
- `get_account()` → `{balance, NAV, margin_used, currency, unrealized_pl}`.
- `get_positions()` → list of `{symbol, units, avg_price, unrealized_pl}`.
- `place_order(idempotency_key, symbol, side, units, stop, take)` → `{order_id, fill_price, status}`
  — market/limit; pass the key as the order `clientExtensions.id` so retries dedupe (idempotency).
- `close(symbol)` / `flatten_all()` / `reconcile()` → `{closed:[...], realized_pl}` / venue-vs-kit diff.

**Sizing.** OANDA trades in **units** (close to the kit's venue-neutral units) → minimal adapter.

**Notes.** Python: `oandapyV20`/`tpqoa`. Overnight financing applies (multi-day holds) — model in
`cost-model`. Candle endpoint is base-price-group (differs slightly from account pricing).

**Use cases.** A familiar FX/CFD venue; good practice-account for paper→live; alt to VT Markets.
