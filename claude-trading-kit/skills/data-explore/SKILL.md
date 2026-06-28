---
name: data-explore
description: Profile a trading dataset — trade log, equity curve, backtest output, or raw price/macro CSV/JSON/Parquet — for quality, anomalies, seasonality, and segment/regime patterns before you trust it or draw conclusions. Use to explore a new dataset, find hidden patterns, or sanity-check data feeding research/reporting.
---

# Data Explore

Profile a trading dataset before it drives a decision. Bad or misread data corrupts every
downstream backtest, report, and trade. This is the trading-scoped, portable version of the **Data
plugin's Explore Data** skill — reach for that plugin (warehouse tables, large workbooks, richer
auto-profiling) when you need heavyweight profiling; use this for fast in-context reads.

## What to profile (per column / series)
1. **Shape & types** — rows, columns, dtypes; parse dates; confirm one row = one expected unit
   (one trade / one bar / one period).
2. **Quality** — missing/null counts, duplicates (same timestamp/trade id), gaps in the time index
   (missing bars, weekend/holiday handling), constant or all-zero columns.
3. **Distributions & anomalies** — min/max/mean/median/σ; impossible values (negative price,
   zero/negative size, win rate > 100%, R outside sane bounds); outliers (spikes, fat tails).
4. **Seasonality / structure** — by hour/session, day-of-week, month; clustering of wins/losses;
   autocorrelation hints (streaks).
5. **Segments** — break metrics by instrument / strategy / regime / track (CFD vs spread-bet) to
   see where performance actually comes from.

## Output
```
DATASET: <rows>×<cols> · index <ok/gaps> · dupes <n> · missing <cols>
ANOMALIES: <impossible values / outliers found>
PATTERNS: <seasonality / segment skew worth noting>
VERDICT: trustworthy ✅ | clean first ⚠️ | not usable ❌   NEXT: <one action>
```
Hand anomalies to `data-validate` for a deeper integrity audit; hand performance segments to
`equity-report` / `decay-scan`.

## Manual vs bot
- **Manual**: explore an exported trade log or broker statement to understand your own results.
- **Bot**: a pre-research/pre-report gate that profiles inputs and blocks on critical data issues.
