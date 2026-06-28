# External plugin · Bigdata — Financial Research Analyst (EXTERNAL)

**Plugin.** Bigdata. Install via Customize → + → Browse Plugins → search `Bigdata` → Install.
Provide a company, sector, country, or investment theme.

**Status.** EXTERNAL (premium data). The kit already has the **Bigdata.com ENV connector**
(`connectors/README.md`) — the in-environment route to the same data
(`bigdata_search`, `bigdata_*_tearsheet`, `bigdata_events_calendar`, sentiment) — plus the
`strategy-researcher`, `news-sentiment-analyst`, and `market-analyst` agents.

## Skill · Financial Research Analyst
Gathers research, earnings context, macro data, competitive intelligence, and market developments
into an institutional-style research brief.

**Exact trigger prompt**
```
/financial-research-analyst Create a full research brief on the global AI semiconductor sector
including leading companies, valuation trends, macro risks, earnings momentum, and key
themes shaping the market.
```

**Trading use cases (metals-focused).**
- **Macro/theme briefs** that frame the metals backdrop — USD/rates regime, inflation, central-bank
  gold demand, the risk cycle — feeding `market-brief` and `intermarket`.
- **Sector context** for related plays (gold miners, silver industrial demand) when you trade them
  alongside spot metals.
- **Event/earnings context** that may move the complex → `news-sentiment-analyst`,
  the **nightly-research-brief** and **news-driven-risk-sweep** workflows.

→ Use this (or the **Bigdata.com** connector) for the deep-research step; `strategy-researcher`
turns a finding into a *testable* hypothesis for the engine.

## When to use the plugin vs the ENV connector
The **plugin** packages a ready-made research-brief skill; the **Bigdata.com connector** gives the
same underlying data as MCP tools you can call from any kit skill/agent. Either way: research is
**context, not a signal** — validate any resulting idea through the backtest/validation ladder.
