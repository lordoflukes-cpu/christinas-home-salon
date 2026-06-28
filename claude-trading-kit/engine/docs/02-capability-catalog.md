# 02 · Capability Catalog

The exhaustive inventory, mapped to **plugin**, **artifact type**, and **M/B** (serves
Manual / Bot / both). Priority: **P1** (foundation), **P2** (core value), **P3** (later).
This is the menu later phases build from — not everything ships at once.

## Skills

| Skill | Plugin | M/B | Pri | Purpose |
|---|---|---|---|---|
| risk-check | core | both | P1 | ATR/vol-target sizing + limit gate (PASS/BLOCK) |
| cost-model | core | both | P1 | all-in cost (spread+commission+carry); CFD vs spread-bet |
| trade-journal | core | both | P1 | structured entry, R-multiple, plan-adherence |
| health-review | core | both | P1 | monthly/quarterly scorecard → keep/de-risk/retire |
| regime | core | both | P2 | classify regime → posture |
| kelly | core | both | P3 | fractional-Kelly sizing |
| pre-trade-checklist | core | manual | P2 | discretionary discipline gate |
| backtest | research | both | P1 | run engine, scorecard + verdict |
| walk-forward | research | both | P2 | rolling re-optimization OOS |
| monte-carlo | research | both | P2 | trade-reshuffle drawdown distribution |
| optimize | research | both | P2 | param sweep + plateau/anti-overfit |
| deflated-sharpe | research | both | P3 | DSR / PBO multiple-testing correction |
| tv-strategy-tester | research | both | P2 | import/cross-check TradingView Strategy-Tester results |
| pine-author | charting | both | P1 | generate/lint Pine indicators & strategies |
| pine-alert | charting | both | P1 | build alert() messages + the webhook JSON payload |
| screener | charting | both | P2 | TradingView screener config for candidate setups |
| chart-playbook | charting | manual | P2 | discretionary chart-read checklist per setup |
| explain-signal | charting | both | P2 | why is this setup firing (intermarket + Pine logic) |
| market-brief | data | both | P2 | pre-session macro/calendar/COT/regime brief |
| intermarket | data | both | P2 | DXY + real yields + VIX + ratio panel |
| cot-report | data | both | P3 | CFTC positioning summary |
| news-window | data | both | P1 | upcoming high-impact events + halt rule |
| webhook-design | bridge | both | P1 | author/validate the alert→bridge JSON contract |
| route-test | bridge | both | P2 | dry-run an alert through auth/idempotency/risk-gate |
| order-preview | execution | both | P1 | translate a signal to a venue order (no send) |
| reconcile | execution | bot | P2 | broker vs internal position/PnL reconciliation |
| tax-uk | execution | both | P2 | CFD vs spread-bet classification + CGT estimate + records |
| prop-firm-check | execution | both | P3 | validate params vs funded-account rules |

## Connectors (MCP)

| Connector | Plugin | M/B | Pri | Notes |
|---|---|---|---|---|
| backtest-engine | research | both | P1 | wraps vendor/gold-bot (run_backtest, position_size, cost_model, metrics) |
| market-data | data | both | P1 | price (Twelve Data/AllTick); stub mode |
| fred | data | both | P1 | real yields, DXY, breakevens |
| cot | data | both | P3 | CFTC positioning (weekly, lagged) |
| economic-calendar | data | both | P1 | events + news-window state |
| tradingview-bridge | bridge | both | P1 | the webhook receiver as a controllable service |
| vt-markets (MetaApi/MT5) | execution | both | P2 | CFD execution + data |
| ig-spreadbet | execution | both | P2 | tax-free track execution + data |
| telegram | execution | both | P1 | alerts out + /halt /flat /status in |
| live-monitor | research/execution | both | P2 | wraps vendor/gold-bot FastAPI monitor + kill-switch |
| reused (env) | — | — | — | Crypto_com, Bigdata.com, Wolfram, Supabase, Vercel, Google Calendar, Gmail/Drive |

## Agents (subagents)

| Agent | Plugin | M/B | Pri | Mandate |
|---|---|---|---|---|
| risk-manager | core | both | P1 | adversarial veto on size/limits |
| backtest-analyst | research | both | P1 | interpret results, flag overfitting |
| red-team-skeptic | research | both | P1 | try to refute a claimed edge |
| quant-validator | research | both | P2 | run the validation ladder (WFA/MC/DSR) |
| market-analyst | data | both | P2 | daily macro/intermarket/regime call |
| pine-engineer | charting | both | P2 | author/review Pine; alert payload design |
| execution-engineer | execution | bot | P2 | venue adapters, idempotency, reconciliation |
| incident-responder | execution | bot | P2 | diagnose outage/kill-switch events |
| journal-coach | core | manual | P3 | discipline/psychology review |
| tax-adviser-uk | execution | both | P3 | classification + records (with disclaimer) |
| onboarding-guide | core | both | P3 | explain the system to a new user |

## Workflows (expressed as skills/commands — multi-agent pipelines)

| Workflow | Home plugin | M/B | Pri | Pipeline |
|---|---|---|---|---|
| idea→backtest→validate | research | both | P2 | generate → backtest each → adversarial verify |
| nightly research brief | data | both | P2 | macro∥calendar∥COT∥regime → synthesize |
| overfitting tournament | research | both | P3 | many strategies → DSR/PBO judge → survivors |
| ensemble builder | research | both | P3 | param/instrument sweep → decorrelated set |
| health/decay audit | core | both | P2 | scorecard across decay/regime/ops → go/no-go |
| pre-deployment gate | execution | bot | P1 | tests + backtest gates + risk checks before live |
| incident response | execution | bot | P2 | kill-switch → logs → diagnose → postmortem |
| news-driven risk sweep | data | both | P2 | high-impact event → re-check exposure/correlation |

## Bonus (plugin-packable automation)

- **Hooks**: PreToolUse order-guard + news-window; SessionStart brief; PostToolUse
  backtest-gate on strategy edits.
- **Monitors**: live feed / kill-switch / daily-PnL background watchers.
- **Commands**: `/halt`, `/flat`, `/status` (cross-device operator quick-actions).
