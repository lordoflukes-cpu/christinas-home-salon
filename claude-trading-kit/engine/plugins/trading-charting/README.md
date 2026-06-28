# trading-charting

The **TradingView** signal/charting layer for manual and bot trading. Pine that stays in
**parity** with the gold-bot engine, the `ts.alert.v1` webhook contract as code, and the
tools to author/validate/sign/cross-check it. Runs and tests with **no TradingView account**.

## What's inside

**Pine library** (`pine/`) — parity with `vendor/gold-bot` (dual-EMA + ATR):
- `ts_trend_strategy.pine` — bot strategy; emits the ts.alert.v1 order payload via `alert()`
- `ts_trend_indicator.pine` — manual companion (EMAs, ATR stop, regime shading, alertcondition)
- `ts_screener.pine` — +1/0/−1 trend flag for scanning
- `alert_message.tmpl` — the exact TradingView alert message + wiring steps

**Contract** (`contract/ts_alert_v1.schema.json`) — the canonical alert schema, shared with
the Phase-3 `trading-bridge`.

**MCP connector — `charting-tools`** (stdio):
- `validate_alert`, `make_alert_payload`, `sign_payload` (HMAC), `lint_pine`, `diff_metrics`.

**Skills** (`/trading-charting:<name>`): `pine-author`, `pine-alert`, `screener`,
`chart-playbook`, `explain-signal`, `tv-strategy-tester`.
**Agent**: `pine-engineer` (parity + no look-ahead).
**Stub poster** (`tools/post_alert.py`): simulate a TradingView webhook end-to-end.

## Setup / test

```bash
pip install -r mcp/requirements.txt          # mcp, pytest
pytest                                        # contract / sign / lint / diff + shipped-Pine lint
python mcp/charting_server.py                 # run the MCP (stdio)
python tools/post_alert.py --secret test --print
```

## Wiring TradingView (user step, needs a paid plan for webhooks)

1. Add `pine/ts_trend_strategy.pine` to a chart (H4/Daily).
2. Create an alert on the strategy → "Order fills only" (or the script's `alert()`).
3. Webhook URL = your **trading-bridge** endpoint (Phase 3). Message = `pine/alert_message.tmpl`.
4. Pick `account_track`: `spreadbet` (IG, tax-free) or `cfd` (VT Markets).
5. The bridge verifies the HMAC and treats `client_order_id` as the idempotency key. Keep the
   secret out of shared charts.

## Parity

The Pine strategy, the indicator, the screener, and the chart-playbook all encode the **same**
logic as the engine, so backtest, chart, manual read, and bot agree. Diverge only deliberately
— and update the backtest when you do.
