# Workflow · Data pipeline refresh

**Purpose.** Keep the market + macro data the whole kit relies on fresh, gap-free, and trustworthy
before any research/backtest run uses it — bad data silently corrupts every downstream decision.

**Trigger.** Scheduled (e.g. nightly / pre-session) or on demand before a research batch.

**Steps (fetch → gap-check → validate → reconcile → publish).**
1. **Fetch** — pull latest OHLCV (market-data connector / Dukascopy) + macro (FRED) + positioning
   (CFTC-COT) for the tracked instruments and series. For sources without an API/connector, the
   `scraper-builder` skill (+ Nimble MCP) builds a feed that emits the kit's connector schemas.
2. **Gap-check** — detect missing bars, weekend/holiday handling, duplicate timestamps, stale
   series (last-updated older than expected), and obvious outliers (spikes, zero/neg prices).
3. **Validate** — run `data-validate` on the fetched batch (impossible values, dupes, leakage)
   as the gate before anything is written.
4. **Reconcile** — where two sources overlap, compare and flag divergence; prefer the canonical
   source; never silently overwrite history (append/correct with provenance).
5. **Publish** — write the cleaned dataset to the location the backtest-engine/data MCP reads;
   record a freshness + coverage stamp.

**Tools/agents.** trading-data MCP (sim built), market-data / FRED / CFTC-COT / Dukascopy
connectors (SPEC), `scraper-builder` + `data-validate` skills, data-engineer.

**Output.** A freshness/coverage report (per series: last bar, gaps found+filled, outliers flagged)
and a clean dataset. Block downstream runs on unresolved gaps in critical series.

**Status.** Partial — runnable on the simulated data source today; sharpens as real data
connectors are wired. The discipline (gap-check before publish) applies regardless of source.
