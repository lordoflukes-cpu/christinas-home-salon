# Use cases — "how do I…?" → what to reach for

Task-oriented map from a goal to the skills/agents/workflows/connectors that serve it. Names link
to `skills/<name>/SKILL.md`, `agents/<name>.md`, `workflows/<name>.md`.

## I have a new strategy idea
1. **strategy-researcher** (agent) → shape it into a testable hypothesis scoped to the engine.
2. **strategy-scaffold** (skill) → generate a parity-correct module.
3. **backtest** → **optimize** (plateau) → **walk-forward** → **monte-carlo** → **deflated-sharpe**.
4. **backtest-analyst** + **red-team-skeptic** + **quant-validator** → go/no-go.
   → Workflow: **idea-to-validate**, then **overfitting-tournament** if you tried many variants.

## I'm about to place a trade
1. **regime** (is the regime friendly?) → **news-window** (is there event risk?).
2. **risk-check** (ATR size vs limits) — or **kelly** for edge-based sizing.
3. **correlation-matrix** (am I stacking the same bet?).
4. **pre-trade-checklist** (discretionary) → **order-preview** (exact venue size).
5. **risk-manager** (agent) has veto authority. → then place via execution.

## I want a daily market read
- **market-brief** skill or **market-analyst** agent → macro, calendar, COT, intermarket, regime.
- **intermarket** / **gold-silver-ratio** / **cot-report** / **sentiment** for specific angles.
  → Workflow: **nightly-research-brief**.
- Deeper research: the **Bigdata** plugin / **Bigdata.com** connector (sector/theme/macro briefs)
  and the **LSEG** plugin (ticker-level equity research, e.g. gold miners) —
  `external-plugins/bigdata.md`, `external-plugins/lseg.md`. Research is context, not a signal;
  validate any idea through the ladder.

## I want to use TradingView
- Charting/manual: **chart-playbook**, **explain-signal**, **screener**.
- Signals/alerts→bot: **pine-author** → **pine-alert** → **webhook-design** → **route-test**.
- Backtest parity: **tv-strategy-tester** (TV vs engine). Agent: **pine-engineer**.

## I want to go live (or flip to auto)
1. **deploy-check** skill → the operational gate.
2. **pre-deployment-gate** workflow → validation + risk + ops + account-rule sign-off.
3. **prop-firm-check** / **prop-firm-strategist** if it's a funded account.
4. **devops-trader** (deploy) + **execution-engineer** (order path) + **reconcile** (paper clean).
   The **kill-switch** (`/halt`, `/flat`, execution `flatten_all`) must be reachable first.

## Something went wrong live
- **incident-response** workflow + **incident-responder** agent: contain (kill-switch) → assess
  (positions/account/reconcile) → diagnose → smallest safe fix → postmortem. Never resume while
  internal and venue positions disagree.

## I want to check my system's health
- **decay-scan** (early erosion) → **regime** (hostile market?) → **health-review** (scorecard) →
  keep/de-risk/retire. → Workflow: **health-decay-audit**.

## I want a performance report
- **equity-report** skill → metrics + per-track split; **variance-analysis** → plan-vs-actual
  drivers; **report-writer** agent → the narrative; **journal-coach** for discipline/psychology.
  → Workflow: **weekly-performance-report**. Heavyweight FP&A: the **Finance** plugin's Variance
  Analysis (`external-plugins/finance.md`).

## I want to check / clean my data
- **data-explore** → profile a trade log / equity curve / backtest export (quality, anomalies,
  seasonality, segments). **data-validate** → audit a workbook/statement for broken calcs,
  duplicates, impossible values, look-ahead leaks. Big workbooks/warehouse: the **Data** plugin
  (`external-plugins/data.md`).

## I want to build a data feed
- **scraper-builder** → design a scraper for news/sentiment/fundamentals/calendar that emits the
  kit's connector schemas, using the **Nimble** MCP (or **Bright Data** plugin) as the engine;
  **data-validate** the output before publish. → Workflow: **data-pipeline-refresh**.

## I want to diversify / build a book
- **multi-instrument-sweep** → **correlation-matrix** → **ensemble** → **portfolio-allocator**.
  → Workflow: **ensemble-builder**.

## A big event is coming (CPI/FOMC/NFP)
- **news-window** + **news-sentiment-analyst** → **news-driven-risk-sweep** workflow: snapshot
  exposure, de-risk into uncertainty, respect the blackout. Never add risk just for the vol.

## UK tax / which track
- **tax-uk** skill / **tax-adviser-uk** agent: CFD (VT Markets) is CGT-taxable above the allowance;
  spread-bet (IG) is tax-free. **cost-model** compares the economics. *Not advice — see an adviser.*

## I'm new here
- **onboarding-guide** agent → what each piece does and where to start. Then `README.md` →
  `CATALOG.md` → this file.
