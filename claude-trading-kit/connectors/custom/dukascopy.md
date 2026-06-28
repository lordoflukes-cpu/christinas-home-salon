# Connector · Dukascopy historical data (SPEC)

**Purpose.** Free, high-quality historical **tick/OHLC** for XAU/USD, XAG/USD — the de-facto
retail standard for serious backtests.

**Status.** SPEC. A fetch+normalize step feeding `candles`/CSV into the backtest engine.

**Auth.** None (public). Source: Dukascopy's historical feed (Swiss bank, freeserv.dukascopy.com).
Tools: the `dukascopy-node` CLI/library or Tickstory to download the `.bi5` tick archives; convert
to the engine's CSV (`ts,open,high,low,close`). Symbols `XAUUSD`, `XAGUSD`.

**Pipeline.** Download → de-dup → UTC normalize → gap-check (weekends/holidays/CME break) →
store (Supabase/CSV). Run via the `data-engineer` agent / data-pipeline-refresh workflow.

**Notes.** Model spreads/slippage on top (tick data is raw); beware look-ahead when bar-building.
Capture enough history for walk-forward (multiple regimes).

**Use cases.** Real `backtest`, `walk-forward`, `monte-carlo` on actual gold/silver history.
