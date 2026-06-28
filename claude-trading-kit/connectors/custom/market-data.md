# Connector · Market data — Twelve Data / AllTick / Polygon (SPEC; sim BUILT)

**Purpose.** Real-time + historical price for XAU/XAG/DXY and other instruments. The kit's
`trading-data` MCP already serves **simulated** prices/candles; this spec is the **real** path.

**Status.** SPEC for real providers; the BUILT `trading-data` has sim `quote`/`candles` and a real
FRED path. Implement real fetch in `engine/plugins/trading-data/data/prices.py` (`# TODO(real)`).

**Auth.** Provider API key. Env: `MARKET_DATA_KEY` (+ `USE_SIMULATED_DATA=false`).

**Providers** (link the official API docs of whichever you pick; key = read-only, in env).
- **Twelve Data** — REST `/quote`, `/time_series` + WebSocket; FX/metals incl. XAU/XAG; easy start.
- **AllTick** — precious-metals WebSocket (~170 ms).
- **Polygon** — broad coverage, deep history (forex/indices; metals via FX pairs).
- Or pull from the execution venue (MetaApi/IG/OANDA) to keep data & fills consistent.

**Tools.** Map provider responses into `quote(symbol)` → `{symbol, bid, ask, last, ts}` and
`candles(symbol, interval, n)` → list of `{ts,open,high,low,close}` (the engine CSV shape).

**Notes (tiered latency).** Only price needs sub-second (WebSocket, Tier 0/1); macro is daily.
Model spreads/slippage explicitly — never serve mid as tradeable. Capture the live stream for
true tick history (providers don't archive it).

**Use cases.** Real backtests, the live monitor, regime/intermarket reads on real prices.
