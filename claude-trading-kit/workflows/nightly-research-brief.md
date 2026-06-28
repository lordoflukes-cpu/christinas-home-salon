# Workflow · Nightly research brief

**Purpose.** A synthesized pre-session brief so you (or the bot) start the day oriented.

**Trigger.** Scheduled before the session (e.g. pre-London) or on demand.

**Steps (parallel fan-out → synthesize).**
1. In parallel: `intermarket` (DXY/yields/ratio), `economic_calendar`+`news-window` (today's
   events/windows), `cot-report` (positioning, lagged), `sentiment`/`news-sentiment-analyst`
   (tone), `regime` (on recent candles).
2. Synthesize via `market-brief` / `market-analyst` into one tight page.
3. *(Optional deep dive)* the **Bigdata** plugin's Financial Research Analyst / **Bigdata.com**
   connector for a sector/theme/macro brief, or the **LSEG** plugin's Equity Research for a
   miner/equity name — folded in as context, never as a signal (`external-plugins/`).

**Tools/agents.** trading-data MCP, backtest-engine `classify_regime`, market-analyst,
news-sentiment-analyst; optional Bigdata / LSEG external plugins.

**Output.** The `market-brief` block: macro · calendar/windows · positioning · regime · one-line
session take. Honest about sim/lagged data.

**Status.** Runnable (sim now; sharper with real data/calendar/sentiment connectors).
