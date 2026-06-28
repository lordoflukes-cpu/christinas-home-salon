# Integration · Market Data + FRED

Powers the risk-gate (news-window, volatility), research (backtests), and the regime/
intermarket reads. Tiered by how fast each signal actually changes (don't stream what
moves daily).

## Tiers (from vendor/gold-bot MARKET-DRIVERS-AND-MONITORING.md)

| Tier | Signals | Latency | Mechanism |
|---|---|---|---|
| 0 Tick | XAU/XAG price, positions | <100ms | WebSocket |
| 1 Intraday | DXY, FX, VIX, gold-silver ratio | seconds | WS / short-poll |
| 2 Scheduled | CPI/FOMC/NFP/PMI | known ahead | calendar API + news-window guard |
| 3 Daily | real yields (TIPS), breakevens, ETF flows | EOD | REST cron |
| 4 Weekly | CFTC COT | weekly (lagged) | REST cron |

## Providers

- **Price (Tier 0/1)**: Twelve Data / AllTick / FMP WebSocket; or pull from the chosen
  execution venue (MetaApi/IG) to keep data and fills consistent.
- **Macro (Tier 3) — FRED**: `DFII10` (10y real yield), `DGS10` (10y nominal),
  `T10YIE` (breakeven), `DTWEXBGS` (broad dollar). Free; needs a FRED API key.
- **Calendar (Tier 2)**: an economic-calendar API (TradingEconomics / FMP / Investing)
  → drives the **news-window guard** the risk-gate enforces.
- **COT (Tier 4)**: CFTC (Tue data, Fri release) — never treat as real-time.

## Design notes

- **Match latency to decision latency**: only price/risk-events need sub-second; macro
  is daily-to-weekly. Reserve WebSocket for Tier 0/1.
- The **news-window guard** is the single highest-value live rule: block new entries
  ±N minutes around high-impact releases (risk-gate + bridge enforce it).
- Model spreads/slippage explicitly downstream; don't backtest on mid prices.

## Stub

A simulated feed (reuse vendor/gold-bot `feeds/`) emitting correlated XAU/XAG ticks and
seeded macro values, so data-dependent capabilities run with no API keys.

## Reuse note

Bigdata.com (sentiment/events), FRED (free), Crypto_com (if crypto added) are available
in this environment for prototyping.
