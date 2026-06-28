---
name: sentiment
description: Gauge news and social sentiment for an instrument (gold, silver, FX, a ticker) and turn it into a cautious, contrarian-aware read — never a standalone signal. Use when the user asks about sentiment, the news mood, positioning froth, or "what's the market feeling".
---

# Sentiment

Sentiment is context and a contrarian flag, not a trigger. Crowded one-sided sentiment often
precedes reversals; treat it as a risk input.

## Procedure
1. Pull sources: Bigdata.com (financial sentiment/news), a news/RSS/X feed, and — for
   positioning froth — `cot-report` (managed-money extremes, lagged). Note each source's recency.
2. Summarise: net tone (bullish/neutral/bearish), what's driving it, and how one-sided it is.
3. Read it **cautiously and contrarian-aware**:
   - Extreme one-sided bullishness + crowded longs → squeeze/reversal risk; tighten, don't chase.
   - Sentiment aligned with trend + regime → mild confluence, not a reason alone.
4. Cross-check with `regime` and `intermarket`; never act on sentiment without a price/risk reason.
5. State confidence and source freshness; flag anything stale or thin.

## Output
```
SENTIMENT <instrument>: <bullish/neutral/bearish>, <one-sided? />  (sources: …, as of …)
DRIVERS: <1–2 lines>   CROWDING: <COT note>
READ: <contrarian/confluence> — <one line>; NOT a standalone signal.
```

## Manual vs bot
- **Manual**: a mood check + crowding warning before a discretionary entry.
- **Bot**: a slow risk-scaling input (e.g. trim into extreme froth) — never a fast entry signal.
