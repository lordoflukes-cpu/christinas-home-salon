---
name: pine-author
description: Write, modify, or review TradingView Pine scripts (indicators, strategies, screeners) that stay in parity with the gold-bot engine and emit the ts.alert.v1 contract. Use when the user wants Pine code, a TradingView indicator/strategy/screener, or help fixing/reviewing Pine.
---

# Pine Author

Author Pine that is correct, parity-aligned, and safe for a money path.

## Procedure
1. Start from the library templates in this plugin's `pine/` (don't reinvent):
   `ts_trend_strategy.pine` (bot orders + ts.alert.v1), `ts_trend_indicator.pine` (manual),
   `ts_screener.pine` (scanning). Modify these rather than writing from scratch.
2. **Parity rule**: any signal logic must match the gold-bot engine
   (`vendor/gold-bot/app/strategy/trend.py` — `direction = sign(EMA(fast) − EMA(slow))`,
   ATR stop) unless the user is intentionally diverging. If you change the Pine logic,
   say what the engine equivalent would be (and flag that the backtest must be updated too).
3. **Lint** the result with the `lint_pine` tool (charting-tools MCP). Resolve every
   `error` finding: missing `//@version`, no declaration/alert, **look-ahead/repaint**
   (`request.security(..., lookahead_on)`), hardcoded secrets.
4. If the script emits orders, ensure it also emits an **`alert()`** carrying ts.alert.v1
   (use the `pine-alert` skill), else the bridge is never notified.
5. Prefer `alert.freq_once_per_bar_close` and `calc_on_every_tick=false` to avoid repaint.

## Manual vs bot
- **Manual**: build/adjust an indicator or screener you read by eye.
- **Bot**: build/adjust the strategy whose alert drives orders via the bridge — keep it in
  parity with the engine so backtest, chart, and bot all agree.
