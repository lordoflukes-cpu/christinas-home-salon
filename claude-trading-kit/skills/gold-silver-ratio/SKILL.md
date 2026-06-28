---
name: gold-silver-ratio
description: Compute the gold-silver ratio, place it in its historical percentile, and read what it signals about relative value and silver leadership. Use when the user asks about the gold-silver ratio, whether silver is cheap/rich vs gold, or which metal to favour.
---

# Gold-Silver Ratio

The ratio (gold ÷ silver) is the headline relative-value gauge for the metals.

## Procedure
1. Get spot for gold and silver — via the `trading-data` MCP `quote`/`intermarket`, or
   compute `gold_silver_ratio(xau, xag)` from the engine helper. (Mid-2026 ≈ 66–70; it has
   historically ranged ~50–80 over normal regimes and spiked to 100+ in crises.)
2. Place it in context: where is it vs its recent range / percentile? Down sharply (silver
   outperforming) often = an **industrial repricing**; up sharply (silver lagging) = risk-off.
3. Signal read (mean-reverting but **regime-dependent** — it can stay stretched for years):
   - ratio very high → silver historically cheap vs gold (relative-value long silver bias).
   - ratio very low → silver rich vs gold.
   - fast moves → silver is "doing the work"; confirm with the `intermarket` panel.
4. Caution: do **not** trade the ratio as a static pair (that's Phase-3 stat-arb needing a
   Kalman dynamic hedge — see the roadmap). Use it as context/confluence, not a standalone signal.

## Manual vs bot
- **Manual**: decide which metal to favour and whether silver is leading.
- **Bot**: a relative-value/regime input; alert on ratio extremes (the `trading-data` panel).
