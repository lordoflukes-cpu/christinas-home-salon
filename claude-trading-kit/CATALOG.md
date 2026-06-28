# CATALOG — the complete trading kit

The full index of every skill, agent, command, hook, connector, and workflow in this kit. Each
row: **name · what it does · primary use case · status · path**.

**Status legend**
- **BUILT** — real, tested implementation (code in `engine/`, or copied from the tested suite).
- **PLAYBOOK** — a usable `SKILL.md` / agent that works through Claude's reasoning (plus inline
  formulas, or it calls a BUILT MCP tool); no bespoke code required.
- **SPEC** — a connector/workflow with interface + setup + use cases, to wire up or implement.

Counts: **42 skills · 19 agents · 3 commands · 1 hook set · 29 connectors (5 BUILT, 11 ENV, 13 custom) · 12 workflows · 5 companion plugins (6 skills).**

> **EXTERNAL** — a proprietary Claude marketplace plugin (installed separately, not bundled); see
> the "External plugins (companion)" section below and `external-plugins/`.

---

## Skills (`skills/<name>/SKILL.md`)

### Research & validation
| Skill | What it does | Use case | Status |
|---|---|---|---|
| backtest | Backtest dual-EMA+ATR trend on OHLC; §11 scorecard + go/no-go | Test a strategy / parameters | BUILT |
| optimize | Sweep a param neighbourhood, require a robust plateau, deflate Sharpe | Tune params without overfitting | BUILT |
| walk-forward | Rolling in-sample re-opt → out-of-sample test | Robustness before live | BUILT |
| monte-carlo | Trade-order reshuffle → drawdown/return distribution | Size for survivable drawdown | BUILT |
| deflated-sharpe | Deflate Sharpe for #trials + non-normality (Bailey & LdP) | Is the edge real or luck? | PLAYBOOK→engine |
| ensemble | Decorrelated members across lookbacks/instruments | Harden against param decay | PLAYBOOK→engine |
| replay | Bar-by-bar replay of a past day vs the strategy | Debug / trust a signal | PLAYBOOK→engine |
| strategy-scaffold | New strategy module from the parity-correct template | Prototype a new idea fast | PLAYBOOK |
| regime | Classify trend/range × quiet/volatile; press/shrink/stand-aside | "Should I trade now?" | BUILT |

### Risk & sizing
| Skill | What it does | Use case | Status |
|---|---|---|---|
| risk-check | ATR/vol-targeted size vs per-trade/daily/drawdown limits | Pre-trade size gate | BUILT |
| kelly | Fractional-Kelly sizing from edge, with hard caps | "How big given my edge?" | PLAYBOOK |
| correlation-matrix | Correlation across instruments → risk buckets | Avoid stacking the same bet | PLAYBOOK |
| cost-model | Spread + commission + carry vs edge; CFD vs spread-bet | Does it survive costs? | BUILT |
| pre-trade-checklist | Discretionary entry gate (setup/regime/risk/news/corr) | Before a manual trade | PLAYBOOK |
| prop-firm-check | Validate vs FTMO/FundedNext rulebook | Funded-account compliance | PLAYBOOK |

### Market read & macro
| Skill | What it does | Use case | Status |
|---|---|---|---|
| market-brief | Pre-session brief: macro, calendar, COT, intermarket, regime | Morning briefing | BUILT |
| intermarket | DXY / real yields / breakevens / GSR panel | Why is gold moving? | BUILT |
| gold-silver-ratio | GSR + historical percentile + relative-value read | Gold vs silver | PLAYBOOK |
| cot-report | CFTC managed-money net positioning (lagged) | Crowding / positioning | BUILT |
| news-window | Upcoming high-impact events; is a blackout active? | Safe to trade now? | BUILT |
| sentiment | News/social sentiment → cautious contrarian read | "Market mood?" | PLAYBOOK |

### TradingView / charting
| Skill | What it does | Use case | Status |
|---|---|---|---|
| pine-author | Write/review Pine in parity with the engine + ts.alert.v1 | Pine code | BUILT |
| pine-alert | Build + validate + HMAC-sign the alert JSON | Set up a TV webhook alert | BUILT |
| webhook-design | Configure + validate TV→bridge end-to-end | Wire a strategy to the bridge | BUILT |
| screener | Build/tune a TV screener for trend setups | Scan markets / watchlist | BUILT |
| chart-playbook | Disciplined discretionary chart-read checklist | Manual chart read | BUILT |
| explain-signal | Why is this signal/alert firing, and is it trustworthy? | "Why long/short?" | BUILT |
| tv-strategy-tester | Cross-check TV Strategy-Tester vs engine backtest | TV results look too good? | BUILT |

