# SPEC · trading-execution

**Purpose.** Place and manage orders behind one **venue-agnostic interface**, across the
two tax tracks, with Telegram control and a kill-switch. Build phase: **5**.

## Contents (planned)
- **Execution interface** (`ExecutionVenue`, see docs/03-integrations/execution-abstraction.md)
  with backends: `PaperVenue` (default stub, reuse gold-bot PaperBroker), `MetaApiVenue`
  (VT Markets CFD, cloud default), `MT5Venue` (Windows option), `IGVenue` (spread-bet, tax-free).
- **Connectors (MCP)**: `vt-markets` (MetaApi/MT5), `ig-spreadbet`, `telegram` (alerts +
  /halt /flat /status).
- **Skills**: `order-preview` (P1, signal→order, no send), `reconcile` (P2), `tax-uk` (P2,
  CFD vs spread-bet records + CGT estimate), `prop-firm-check` (P3).
- **Agents**: `execution-engineer` (P2), `incident-responder` (P2).
- **Commands**: `/halt`, `/flat`, `/status`.
- **Workflows (as skills)**: pre-deployment gate; incident response.

## Manual + bot
- Manual: `order-preview` + Telegram `/status`; user executes on their platform.
- Bot: idempotent auto-orders, reconciliation, kill-switch.

## Cross-device
Default backends (MetaApi, IG) + Telegram are cloud/cross-device; `MT5Venue` is the
Windows-only optional backend. Selected by config — never required.

## Dependencies / reuse
- Sizing from `trading-core`; news-window/kill from `trading-data`; receives routed orders
  from `trading-bridge`. PaperVenue reuses `vendor/gold-bot` PaperBroker.

## Secrets
MetaApi token + MT login; IG API key/credentials; Telegram token; all via secrets manager.
Trade-only scopes; least privilege (docs/08).

## Definition of done
PaperVenue passes an end-to-end alert→order→reconcile→journal cycle; kill-switch flattens;
venue swappable by config; CFD vs spread-bet tagging + tax records correct; security
checklist passes.
