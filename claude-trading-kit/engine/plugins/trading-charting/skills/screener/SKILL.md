---
name: screener
description: Build or tune a TradingView screener / scan to surface candidate trend setups across a universe of symbols, consistent with the strategy's logic. Use when the user wants to scan markets, find setups, build a watchlist filter, or set up a TradingView screener.
---

# Screener

Surface candidates worth a closer look — don't trade the screen, triage with it.

## Procedure
1. Decide the universe (e.g. metals + major FX, or a custom watchlist) and the filter.
   The default filter mirrors the strategy: **trending** (EMA fast vs slow) and optionally
   **volatile** (ATR/price), so the screen agrees with what the bot would trade.
2. Two routes:
   - **TradingView built-in screener**: produce a filter config (see
     `assets/screener-config.md`) — fields, operators, thresholds.
   - **Pine screener**: use `pine/ts_screener.pine` (a +1/0/−1 trend flag with a
     "tradeable" dot) added across symbols.
3. Hand the hits to the `chart-playbook` skill for a discretionary read, or (bot) use them
   as a pre-filter to decide which symbols to arm.
4. Keep the screen's logic **in parity** with the strategy; if you loosen it, say how it now
   differs from what the bot trades.

## Manual vs bot
- **Manual**: a morning scan → shortlist → playbook on the best one or two.
- **Bot**: a gating pre-filter so the strategy only runs on symbols currently trending.
