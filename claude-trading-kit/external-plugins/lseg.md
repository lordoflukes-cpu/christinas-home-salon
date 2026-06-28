# External plugin · LSEG — Equity Research Analysis (EXTERNAL)

**Plugin.** LSEG (London Stock Exchange Group / Refinitiv data). Install via Customize → + → Browse
Plugins → search `LSEG` → Install. Provide a company name or ticker.

**Status.** EXTERNAL (premium data; no portable local equivalent — it depends on LSEG/Refinitiv
consensus and fundamentals). Referenced here as the institutional-grade equity-research route.

## Skill · Equity Research Analysis
Combines analyst consensus estimates, financial fundamentals, valuation analysis, stock
performance, and macro context into a structured equity research report with bull and bear cases.

**Exact trigger prompt**
```
/equity-research Generate an institutional-style equity research snapshot for NVIDIA including
consensus estimates, valuation analysis, historical performance, macro context, bull/bear thesis,
and investment outlook.
```

**Trading use cases.**
- **Gold/silver miners & streamers** (e.g. GDX/GDXJ constituents, silver producers) when you trade
  equities alongside spot metals — consensus, valuation, and the bull/bear thesis.
- **Macro context** for the metals complex via the report's rate/USD/risk framing.
- A **fundamental cross-check** on a name before adding equity exposure to the book
  (`portfolio-allocator` then sizes/correlates it).

→ kit: feeds `market-analyst` and `strategy-researcher`; the **red-team-skeptic** agent should
stress-test any bull thesis before capital is risked.

## Note
This is the one external skill with no kit-local equivalent — fundamental equity research needs the
licensed data LSEG provides. For metals *macro* (not single-stock) you can stay inside the kit with
`intermarket` + `market-brief` + the Bigdata.com connector.
