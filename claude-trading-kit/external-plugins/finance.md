# External plugin · Finance — Variance Analysis (EXTERNAL)

**Plugin.** Finance. Install via Customize → + → Browse Plugins → search `Finance` → Install. Upload
budget, forecast, or actual financial data, then run the skill.

**Status.** EXTERNAL (installed separately). Portable local equivalent: `skills/variance-analysis`.

## Skill · Variance Analysis
Identifies revenue and margin drivers, builds variance bridges, generates FP&A commentary, and
produces executive-ready financial narratives.

**Exact trigger prompt**
```
/variance-analysis Compare budget vs actual performance across regions, departments, and
product lines, identify the main revenue and margin variance drivers, and generate an
executive-ready FP&A narrative.
```

**Trading use cases.**
- **Plan vs actual P&L** — backtested/expected expectancy, return, and trade count vs realized;
  decompose the gap into volume / win-rate / payoff / cost / sizing / mix drivers.
- **Attribution** — variance by instrument, strategy, session, and track (CFD vs spread-bet).
- **Trading-as-a-business** — if you run accounts as a business, budget vs actual on costs/fees/PnL.

→ kit: `variance-analysis` (the trading-scoped bridge), feeding `report-writer` and the
**weekly-performance-report** workflow; confirmed adverse drivers → `decay-scan`.

## When to use the plugin vs the local skill
Use the **Finance plugin** for full budget/forecast/actual workbooks and polished executive
narratives across many dimensions; use the kit's **`variance-analysis`** for a focused trading P&L
bridge in-context.
