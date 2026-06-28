---
name: intermarket
description: Read the intermarket panel for gold/silver — DXY, 10y real yields, break-even inflation, and the gold-silver ratio — and explain what it implies for direction and regime. Use when the user asks about the dollar, yields, the macro backdrop, the gold-silver ratio, or why gold is moving.
---

# Intermarket Panel

Metals are an intermarket trade, not a single-instrument one. Read the drivers together.

## Procedure
1. Call **`intermarket`** (trading-data MCP) → DXY, real/nominal yields, breakeven, gold-silver
   ratio, and a one-line read.
2. Interpret (note these are tendencies, regime-dependent):
   - **Real yields ↓ / DXY ↓** → tailwind for gold (its opportunity cost falls). The inverse can
     **break** in panics or central-bank-flow regimes — flag when gold rises *with* the dollar.
   - **Gold-silver ratio** extremes / fast moves → silver leading (industrial repricing) or
     lagging; context for which metal to favour.
3. Combine with the `regime` read (trading-core/research `classify_regime`) for a posture.

## Manual vs bot
- **Manual**: the macro context before a discretionary decision.
- **Bot**: a regime/size input (e.g. shrink longs when real yields are rising hard).
