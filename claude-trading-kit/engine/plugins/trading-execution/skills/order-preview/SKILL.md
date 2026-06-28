---
name: order-preview
description: Translate a trade signal into the exact venue order WITHOUT sending it — ATR-sized units plus the venue-specific size (lots for CFD/VT Markets, stake-per-point for IG spread-bet) — so you can sanity-check before execution. Use when previewing an order, checking size, or deciding which track to use.
---

# Order Preview (no send)

See precisely what would be sent, on which track, before anything goes live.

## Procedure
1. Gather: symbol, side, equity, ATR, risk_frac (default 0.5%), stop_atr_mult (default 2.0),
   and **track** (`cfd` or `spreadbet`).
2. Call **`order_preview`** (execution MCP). It computes ATR-sized `units` (via the engine)
   and the **venue-specific size**: `lots` for cfd (units ÷ contract size) or
   `stake_per_point` for spreadbet.
3. Cross-check with `risk-check` (trading-core): the dollar risk at the stop must equal
   risk_frac × equity, and gates (daily-loss, news-window, kill-switch) must be clear.
4. Confirm the **track** is intended (tax: cfd taxable, spreadbet tax-free — docs/07) and the
   right venue is configured for it.
5. Only after preview + risk-check is clean should you place (or let the bot place) the order.

## Manual vs bot
- **Manual**: your order ticket — size + venue size to enter by hand on your platform.
- **Bot**: the bridge does this automatically in the risk-gate; use preview to audit/debug it.
