# Glossary

- **ADR** — Architecture Decision Record (`docs/decisions/`); a short note capturing a
  significant choice and its rationale.
- **ATR** — Average True Range; volatility measure used for stops and position sizing.
- **Bot flow** — alert → bridge → auto-order at a venue.
- **Bridge** — the cloud webhook receiver (`trading-bridge`): HMAC, idempotency, risk-gate, route.
- **CFD** — Contract for Difference; VT Markets' product; UK-taxable (CGT).
- **client_order_id** — idempotency key carried from the TradingView alert to the order.
- **COT** — CFTC Commitments of Traders positioning report (weekly, lagged).
- **DSR / PBO** — Deflated Sharpe Ratio / Probability of Backtest Overfitting.
- **EA** — Expert Advisor; an automated strategy on MetaTrader.
- **Execution interface** — the venue-agnostic Protocol both backends implement.
- **FRED** — Federal Reserve Economic Data; macro series (real yields, DXY, breakevens).
- **HMAC** — keyed hash authenticating webhook payloads.
- **IG** — UK broker; lead candidate for the tax-free spread-bet track (REST/streaming API).
- **Kill-switch** — flatten all + block new orders; the last line of defence.
- **Manual flow** — alert → bridge → Telegram *suggestion* → human executes.
- **MetaApi** — cloud REST/WebSocket API for MT4/MT5; default cross-device VT Markets path.
- **MT4/MT5** — MetaTrader platforms; VT Markets' trading terminals.
- **News-window guard** — block new entries ±N min around high-impact releases.
- **Parity** — the rule that every capability serves both manual and bot trading.
- **Pine (Script)** — TradingView's strategy/indicator language.
- **R / R-multiple** — trade P&L expressed in units of initial risk.
- **Risk-gate** — pre-execution checks: size, limits, news, kill-switch.
- **Spread bet** — UK leveraged product; **tax-free** for retail (no CGT).
- **Track** — `cfd` (VT Markets) or `spreadbet` (IG); tags fills for tax records.
- **vendor/gold-bot** — the wrapped, verified research engine/monitor/backtest.
