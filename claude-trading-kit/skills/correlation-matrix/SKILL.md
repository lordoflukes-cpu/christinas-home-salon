---
name: correlation-matrix
description: Compute the correlation matrix across held/candidate instruments and group them into risk buckets so you don't unknowingly stack the same bet. Use when checking diversification, sizing a multi-instrument book, or before adding a correlated position (e.g. gold + silver).
---

# Correlation Matrix

Correlated positions are one position wearing two hats. Measure it, then size the **bucket**,
not each leg.

## Procedure
1. Choose the set (current positions + any candidate) and a window of returns (`candles` per
   instrument; e.g. 60–120 bars on the trading timeframe).
2. Compute pairwise return correlations → a matrix. (Wolfram MCP or a quick numpy step.)
3. **Bucket** highly-correlated instruments (|ρ| ≳ 0.6) together: gold + silver + often AUD/CAD
   vs USD move together; treat each bucket as a single risk unit.
4. Check the book: is total risk concentrated in one bucket? Are any "diversifiers" actually
   correlated (false diversification)?
5. Feed the buckets to `risk-check` / `portfolio-allocator`: cap per-bucket risk, not just
   per-trade — so a bad day in one theme can't breach the daily-loss limit twice.

## Output
```
MATRIX: <pairwise ρ>
BUCKETS: [gold,silver] · [FX-USD] · …
CONCENTRATION: <ok / too much in bucket X>   ACTION: <cap / drop / proceed>
```

## Manual vs bot
- **Manual**: avoid doubling up before you add a correlated discretionary trade.
- **Bot**: enforce per-bucket exposure caps in the risk layer / allocator.
