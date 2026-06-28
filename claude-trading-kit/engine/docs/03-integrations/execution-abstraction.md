# Integration · Execution Abstraction

One interface, multiple venue backends. Strategies and the bridge speak this
interface; they never know whether the order lands on VT Markets (CFD via MetaApi/MT5)
or IG (spread-bet). Choosing a venue is a **config/tax** decision, not a code change.

## The interface (target shape)

```
class ExecutionVenue(Protocol):
    name: str
    track: "cfd" | "spreadbet"

    def get_price(symbol) -> Quote
    def get_account() -> Account            # equity, margin, currency
    def get_positions() -> list[Position]
    def place_order(*, idempotency_key, symbol, side, size_spec,
                    order_type, stop, take, track) -> OrderResult
    def modify(order_id, **changes) -> OrderResult
    def close(position_id, size=None) -> OrderResult
    def flatten_all() -> list[OrderResult]  # kill-switch primitive
    def reconcile() -> Reconciliation       # broker vs internal state
```

## Backends

| Backend | Track | Sizing unit | Default? | Notes |
|---|---|---|---|---|
| `PaperVenue` | both | units | ✅ stub | reuse vendor/gold-bot PaperBroker; no creds |
| `MetaApiVenue` | cfd | lots/units | cloud default | VT Markets via MetaApi cloud |
| `MT5Venue` | cfd | lots | Windows option | self-hosted MT5+Python |
| `IGVenue` | spreadbet | **stake/point** | tax-free track | IG REST/streaming |

## Sizing adapters

`size_spec` is venue-neutral (derived from `risk_frac`, equity, ATR, `stop_atr_mult`).
Each backend converts:
- MetaApi/MT5 → **lots/units** (contract size per symbol).
- IG → **stake per point** (per-point value per instrument).
The core sizing math lives once in `trading-core` (ATR/vol-target); adapters only do
the unit conversion.

## Idempotency & reconciliation (mandatory)

- Every `place_order` carries an `idempotency_key` (from the alert's `client_order_id`)
  so retries never double-fill.
- `reconcile()` compares broker truth vs internal state every cycle; a mismatch halts
  trading (kill-switch) and alerts via Telegram. (docs/08)

## Kill-switch

`flatten_all()` + a "block new orders" flag is the kill-switch primitive, exposed to
Telegram `/halt` and `/flat` and to the bridge risk-gate.

## Why this matters

It's what makes the **dual-tax-track** and **cross-device** requirements real: the same
strategy/alert can be routed to the tax-free spread-bet venue or the CFD venue, from any
device, with identical risk handling.
