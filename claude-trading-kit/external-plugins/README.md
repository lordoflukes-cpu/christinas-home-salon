# External plugins — companion Claude marketplace plugins (EXTERNAL)

These are **proprietary Claude plugins** you install separately from Claude's integrations — they
are **not bundled** in this kit (and can't be: they're marketplace plugins, some backed by premium
data). This folder documents the ones most useful to trading: what each does, the exact trigger
prompt, the trading use cases, and **how each maps onto this kit's skills/workflows**. Where it was
feasible and free of premium data, the kit also ships a **portable local equivalent** SKILL.md so
you get the capability with no install — those are flagged below.

## Install (any plugin)
Click **Customize** (left sidebar) → the **+** beside **Personal Plugins** → **Browse Plugins** →
type the plugin name (e.g. `Finance`) → open it → **Install**. It then appears under Personal
Plugins and its skills become available. Start a new chat, pick the skill, and run it with your
files/prompt.

## The plugins & skills
| Plugin | Skill(s) | What it's for (trading) | Local equivalent in kit | Doc |
|---|---|---|---|---|
| **Data** | Explore Data, Validate Data | Profile & audit trade logs, equity curves, backtest exports, workbooks | `skills/data-explore`, `skills/data-validate` | `data.md` |
| **Finance** | Variance Analysis | Budget/forecast vs actual P&L; FP&A narrative | `skills/variance-analysis` | `finance.md` |
| **Bigdata** | Financial Research Analyst | Sector/theme/macro research briefs | ENV **Bigdata.com** connector + research agents | `bigdata.md` |
| **LSEG** | Equity Research Analysis | Ticker-level equity research (e.g. gold miners) | referenced (premium data) | `lseg.md` |
| **Bright Data** | Scraper Builder | Build scrapers for news/fundamentals/calendar feeds | `skills/scraper-builder` (+ Nimble MCP) | `bright-data.md` |

## How they slot into the kit
- **Data quality** (Explore/Validate Data) → run *before* research/reporting trust your data; pairs
  with `equity-report`, `decay-scan`, `trading-code-reviewer`, `reconcile`.
- **Performance** (Variance Analysis) → the attribution step in the **weekly-performance-report**
  workflow; pairs with `equity-report`, `report-writer`.
- **Research** (Financial Research Analyst, Equity Research) → the deep-dive step in the
  **nightly-research-brief** workflow; pairs with `market-brief`, `strategy-researcher`,
  `news-sentiment-analyst`, `market-analyst`.
- **Data feeds** (Scraper Builder) → the implementation route for the kit's `news-sentiment`,
  `fundamentals`, and `economic-calendar` SPEC connectors; pairs with `data-validate`.

## Honesty
EXTERNAL = installed separately, not part of the portable folder; the research plugins depend on
premium data (Bigdata / LSEG-Refinitiv). The local equivalents are PLAYBOOK skills (Claude reasoning
+ available tools), lighter than the premium plugins but fully portable. Nothing here changes the
kit's safety defaults — none of these place trades.
