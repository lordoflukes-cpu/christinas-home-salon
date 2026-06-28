# SPEC · trading-data

**Purpose.** Market data + macro that feed the risk-gate (news-window, volatility) and
research. Build phase: **4**.

## Contents (planned)
- **Connectors (MCP)**: `market-data` (price; Twelve Data/AllTick; stub), `fred` (real
  yields/DXY/breakevens), `economic-calendar` (events + news-window state), `cot` (P3).
- **Skills**: `news-window` (P1), `market-brief` (P2), `intermarket` (P2), `cot-report` (P3).
- **Agents**: `market-analyst` (P2).

## Manual + bot
- Manual: pre-session brief, intermarket panel, "don't trade now" news reminder.
- Bot: news-window state auto-blocks new entries in the risk-gate; data drives regime/size.

## Cross-device
Cloud REST/WebSocket; runs server-side. Outputs viewable on any device.

## Dependencies / reuse
- Reuse `vendor/gold-bot/app/feeds` for the simulated stub feed and tier model.
- Available env connectors for prototyping: Bigdata.com, FRED, Crypto_com.

## Secrets
Provider API keys + FRED key (env / secrets manager). Stub mode needs none.

## Definition of done
Stubs run with no keys; news-window flips correctly and the risk-gate consumes it.
