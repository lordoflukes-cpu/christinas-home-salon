# 01 · Architecture

## Topology

```
                          ┌─────────────────────────────────────────────┐
                          │                TradingView                  │
                          │  Pine indicators · strategies · screeners   │
                          │  charts/watchlists · Strategy Tester        │
                          └───────────────┬─────────────────────────────┘
                              alert() JSON │ webhook (HTTPS POST, HMAC)
                                           ▼
                          ┌─────────────────────────────────────────────┐
   market data + FRED ───▶│            trading-bridge (cloud)           │
   (trading-data)         │  verify HMAC · idempotency (client_order_id)│
   COT · calendar         │  RISK-GATE (size/limits/news/kill-switch)   │
                          │  route ─────────────┬───────────────┐       │
                          └─────────┬───────────│───────────────│───────┘
                                    │ manual    │ bot           │ alerts
                                    ▼           ▼               ▼
                          ┌───────────────┐ ┌───────────────┐ ┌───────────┐
                          │  Telegram     │ │ trading-      │ │ Telegram  │
                          │  "suggested   │ │ execution     │ │ alerts +  │
                          │   action"     │ │ (venue-abstr) │ │ /halt /flat│
                          └───────────────┘ └──────┬────────┘ └───────────┘
                                                   │
                              ┌────────────────────┴───────────────────┐
                              ▼                                        ▼
                   ┌──────────────────────┐               ┌──────────────────────┐
                   │ VT Markets (CFD)      │               │ UK spread-bet (IG)    │
                   │ MetaApi cloud (def.)  │               │ IG REST/streaming     │
                   │ or self-host MT5 (Win)│               │ (tax-free track)      │
                   └──────────────────────┘               └──────────────────────┘

        research / risk / backtest  ◀── vendor/gold-bot (engine, monitor, metrics)
```

## Components & responsibilities

| Component | Plugin | Responsibility |
|---|---|---|
| **Signal brain** | trading-charting | Pine indicators/strategies/screeners; the alert **webhook JSON schema**; chart playbooks for manual reads; Strategy-Tester cross-check. |
| **Bridge** | trading-bridge | The only inbound entry point. Verifies **HMAC**, enforces **idempotency**, runs the **risk-gate**, then routes to execution (bot) or Telegram (manual suggestion). Cloud-hosted → 24/7, device-independent. |
| **Execution** | trading-execution | One venue-agnostic interface; backends: VT Markets (MetaApi/MT5) and IG spread-bet. Orders, positions, reconciliation, kill-switch. |
| **Data** | trading-data | Price feed + FRED macro + COT + economic calendar (news-window). Feeds the risk-gate and research. |
| **Research/Risk** | trading-research + vendor/gold-bot | Backtest (no-look-ahead), validation suite, scorecard, sizing/cost models. |
| **Foundation** | trading-core | Sizing, cost model, journaling, regime, health review — used by manual and bot alike. |
| **Comms/Control** | (Telegram in bridge/execution) | Alerts out; `/halt /flat /status` in. The primary cross-device control surface. |

## Two data flows (manual vs bot)

**Bot flow:** Pine strategy fires `alert()` → webhook → bridge verifies & risk-gates →
`trading-execution` places an **idempotent** order at the chosen venue → fill →
reconcile → Telegram confirmation → journal entry.

**Manual flow:** Pine indicator/alert fires → webhook → bridge risk-gates and computes
a **suggested** size/stop → Telegram "setup ready: size X, stop Y, gates ✅/❌" →
user decides and (optionally) executes by hand → user logs via the journal skill.

The **shared spine** is identical: same signal source, same risk-gate, same journal.
Only the final step (auto-order vs human decision) differs. This is the parity rule.

## Cross-device posture

- **Default path is cloud**: TradingView (web/mobile), the hosted bridge, MetaApi, IG
  API, Telegram — all reachable from phone/Mac/Windows.
- **Self-hosted MT5 + Python** is a *Windows-desktop* optional backend, selected by
  config behind the execution interface. It must never be required for a core flow.

## Where Claude fits

Claude (via the plugins) is the **research, risk, authoring and ops copilot**: it
writes/lints Pine, designs alert payloads, runs backtests and validation, performs
pre-trade risk checks, drives the journal and health review, and operates the
kill-switch — for both manual and automated trading. It is *not* in the sub-second
order path (the bridge handles that deterministically).

See `02-capability-catalog.md` for the full inventory and `03-integrations/*` for the
wire-level detail of each edge.
