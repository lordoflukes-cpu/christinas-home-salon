# Connectors (MCP) — index, status & use cases

Connectors are MCP servers that give the skills/agents real data, execution, comms, and storage.
Three kinds:

- **BUILT** — runnable MCP servers shipped in this kit (`engine/`), no creds needed (simulated).
- **ENV** — already available in the Claude environment; wire straight in with your own auth.
- **CUSTOM (SPEC)** — high-value connectors to implement; full specs in `connectors/custom/`.

Add the BUILT ones via `mcp.example.json` (replace `${KIT}` with this folder's path). Add ENV/
CUSTOM via your own `.mcp.json`/platform with their credentials.

## BUILT (in this kit — `engine/`)

| Connector | Tools | Use cases |
|---|---|---|
| **backtest-engine** | run_backtest, position_size, cost_model, walk_forward, monte_carlo, parameter_plateau, deflated_sharpe, classify_regime, metrics_explain | Backtesting, validation suite, sizing, cost modelling, regime — powers most research/risk skills |
| **charting-tools** | validate_alert, make_alert_payload, sign_payload, lint_pine, diff_metrics | Author/validate the ts.alert.v1 webhook; HMAC-sign; lint Pine; TV-vs-engine cross-check |
| **trading-data** | quote, candles, fred, economic_calendar, news_window, cot, intermarket | Market/macro data, the news-window guard, intermarket panel — feeds research + the risk-gate |
| **bridge-control** | dry_run_alert, bridge_status, set_kill_switch, set_news_window, recent_decisions | Drive/inspect the webhook bridge; test routing; operate the kill-switch |
| **execution** | order_preview, place_order, positions, account, flatten_all, reconcile, set_venue, tax_records, telegram_command | Venue-abstracted execution (paper/VT/IG), reconciliation, kill-switch, UK tax records, Telegram |

## ENV (available in the Claude environment — wire with your auth)

| Connector | Use cases |
|---|---|
| **Crypto.com** | Real-time crypto orderbook/candles/trades (if you trade crypto alongside metals) |
| **Bigdata.com** | Financial tearsheets, market sentiment, events calendar, news → `sentiment`, `news-sentiment-analyst` |
| **Era_Context** | Accounts/transactions/cash-flow → treasury & P&L context |
| **Wolfram** | Quant math/stats (correlation matrices, distributions, charting) |
| **Supabase** | Database for trades/equity/journal storage (`trade-journal`, `equity-report`) |
| **Vercel** | Deploy the live dashboard / status pages |
| **Google Calendar** | Economic-calendar events, review scheduling |
| **Gmail / Google Drive / AgentMail** | Deliver reports & alerts (`equity-report`, weekly report workflow) |
| **PayPal** | Business invoicing/transactions (if trading as a business) |
| **GitHub** | Code + CI for the kit/strategies |
| **Zapier** | Bridge to 9,000+ apps (Telegram, Discord, Sheets, some brokers) for quick prototypes |

## CUSTOM (SPEC — see `connectors/custom/<name>.md`)

| Connector | Status | Use cases |
|---|---|---|
| **OANDA v20** | SPEC | Spot metals/FX quotes, orders, positions — an alternative execution venue |
| **IBKR** | SPEC | Futures (MGC/MGC micro gold, SIL) execution + data |
| **Market data (Twelve Data / AllTick / Polygon)** | SPEC (sim built) | Real XAU/XAG/DXY stream + history (the BUILT `trading-data` has the sim + FRED real path) |
| **FRED** | BUILT (real path in trading-data) | Real yields, DXY, breakevens |
| **CFTC COT** | SPEC (sim in trading-data) | Weekly managed-money positioning (lagged) |
| **Dukascopy** | SPEC | Free historical tick/OHLC for backtests |
| **Economic calendar** | SPEC (sim in trading-data) | High-impact events → the news-window guard (build with `scraper-builder` skill) |
| **Telegram** | BUILT (stub in execution) | Push alerts + receive /halt /flat /status; real bot token to go live |
| **live-monitor** | partial (gold-bot FastAPI in engine) | Snapshot, kill-switch, paper state dashboard |
| **News / sentiment (NewsAPI / RSS / X)** | SPEC | Headlines/social for `sentiment` (Bigdata.com is the ENV alternative; build with `scraper-builder` skill + Nimble MCP) |
| **Google Sheets** | SPEC (Zapier/ENV alternative) | Journal / trade log in a spreadsheet |
| **Fundamentals (WGC / Silver Institute)** | SPEC | Central-bank demand, silver supply/demand for the metals narrative |
| **Prop-firm rules** | SPEC | Encode FTMO/FundedNext limits for `prop-firm-check` |

## EXTERNAL PLUGINS (companion — see `../external-plugins/`)
Proprietary Claude marketplace plugins that add data/analysis (installed separately, not bundled):
**Data** (Explore/Validate Data), **Finance** (Variance Analysis), **Bigdata** (Financial Research
Analyst — same data as the ENV **Bigdata.com** connector above), **LSEG** (Equity Research), **Bright
Data** (Scraper Builder — pairs with the `scraper-builder` skill + Nimble MCP to populate the SPEC
feeds above). Full mapping + install steps in `external-plugins/`.

## Security (all connectors)
Secrets via env/secrets-manager, never committed. Broker keys = trade-only, least privilege.
Webhooks use HMAC; Telegram commands use a sender allow-list. See `engine/docs/08-security.md`.
