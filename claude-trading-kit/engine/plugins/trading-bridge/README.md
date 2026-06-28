# trading-bridge

The cloud-hosted **TradingView-webhook receiver** and the **manual/bot junction**. Consumes
the `ts.alert.v1` contract and runs every alert through one deterministic pipeline:

```
parse → validate → HMAC verify → idempotency → risk-gate → route
                                                        ├─ auto   → execution (PaperSink stub)
                                                        └─ manual → suggestion (NotifySink stub)
```

Safe by default: a strategy is **manual** (suggest) unless explicitly opted into **auto**.

## What's inside

- **`bridge/`** — the pure pipeline: `contract` (vendored ts.alert.v1 validator, drift-guarded),
  `sign` (HMAC), `riskgate` (ATR sizing via the engine + kill-switch/news-window/limits),
  `idempotency`, `sinks` (paper + notify stubs), `router`, `core` (`Bridge.handle`).
- **`app/server.py`** — FastAPI shell: `POST /tv-webhook`, `POST /api/kill-switch`,
  `POST /api/news-window`, `GET /api/state`, `GET /health`.
- **MCP `bridge-control`** — `dry_run_alert`, `bridge_status`, `set_kill_switch`,
  `set_news_window`, `recent_decisions` (drive/inspect in-process, no server).
- **Skills** — `webhook-design`, `route-test`. **Tool** — `tools/post_signed_alert.py`.

## Setup / run / test

```bash
pip install -r mcp/requirements.txt          # mcp, fastapi, uvicorn, httpx, pytest
pytest                                        # pipeline + schema-drift tests
uvicorn service.server:app --port 8000            # run the bridge
python tools/post_signed_alert.py --secret testkey --url http://localhost:8000/tv-webhook
python tools/post_signed_alert.py --secret testkey --url http://localhost:8000/tv-webhook --tamper   # → 401
```

## Configuration (env)

| Var | Meaning |
|---|---|
| `BRIDGE_SECRET` | HMAC secret. **Empty = DEV mode** (auth not enforced). Set in production. |
| `BRIDGE_AUTO_STRATEGIES` | comma list of `strategy_id`s to route **auto** (rest are manual) |
| `BRIDGE_DEFAULT_MODE` | `manual` (default) or `auto` |
| `BRIDGE_MAX_POSITION_UNITS` · `BRIDGE_DAILY_LOSS_FRAC` · `BRIDGE_EQUITY0` | risk caps |

## Security & scope

HMAC verification + idempotency are mandatory on the money path (docs/08). Phase 3 ships
**stub sinks**: Phase 5 swaps `PaperSink` for venue-abstracted execution (VT Markets / IG) and
`NotifySink` for the Telegram connector. The news-window flag is settable here; the Phase-4
data plugin wires it to a real economic calendar.

Educational only — not financial advice.
