---
name: cost-model
description: Estimate the all-in cost of a position hold — spread, commission, and overnight financing/carry — and express it as a share of the edge and notional, comparing the CFD and spread-bet tracks. Use when the user asks about trading costs, financing, carry, overnight fees, spread-bet vs CFD vs futures economics, or whether a strategy survives costs.
---

# Cost Model

Costs decide profitability as much as the signal. For multi-day holds, **overnight
financing usually dominates** — the silent killer of expectancy.

## Procedure
1. Gather: instrument, side, units, price, point value, `hold_nights`,
   `spread_cost_per_unit` (round-turn), `commission_per_unit` (per side),
   `carry_per_unit_per_night` (negative when you pay it — e.g. long gold). If carry is
   unknown, note typical figures (gold carry can run roughly −$75/lot/night long on spread
   bets) and ask the user to confirm with the broker.
2. Call the **`cost_model`** tool (backtest-engine MCP). Report the breakdown
   (spread / commission / carry / total), `cost_pct_of_notional`, and the
   **`suggested_cost_per_unit`** — feed that into `run_backtest(cost_per_unit=…)` so
   backtests are charged honestly.
3. **Contextualise against the edge**: if the expected per-trade profit is ~X·R, show how
   much of it costs consume. If financing eats most of the edge, shorten the hold, switch
   venue, or skip the trade.
4. **Compare tracks/venues**: spread-bet (tax-free, financing) vs VT Markets CFD (taxable,
   financing) vs MGC futures (no overnight financing, ~$1.50–2 round-turn). Flag the UK tax
   tradeoff (see docs/07): spread-bet tax-free; CFD/futures taxable.

## Manual vs bot
- **Manual**: decide if a discretionary hold is worth it after costs; pick the cheaper track.
- **Bot**: derive the `cost_per_unit` used in backtests and the live cost guardrails.
