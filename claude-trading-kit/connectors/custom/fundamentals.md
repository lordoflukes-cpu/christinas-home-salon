# Connector · Fundamentals — World Gold Council / Silver Institute (SPEC)

**Purpose.** Slow, structural drivers of the metals: central-bank gold demand, ETF flows, and
silver supply/demand (industrial ~55–60%, the multi-year deficit). Context, not timing.

**Status.** SPEC. Periodic fetch of published figures (quarterly/annual); store + summarise.

**Auth.** None (public reports) / vendor key if using a data aggregator.

**Sources.** World Gold Council (Goldhub) — central-bank demand, flows; The Silver Institute /
World Silver Survey — supply, industrial demand, deficit. CME precious-metals outlooks.

**Tools.** `gold_demand()` → `{cb_demand_t, etf_flows_t, period, as_of}` (tonnes);
`silver_balance()` → `{supply_moz, demand_moz, deficit_moz, industrial_pct, period}`;
`metals_narrative()` → a short text summary for briefs. Mark `as_of`/`period` on everything.

**Notes.** Low frequency (quarterly/annual) and lagged — use for the medium-term narrative and
regime context, never as a trade trigger.

**Use cases.** `market-brief`, `intermarket` narrative, `strategy-researcher` (why an edge could
persist), investor reports.
