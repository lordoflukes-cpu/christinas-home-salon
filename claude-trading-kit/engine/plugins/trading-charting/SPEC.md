# SPEC · trading-charting

**Purpose.** The TradingView signal/charting brain for both manual and bot. Build phase: **2**.

## Contents (planned)
- **Skills**: `pine-author` (P1, generate/lint Pine), `pine-alert` (P1, build alert() +
  the webhook JSON payload), `screener` (P2), `chart-playbook` (P2, manual),
  `explain-signal` (P2), `tv-strategy-tester` (P2, cross-check vs engine — may live in
  trading-research).
- **Agents**: `pine-engineer` (P2, author/review Pine + payloads).
- **Assets**: a Pine template library and the versioned **alert JSON contract**
  (`ts.alert.v1`, see docs/03-integrations/tradingview.md).

## Manual + bot
- Manual: chart templates/playbooks; alerts ping you to look; screeners surface candidates.
- Bot: the same Pine strategy's alert drives the order via the bridge.

## Cross-device
TradingView web/mobile; Pine and configs are portable. No device dependency.

## Dependencies / reuse
- Emits to `trading-bridge` (the webhook contract). Cross-checks against `trading-research`.

## Secrets
The alert "secret" token is paired with bridge-side HMAC (docs/08) — not stored in Pine.

## Definition of done
A sample Pine alert validates against `ts.alert.v1`; the stub poster drives the bridge;
chart-playbook mirrors the bot's coded rules (parity).
