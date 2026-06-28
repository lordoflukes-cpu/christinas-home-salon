# Connector · FRED (BUILT real path)

**Purpose.** Authoritative, free macro data — the gold "trinity": real yields, nominal yields,
break-even inflation, and the broad dollar.

**Status.** BUILT — real path lives in `engine/plugins/trading-data/data/fred.py` (sim fallback
when no key). Exposed via the `trading-data` MCP `fred` tool and the `intermarket` panel.

**Auth.** Free FRED API key (request one at fredaccount.stlouisfed.org). Env: `FRED_API_KEY`
(+ `USE_SIMULATED_DATA=false` for real). Reference: the official **FRED API** docs
(fred.stlouisfed.org/docs/api) — `series/observations` endpoint.

**Series.**
- `DFII10` → 10y real yield (TIPS) — gold's primary anchor (inverse; asymmetric in 2024–26).
- `DGS10` → 10y nominal.
- `T10YIE` → 10y break-even inflation.
- `DTWEXBGS` → broad trade-weighted USD (DXY proxy).

**Tool.** `fred(series="")` → all four (or one by label). Daily cadence (Tier 3).

**Use cases.** `intermarket`, `market-brief`, `regime` macro overlay; the risk/regime context for
why gold is moving.
