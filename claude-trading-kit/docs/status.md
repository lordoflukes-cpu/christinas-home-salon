# Status — BUILT vs PLAYBOOK vs SPEC (single source of truth)

Honest labels so nothing is oversold.

- **BUILT** — real, tested implementation (code in `engine/`, or copied from the tested suite and
  exercised by its pytest).
- **PLAYBOOK** — a usable `SKILL.md`/agent that works through Claude's reasoning (+ inline formulas
  or a call to a BUILT MCP tool). No bespoke code; correctness rests on the documented method.
- **SPEC** — interface + setup + use cases documented; implementation/wiring still to do.
- **EXTERNAL** — a proprietary Claude marketplace plugin, installed separately (not bundled). The
  kit ships a portable PLAYBOOK equivalent where premium data isn't required.

## Skills (42)
**BUILT (24):** backtest, optimize, walk-forward, monte-carlo, regime, risk-check, cost-model,
market-brief, intermarket, cot-report, news-window, pine-author, pine-alert, webhook-design,
screener, chart-playbook, explain-signal, tv-strategy-tester, order-preview, route-test, reconcile,
trade-journal, health-review, tax-uk.
**PLAYBOOK (18):** deflated-sharpe*, ensemble*, replay*, strategy-scaffold, kelly,
correlation-matrix, pre-trade-checklist, prop-firm-check, deploy-check, gold-silver-ratio,
sentiment, equity-report, decay-scan, post-mortem, data-explore, data-validate, variance-analysis,
scraper-builder.
&nbsp;&nbsp;*\* engine-backed: call the BUILT `backtest-engine` MCP tools.*
&nbsp;&nbsp;*data-explore / data-validate / variance-analysis / scraper-builder are the portable
local equivalents of the Data / Finance / Bright Data plugin skills (see EXTERNAL below).*

## Agents (19)
**BUILT/tested-suite (8):** backtest-analyst, quant-validator, red-team-skeptic, risk-manager,
market-analyst, pine-engineer, execution-engineer, incident-responder.
**PLAYBOOK (11):** strategy-researcher, trading-code-reviewer, portfolio-allocator,
prop-firm-strategist, news-sentiment-analyst, devops-trader, data-engineer, journal-coach,
tax-adviser-uk, report-writer, onboarding-guide.

## Commands & hooks — BUILT
/halt, /flat, /status; hooks.json + order_guard.py + session_brief.txt.

## Connectors (29)
**BUILT MCP (5):** backtest-engine, charting-tools, trading-data (FRED real path; rest simulated),
bridge-control, execution (paper venue; VT/IG/MetaApi/MT5 are stubs).
**ENV (11):** Crypto.com, Bigdata.com, Era_Context, Wolfram, Supabase, Vercel, Google Calendar,
Gmail/Drive/AgentMail, PayPal, GitHub, Zapier — available in the environment, wire with your auth.
**CUSTOM / SPEC (13):** OANDA, IBKR, market-data (Twelve Data/AllTick/Polygon), FRED (real path
already in trading-data), CFTC-COT (sim in trading-data), Dukascopy, economic-calendar (sim in
trading-data), Telegram (stub built in execution), live-monitor (gold-bot FastAPI partial),
news-sentiment, Google-Sheets, fundamentals (WGC/Silver Institute), prop-firm-rules.

## Workflows (12)
**Runnable now (paper/engine, 11):** idea-to-validate, nightly-research-brief,
walk-forward-validation, multi-instrument-sweep, overfitting-tournament, ensemble-builder,
health-decay-audit, incident-response, pre-deployment-gate, weekly-performance-report,
news-driven-risk-sweep.
**Partial (1):** data-pipeline-refresh (runs on the simulated data source; sharpens with real
feeds).

## External plugins (5 plugins / 6 skills) — EXTERNAL
Installed separately from Claude's integrations; documented in `external-plugins/`.
- **Data** → Explore Data, Validate Data (local equivalents: `data-explore`, `data-validate`).
- **Finance** → Variance Analysis (local equivalent: `variance-analysis`).
- **Bigdata** → Financial Research Analyst (ENV `Bigdata.com` connector is the in-env route).
- **LSEG** → Equity Research Analysis (premium data; referenced, no local equivalent).
- **Bright Data** → Scraper Builder (local equivalent: `scraper-builder`, using the Nimble MCP).

## What is explicitly NOT built here
Live API calls for the custom broker/data connectors (OANDA/IBKR/Twelve Data/AllTick/Polygon/
Dukascopy live, real Telegram bot loop, live news/sentiment feeds). These are SPECs with
interfaces and setup. The BUILT engine (backtest, validation, sizing, regime, bridge,
execution-paper, simulated+FRED data) is included and runnable.