### Execution & ops
| Skill | What it does | Use case | Status |
|---|---|---|---|
| order-preview | Signal → exact venue order (lots / stake-per-point), no send | Sanity-check before execution | BUILT |
| route-test | Dry-run an alert through the full bridge pipeline | Debug routing/risk-gate | BUILT |
| reconcile | Bot vs broker positions; halt+alert on mismatch | Catch desync early | BUILT |
| deploy-check | Pre-deployment GO/NO-GO gate | Before paper→live / auto | PLAYBOOK |

### Performance & journaling
| Skill | What it does | Use case | Status |
|---|---|---|---|
| equity-report | Performance report from equity curve + trades, per-track | Monthly/quarterly review | PLAYBOOK |
| variance-analysis | Plan vs actual P&L bridge + FP&A narrative | Budget-vs-actual / attribution | PLAYBOOK |
| trade-journal | Structured journal entry (rationale, risk, R, adherence) | Log/review trades | BUILT |
| decay-scan | Rolling expectancy/payoff/drawdown/drift dashboard | "Is the edge still working?" | PLAYBOOK |
| post-mortem | Separate process failure from variance after a loss | After a drawdown/bad trade | PLAYBOOK |
| health-review | Monthly+quarterly scorecard → keep/de-risk/retire | System review | BUILT |

### Data quality & feeds
| Skill | What it does | Use case | Status |
|---|---|---|---|
| data-explore | Profile a trading dataset: quality, anomalies, seasonality, segments | Explore/sanity-check data | PLAYBOOK |
| data-validate | Audit a workbook/statement/backtest export for integrity | Trust a spreadsheet's numbers | PLAYBOOK |
| scraper-builder | Build a data feed (news/fundamentals/calendar) to the kit's schemas | Populate a SPEC connector | PLAYBOOK |

### Tax (UK)
| Skill | What it does | Use case | Status |
|---|---|---|---|
| tax-uk | Records by track + CGT estimate (CFD taxable, spread-bet free) | UK tax record-keeping | BUILT |

> tax-uk is record-keeping/estimation only — **not tax advice**; consult a qualified UK adviser.

---

## Agents (`agents/<name>.md`)

| Agent | What it does | Use case | Status |
|---|---|---|---|
| strategy-researcher | Evidence-grounded, engine-scoped strategy ideas | Brainstorm/research an edge | PLAYBOOK |
| backtest-analyst | Runs/interprets backtests; flags overfit/look-ahead/cost | Is this backtest trustworthy? | BUILT |
| quant-validator | Full validation ladder → go/no-go | Promote to paper/live | BUILT |
| red-team-skeptic | Adversarially refutes a claimed edge | Stress-test "it works" | BUILT |
| trading-code-reviewer | Finds money-losing bugs (look-ahead, repaint, leakage) | Before trusting code | PLAYBOOK |
| risk-manager | Adversarial risk veto on trades/sizes/params | Before entries / going live | BUILT |
| portfolio-allocator | Vol-targeted, correlation-aware capital allocation | Multi-strategy book | PLAYBOOK |
| prop-firm-strategist | Rule-compliant funded-account plan | Passing a prop challenge | PLAYBOOK |
| market-analyst | Daily macro/intermarket/regime read + posture | Daily brief | BUILT |
| news-sentiment-analyst | News/COT/calendar read + event-risk/crowding | "What's moving metals?" | PLAYBOOK |
| pine-engineer | Authors/reviews Pine + alert payloads, enforces parity | Non-trivial Pine work | BUILT |
| execution-engineer | Builds/reviews venue adapters, idempotency, reconcile | Order-path work | BUILT |
| devops-trader | Deploy + uptime for the live stack | Deploy/harden infra | PLAYBOOK |
| incident-responder | Diagnoses kill-switch/outage/mismatch fast & safe | Live incident | BUILT |
| data-engineer | Market/macro data pipelines + quality | Data/feed work | PLAYBOOK |
| journal-coach | Psychology/discipline review of the journal | Discipline check / post-tilt | PLAYBOOK |
| tax-adviser-uk | UK tax classification/record-keeping (with disclaimers) | UK tax by track | PLAYBOOK |
| report-writer | Honest performance/status reports (self/investor) | Weekly/monthly report | PLAYBOOK |
| onboarding-guide | Explains the whole kit + where to start | "Explain this system" | PLAYBOOK |

