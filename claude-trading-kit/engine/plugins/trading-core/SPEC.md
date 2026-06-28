# SPEC · trading-core

**Purpose.** The risk/discipline foundation used by every other plugin and by both manual
and bot trading. Build phase: **1** (with trading-research).

## Contents (planned)
- **Skills**: `risk-check` (P1), `cost-model` (P1), `trade-journal` (P1),
  `health-review` (P1), `regime` (P2), `pre-trade-checklist` (P2, manual), `kelly` (P3).
- **Agents**: `risk-manager` (P1, adversarial veto), `journal-coach` (P3).
- **Hooks**: PreToolUse order-guard + news-window reminder; SessionStart brief.
- **Commands**: (none here — operator commands live in trading-execution).

## Manual + bot
- Manual: size discretionary trades, pre-trade checklist, hand-journal, self health-review.
- Bot: auto-size in the risk-gate, auto-journal fills, review bot behaviour.

## Cross-device
Pure logic + MCP calls; no device-specific dependency. Works anywhere Claude runs.

## Dependencies / reuse
- `vendor/gold-bot` sizing/cost/metrics; ROADMAP §6/§11/§16 as the cited references.
- Calls the `backtest-engine` MCP (trading-research) for sizing/cost where useful.

## Secrets
None.

## Definition of done
Skills invoke the engine; `risk-manager` vetoes correctly; tests pass; installs via
`/plugin`; every skill documents manual + bot use.
