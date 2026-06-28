# 05 · Build Roadmap & Quality Gates

Best path, not fastest: each phase builds on a verified foundation and must pass its
gate before the next begins. Stub-first throughout — nothing needs live credentials to
demo or test.

## Phase 0 — Foundation (THIS phase) ✅ in progress
CLAUDE.md, docs/ specs, plugin scaffolds (plugin.json + SPEC.md), vendor/gold-bot.
**Gate:** all manifests valid; docs cross-link; a fresh session can onboard from the
reading order; no capability code yet.

## Phase 1 — trading-core + trading-research (the spine)
Wrap the gold-bot engine. Skills: risk-check, cost-model, trade-journal, health-review,
backtest. MCP: backtest-engine. Agents: risk-manager, backtest-analyst, red-team-skeptic.
**Gate:** skills invoke the engine; MCP tools execute; pytest green; honest FAIL on
synthetic data; installs via `/plugin`. Manual+bot use documented for each.

## Phase 2 — trading-charting (TradingView)
Pine indicator/strategy/screener templates; the **alert webhook JSON contract**;
pine-author/pine-alert/screener/chart-playbook skills; pine-engineer agent;
tv-strategy-tester cross-check.
**Gate:** a sample Pine alert validates against the JSON schema; the stub poster drives
the (Phase-3) bridge; manual chart-playbook mirrors bot logic.

## Phase 3 — trading-bridge (the junction)
Cloud webhook receiver: HMAC verify, idempotency, **risk-gate**, route to execution
(bot) or Telegram suggestion (manual). webhook-design/route-test skills.
**Gate:** rejects bad HMAC; dedupes repeated `client_order_id`; blocks on
news-window/kill-switch; routes correctly in a dry-run; fully testable with the stub poster.

## Phase 4 — trading-data
market-data + FRED + economic-calendar (+ COT) MCP connectors with stubs; news-window
guard feeding the risk-gate; market-brief/intermarket skills.
**Gate:** stubs run with no keys; news-window state flips correctly; risk-gate consumes it.

## Phase 5 — trading-execution
Execution interface + PaperVenue (default) + MetaApiVenue + IGVenue (+ MT5Venue option);
per-venue sizing adapters; Telegram control (/halt /flat /status); reconciliation;
order-preview/reconcile/tax-uk skills; execution-engineer/incident-responder agents.
**Gate:** PaperVenue passes an end-to-end alert→order→reconcile→journal cycle; kill-switch
flattens; venue is swappable by config; CFD vs spreadbet tagging + tax records correct.

## Phase 6 — Workflows, monitors, hardening
Multi-agent workflows (idea→backtest→validate, nightly brief, overfitting tournament,
pre-deployment gate, incident response); background monitors; security review; docs polish.
**Gate:** pre-deployment gate blocks an unsafe go-live; security checklist (docs/08) passes.

## Cross-phase definition of done
Tests pass · manifests valid · stub mode works with no creds · manual+bot both covered ·
cross-device respected · secrets externalised · ADR written for any significant choice.