> tax-adviser-uk is **not** a substitute for a qualified adviser; it always carries that disclaimer.

---

## Commands (`commands/<name>.md`) — BUILT
| Command | What it does |
|---|---|
| /halt | Engage the kill-switch — stop all new entries |
| /flat | Flatten all positions now |
| /status | Bridge + execution + positions snapshot |

## Hooks (`hooks/`) — BUILT
| File | What it does |
|---|---|
| hooks.json | Registers the order-guard pre-tool hook + session brief |
| order_guard.py | Blocks unsafe order calls (no size/stop, kill-switch on) |
| session_brief.txt | Injects a trading-safety brief at session start |

---

## Connectors (`connectors/`) — full index in `connectors/README.md`

### BUILT MCP servers (in `engine/`, run on simulated data, no creds)
| Connector | Key tools | Use case | Status |
|---|---|---|---|
| backtest-engine | run_backtest, walk_forward, monte_carlo, parameter_plateau, deflated_sharpe, position_size, cost_model, classify_regime | Powers research/validation/sizing | BUILT |
| charting-tools | validate_alert, make_alert_payload, sign_payload, lint_pine, diff_metrics | ts.alert.v1 + Pine lint + parity | BUILT |
| trading-data | quote, candles, fred, economic_calendar, news_window, cot, intermarket | Market/macro data + news-window | BUILT (FRED real path) |
| bridge-control | dry_run_alert, bridge_status, set_kill_switch, set_news_window, recent_decisions | Operate/inspect the webhook bridge | BUILT |
| execution | order_preview, place_order, positions, account, flatten_all, reconcile, set_venue, tax_records, telegram_command | Venue-abstracted execution + reconcile | BUILT (paper; venue stubs) |

### ENV connectors (in the Claude environment — wire with your own auth)
Crypto.com · Bigdata.com · Era_Context · Wolfram · Supabase · Vercel · Google Calendar ·
Gmail/Drive/AgentMail · PayPal · GitHub · Zapier. (Use cases in `connectors/README.md`.)

### CUSTOM connectors (SPEC — `connectors/custom/<name>.md`)
OANDA · IBKR · market-data (Twelve Data/AllTick/Polygon) · FRED · CFTC-COT · Dukascopy ·
economic-calendar · Telegram · live-monitor · news-sentiment · Google Sheets · fundamentals
(WGC/Silver Institute) · prop-firm-rules.

---

## Workflows (`workflows/<name>.md`)
| Workflow | When to use | Status |
|---|---|---|
| idea-to-validate | Idea → validated (or rejected) strategy | runnable |
| nightly-research-brief | Daily pre-session briefing | runnable |
| walk-forward-validation | Robustness check before live | runnable |
| multi-instrument-sweep | Which markets/params it works on | runnable |
| overfitting-tournament | Many candidates, keep only survivors | runnable |
| ensemble-builder | Combine decorrelated members | runnable |
| health-decay-audit | Periodic keep/de-risk/retire | runnable |
| incident-response | Kill-switch / outage / mismatch | runnable |
| data-pipeline-refresh | Refresh + gap-check data | partial (sim built) |
| pre-deployment-gate | The GO/NO-GO before live | runnable |
| weekly-performance-report | Scheduled performance report | runnable |
| news-driven-risk-sweep | Re-check exposure on a big event | runnable |

---

## External plugins (companion) — `external-plugins/`
Proprietary Claude marketplace plugins (installed separately, **not bundled**). The kit ships
portable local equivalents where premium data isn't required.

| Plugin | Skill | Trading use case | Kit-local equivalent | Status |
|---|---|---|---|---|
| Data | Explore Data | Profile trade logs / equity curves / backtest exports | `skills/data-explore` | EXTERNAL |
| Data | Validate Data | Audit a workbook/statement/backtest export for integrity | `skills/data-validate` | EXTERNAL |
| Finance | Variance Analysis | Plan vs actual P&L; FP&A narrative | `skills/variance-analysis` | EXTERNAL |
| Bigdata | Financial Research Analyst | Sector/macro/theme research briefs | ENV Bigdata.com + research agents | EXTERNAL |
| LSEG | Equity Research Analysis | Ticker-level equity research (miners) | referenced (premium data) | EXTERNAL |
| Bright Data | Scraper Builder | Build news/fundamentals/calendar feeds | `skills/scraper-builder` (+ Nimble MCP) | EXTERNAL |
