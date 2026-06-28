# trading-execution

The capstone: **venue-abstracted execution** across the two tax tracks, **Telegram** control,
a **kill-switch**, **reconciliation**, and **UK tax records**. Runs with **no credentials**
(PaperVenue + console Telegram); real brokers slot in by env.

## What's inside

**Execution interface** (`exec/interface.py`) + backends:
| Backend | Track | Sizing | Status |
|---|---|---|---|
| `PaperVenue` | both | units | ✅ working (gold-bot PaperBroker) |
| `MetaApiVenue` | cfd | lots | sizing/track done; live calls TODO (needs creds) |
| `MT5Venue` | cfd | lots | Windows-only stub |
| `IGVenue` | spreadbet | stake/point | sizing/track done; live calls TODO (needs creds) |

**Telegram** — outbound alerts + inbound `/halt /flat /status /size` (allow-listed senders;
console stub when no token). **Kill-switch**, **reconciliation**, **tax records** (CFD CGT
estimate vs spread-bet tax-free).

**MCP `execution`** — `order_preview`, `place_order`, `positions`, `account`, `flatten_all`,
`reconcile`, `set_venue`, `tax_records`, `telegram_command`.
**Service** (`service/exec_server.py`) — the FastAPI execution endpoint the bridge POSTs to:
`/execute /notify /flatten /resume /positions /account /reconcile /telegram-webhook /health`.
**Skills**: `order-preview`, `reconcile`, `tax-uk`. **Agents**: `execution-engineer`,
`incident-responder`. **Commands**: `/halt`, `/flat`, `/status`.

## Setup / run / test

```bash
pip install -r mcp/requirements.txt          # mcp, fastapi, uvicorn, httpx, pytest
pytest                                        # exec + telegram + tax tests
uvicorn service.exec_server:app --port 8100   # run the execution service
python mcp/exec_server.py                     # run the execution MCP (stdio)
```

## Wire the bridge to it

Run the bridge with `BRIDGE_EXECUTION_URL` pointing at this service; the bridge then routes
auto orders to `/execute` and manual suggestions to `/notify`:

```bash
BRIDGE_EXECUTION_URL=http://localhost:8100 BRIDGE_SECRET=… \
  uvicorn service.server:app --port 8000      # (in the trading-bridge plugin)
```

(Unset `BRIDGE_EXECUTION_URL` → the bridge keeps its in-process Phase-3 stubs.)

## Configuration (env)

| Var | Meaning |
|---|---|
| `EXEC_CFD_VENUE` / `EXEC_SPREADBET_VENUE` | `paper` (default) / `metaapi` / `mt5` / `ig` |
| `EXEC_METAAPI_TOKEN` · `EXEC_METAAPI_ACCOUNT` | VT Markets via MetaApi |
| `EXEC_IG_API_KEY` · `EXEC_IG_USERNAME` · `EXEC_IG_PASSWORD` · `EXEC_IG_ACCOUNT` | IG spread-bet |
| `EXEC_TELEGRAM_TOKEN` · `EXEC_TELEGRAM_CHAT_ID` · `EXEC_TELEGRAM_ALLOWLIST` | Telegram |

## Scope

PaperVenue + console Telegram work now. Real MetaApi/IG/MT5 calls and the real Telegram bot
are documented TODOs (the sizing adapters, track tagging, interface, kill-switch, reconciliation
and tax logic are all implemented and tested). Educational only — not financial or tax advice.
