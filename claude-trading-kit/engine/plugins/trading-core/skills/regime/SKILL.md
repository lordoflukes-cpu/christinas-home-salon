---
name: regime
description: Classify the current market regime (trend vs range × quiet vs volatile) and recommend whether a trend system should press, shrink, or stand aside. Use when the user asks about market conditions, regime, whether to trade now, or why the strategy is winning/losing lately.
---

# Regime Classification

Trend systems thrive in directional-volatile regimes and bleed in quiet ranges. The goal is
not to predict the next regime — it's to **adapt posture to the one you're in now**.

## Procedure
1. Get recent OHLC for the instrument (CSV path or the data feed). Call the
   **`classify_regime`** tool (backtest-engine MCP) → `direction` (up/side/down),
   `volatility` (quiet/volatile), `posture`, plus EMA spread and ATR.
2. **Macro overlay (when available)**: for metals, fold in DXY, 10y real yield, and the
   gold-silver ratio. Note if gold is rising *with* the dollar (panic/structural — the
   inverse has broken), or if silver is "doing all the work" (industrial repricing).
3. Translate to action for a trend system:
   - directional + volatile → **press**; directional + quiet → **normal**;
   - sideways + quiet → **stand aside**; sideways + volatile → **shrink** (whipsaw risk).

## Output
```
REGIME: <up/side/down> × <quiet/volatile>   (EMA spread <x>%, ATR <y>)
MACRO:  <real-yield / DXY / risk-on-off>   (when available)
POSTURE for a trend system: <press / normal / shrink / stand aside> — <one-line why>
```
Be explicit when the regime is hostile to trend (quiet range): recommend reducing size or
sitting out rather than forcing trades. Thresholds are heuristic — say so.

## Manual vs bot
- **Manual**: decide whether to trade by hand today and how aggressively.
- **Bot**: filter/scale automated exposure by regime (and feed the news-window guard).
