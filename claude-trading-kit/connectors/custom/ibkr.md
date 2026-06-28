# Connector · Interactive Brokers (IBKR) (SPEC)

**Purpose.** Futures execution + data — micro gold (MGC), micro silver (SIL), and the cleanest
exchange data. The cheapest per-trade venue (no overnight financing; carry is in the basis) but
taxable (CGT) for a UK resident.

**Status.** SPEC. Implement as an `ExecutionVenue` backend (track = `cfd`/futures).

**Auth.** Local IB Gateway / TWS running with the API enabled (Configure → API → Enable ActiveX
and Socket Clients), reached over `ib_insync`/`ib_async` or the native TWS API. Env:
`IBKR_HOST`, `IBKR_PORT` (7497 paper / 7496 live for TWS; 4002/4001 for Gateway), `IBKR_CLIENT_ID`.
No API token in IBKR's model — the running gateway holds the authenticated session, so lock down the
host (loopback/VPN, read-only API toggle off only when trading) and use the paper account for
testing. Reference: the official **IBKR TWS API** docs (interactivebrokers.github.io).

**Tools / endpoints.**
- `get_price(symbol)` / `bars(symbol, interval, n)` → `{ts,open,high,low,close}` — continuous
  contracts; handle quarterly rolls (front-month switch) explicitly.
- `get_account()` → `{net_liq, buying_power, margin, currency}`; `get_positions()` → contracts held.
- `place_order(idempotency_key, contract, side, qty, stop)` → `{order_id, status, fill}` — MGC/SIL
  contracts, bracket (parent + stop/target); dedupe on the key.
- `close` / `flatten_all` / `reconcile` → realized PnL / venue-vs-kit diff.

**Sizing.** Whole **contracts** (MGC = 10 oz, SIL = 1,000 oz) → adapter from units → contracts
(round to whole; mind the minimum). Tag track for tax (futures = CGT-like).

**Notes.** Requires a running gateway (not pure-cloud) → more like the Windows/VPS path; document
hosting. Margin (MGC ~$1.7k) changes quarterly — verify.

**Use cases.** Lowest-cost long holds (no financing), clean data for research, futures track.
