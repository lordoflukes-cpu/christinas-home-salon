# Connector · CFTC Commitments of Traders (SPEC; sim BUILT)

**Purpose.** Weekly managed-money positioning for gold/silver — crowding context for
squeeze/reversal risk.

**Status.** SPEC for the real pull; the BUILT `trading-data` MCP `cot` tool returns sim values
flagged `lagged:true`. Implement real fetch in `engine/plugins/trading-data/data/cot.py`.

**Auth.** None for CFTC public data (or a mirror's key). Sources: the official CFTC
**Disaggregated Futures-Only** report (publicreporting.cftc.gov, Socrata API + CSV/XLS;
gold = COMEX 088691, silver = 084691), or Barchart / Myfxbook / metalcharts mirrors. "Managed
money net" = the disaggregated MM long − short.

**Tool.** `cot()` → `{gold_mm_net, silver_mm_net, as_of, lagged:true}`.

**Critical caveat.** **Tuesday data, released Friday** — always LAGGED. Never use intra-week as if
real-time. Managed money is trend-following → extremes often mark mature trends, not turning points.

**Use cases.** `cot-report`, `sentiment`, `news-sentiment-analyst`, `portfolio-allocator`
(crowding-aware sizing).
