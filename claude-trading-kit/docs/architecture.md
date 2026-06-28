# Architecture — how the pieces fit

The kit is **one trading edge expressed once** (the gold-bot engine) and exposed through many
surfaces: skills you talk to, agents that reason, connectors that carry data/orders, and workflows
that orchestrate them. Manual and bot paths share the same risk maths so they can't disagree.

## The pipeline (signal → money)

```
        TradingView (Pine, ts.alert.v1)            manual read (chart-playbook)
                     │  HMAC-signed webhook                    │
                     ▼                                         ▼
   ┌──────────────────────────── BRIDGE ───────────────────────────┐
   │ parse → validate(schema) → HMAC auth → idempotency(client_id)  │
   │ → risk-gate (ATR size + limits + kill-switch + news-window)    │
   │ → route:  auto → execute        manual → suggest               │
   └───────────────┬───────────────────────────────────────────────┘
                   ▼
            EXECUTION (venue abstraction)
        PaperVenue · VT Markets/MT5 (MetaApi) · IG spread-bet
        sizing→lots / stake-per-point · reconcile · kill-switch
                   │
                   ├── Telegram (alerts + /halt /flat /status, allow-listed)
                   └── tax records (CFD vs spread-bet track)

   DATA (prices · FRED · calendar · COT · intermarket) ──► feeds research
        └── news_window poller ──► sets the bridge blackout
   RESEARCH/VALIDATION (backtest · walk-forward · monte-carlo ·
        deflated-sharpe · regime · cost-model) ──► gate before any of the above
```

## Layers

- **Engine (`engine/`)** — the tested core: `vendor/gold-bot` (strategy, ATR sizing, no-look-ahead
  backtest, paper broker) wrapped by six plugins, each with an MCP server:
  trading-research (backtest-engine), trading-charting (charting-tools), trading-data,
  trading-bridge (bridge-control + FastAPI service), trading-execution (execution + Telegram),
  trading-core (hooks/commands). Vendored engine kept pristine via `goldbot.py` sys.path shims.
- **Skills (`skills/`)** — task playbooks; engine-backed ones call the BUILT MCP tools, the rest
  reason with inline formulas. Drop into `.claude/skills/`.
- **Agents (`agents/`)** — specialists (research, risk, validation, execution, ops, reporting).
  Several are deliberately **adversarial** (red-team-skeptic, risk-manager) — they argue the bear
  case before capital is risked.
- **Connectors (`connectors/`)** — MCP servers: BUILT (engine), ENV (already in the environment),
  CUSTOM (SPECs for real brokers/data).
- **Workflows (`workflows/`)** — deterministic multi-step pipelines over the above.

## Key contracts & invariants
- **ts.alert.v1** — the one JSON contract TradingView→bridge; vendored + drift-tested.
- **HMAC-SHA256** over canonical (sorted, compact, signature-excluded) body on every webhook.
- **Idempotency** on `client_order_id` — a re-sent alert never double-fills.
- **One risk gate** — ATR sizing + per-trade/daily/drawdown limits + kill-switch + news-window;
  both manual and auto routes pass through the same maths (parity).
- **Kill-switch always reachable** — `/halt`, `/flat`, execution `flatten_all`, Telegram command.
- **Stub-first** — everything runs on simulated data/paper with no credentials.
- **Honesty** — no look-ahead/repaint; costs modelled; Sharpe deflated for trials; reconcile must
  be clean before resuming.

## Reuse map (one idea, many surfaces)
ATR sizing lives in the engine → used by `risk-check`, `order-preview`, the bridge risk-gate, and
`risk-manager`. The §11 scorecard → `backtest`, `walk-forward`, `health-review`, `quant-validator`,
`report-writer`. The ts.alert.v1 schema → `pine-alert`, `webhook-design`, `route-test`,
charting-tools. Define once, reference everywhere — that's why manual and bot stay in parity.
