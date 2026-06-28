# Connector · Economic calendar (SPEC; sim BUILT)

**Purpose.** High-impact event schedule (CPI/FOMC/NFP/PMI) → drives the **news-window guard** that
blocks new entries around releases. The single highest-value live rule for a metals bot.

**Status.** SPEC for the real provider; the BUILT `trading-data` MCP `economic_calendar` /
`news_window` use a sim schedule. Implement real fetch in
`engine/plugins/trading-data/data/calendar.py`.

**Auth.** Provider key (read-only, in env). Env: `CALENDAR_KEY`. Providers (link the chosen one's
official API docs): **TradingEconomics** (`/calendar`), **Financial Modeling Prep**
(`/economic_calendar`), or an Investing.com mirror. Filter to high-impact US events (CPI, FOMC,
NFP, PMI).

**Tools.** `economic_calendar(hours_ahead)` → list of `{event, country, impact, time, actual,
forecast, previous}`; `news_window(now)` → `{active, next_event, in_minutes}` within
±`NEWS_GUARD_MINUTES`.

**Loop closure.** The `news_window_poller.py` (in `engine/plugins/trading-data/tools/`) POSTs the
state to the bridge `/api/news-window`, so the risk-gate auto-blocks entries.

**Use cases.** `news-window` skill, `market-brief`, the news-driven-risk-sweep workflow, and the
automated entry block around releases.
