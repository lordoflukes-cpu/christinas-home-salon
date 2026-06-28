# Integration · TradingView

TradingView is the **signal/charting brain** for both manual and bot trading. We use
it for four jobs (all confirmed in scope): **signals/alerts, charting/manual
playbooks, screeners, and Strategy-Tester backtesting**.

## 1. Signals & alerts (Pine → webhook)

- Pine v5/v6 strategies and indicators emit signals via `alert()` (dynamic message)
  or `alertcondition()`. Use **`alert()`** in strategies so the message can carry
  live values (price, ATR, side).
- An alert is configured with a **webhook URL** (our `trading-bridge`) and a **JSON
  message**. "Once per bar close" for confirmed signals; "order fills only" for
  strategy fills.
- **Canonical alert JSON contract** (authored/validated by the `webhook-design` and
  `pine-alert` skills):

```json
{
  "schema": "ts.alert.v1",
  "strategy_id": "gold-trend-h4",
  "client_order_id": "{{strategy.order.id}}-{{timenow}}",
  "account_track": "spreadbet | cfd",
  "symbol": "XAUUSD",
  "action": "buy | sell | close",
  "order_type": "market | limit",
  "price": {{close}},
  "atr": {{plot_0}},
  "stop_atr_mult": 2.0,
  "risk_frac": 0.005,
  "tv_time": "{{timenow}}",
  "secret": "<HMAC-or-shared-secret — see docs/08-security.md>"
}
```

- The bridge treats `client_order_id` as the **idempotency key** and verifies the
  secret/HMAC. The Pine side must include everything the bridge needs (symbol, side,
  price, ATR, track) — TradingView won't send anything not in the message.

## 2. Charting & manual playbooks

- Curated **chart templates**, watchlists, and indicator sets the user loads on any
  device (web/mobile). The `chart-playbook` skill encodes a discretionary read
  checklist per setup (trend/regime/levels/intermarket) that mirrors the bot's logic
  so manual and auto decisions rhyme.

## 3. Screeners & scanning

- TradingView screeners (and Pine screener scripts) surface candidate setups across a
  universe. The `screener` skill produces/maintains screener configs; results feed the
  manual playbook and can seed research.

## 4. Strategy-Tester backtesting (cross-check)

- TradingView's Strategy Tester gives a fast, chart-native backtest. We **cross-check**
  it against the `vendor/gold-bot` engine (the authoritative, no-look-ahead, honest-cost
  backtest). Divergence between the two is a signal that one side's costs/fills are wrong.
- The `tv-strategy-tester` skill ingests exported TV results and diffs them vs the engine.

## Constraints & notes

- TradingView **cannot place trades at VT Markets directly** (no native broker
  integration for VT Markets) → execution is always via our bridge → MetaApi/IG.
- Alerts require a paid TradingView plan for webhooks and enough alert slots.
- Pine cannot hold secrets securely; the alert "secret" is a shared token over HTTPS —
  pair it with bridge-side **HMAC + IP allow-listing + idempotency** (docs/08).
- Build a **stub**: a local script that POSTs sample alert JSON to the bridge so the
  whole pipeline is testable without TradingView.

## Sources
TradingView webhook + Pine `alert()` docs; standard Pine→middleware→broker pipeline.
