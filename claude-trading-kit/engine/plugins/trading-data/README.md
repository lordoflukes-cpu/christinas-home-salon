# trading-data

Market data + macro for the suite, and the piece that **closes the bridge loop**: a poller
turns the economic calendar into the bridge's news-window flag so entries auto-block around
high-impact releases. Runs with **no API keys** (sim); FRED has a real path.

## What's inside

**MCP connector — `trading-data`** (stdio):
- `quote`, `candles` — price/OHLC (sim via the gold-bot synthetic series)
- `fred` — real yields (DFII10), nominals (DGS10), breakevens (T10YIE), DXY (DTWEXBGS); **real**
  when `FRED_API_KEY` is set and `USE_SIMULATED_DATA=false`
- `economic_calendar`, `news_window` — upcoming events + the ±N-min guard the bridge consumes
- `cot` — managed-money positioning (weekly, **lagged**)
- `intermarket` — DXY/yields/breakeven/gold-silver-ratio panel + a one-line read

**Skills** (`/trading-data:<name>`): `news-window`, `market-brief`, `intermarket`, `cot-report`.
**Agent**: `market-analyst`. **Tool**: `tools/news_window_poller.py`.

## Setup / test

```bash
pip install -r mcp/requirements.txt          # mcp, httpx, pytest
pytest                                        # data + news-window logic
python mcp/data_server.py                     # run the MCP (stdio)
```

## Closing the loop (data → bridge)

Run the poller next to a running bridge so the news-window guard is automatic:

```bash
# inject a test event 60s out to watch the guard flip the bridge:
python tools/news_window_poller.py --bridge http://localhost:8000 --event-in 60 --once
# in production, just run it on an interval:
python tools/news_window_poller.py --bridge http://localhost:8000 --interval 30
```

The poller POSTs `news_window().active` to the bridge `/api/news-window`, so the risk-gate
blocks new entries around CPI/FOMC/NFP with no human.

## Configuration (env)

| Var | Meaning |
|---|---|
| `USE_SIMULATED_DATA` | `true` (default) = no keys needed; `false` = use real providers |
| `FRED_API_KEY` | enables the real FRED path |
| `MARKET_DATA_KEY` · `CALENDAR_KEY` | real price/calendar providers (TODO wiring) |
| `NEWS_GUARD_MINUTES` | half-width of the news-window (default 2) |

## Scope

Sim works fully now. **FRED** ships a real path; real market-data (Twelve Data/AllTick) and real
calendar/COT fetch are documented TODOs. COT is always weekly & lagged.

Educational only — not financial advice.
