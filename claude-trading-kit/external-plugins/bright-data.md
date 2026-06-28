# External plugin · Bright Data — Scraper Builder (EXTERNAL)

**Plugin.** Bright Data. Install via Customize → + → Browse Plugins → search `Bright Data` →
Install. Provide a target website and the data fields you want.

**Status.** EXTERNAL. Portable local equivalent: `skills/scraper-builder`, which uses an available
scraping MCP as its engine — the live **Nimble** MCP (`nimble_search`, `nimble_extract`,
`nimble_crawl_run`, `nimble_extract_async`) or `WebFetch` for simple public pages.

## Skill · Scraper Builder
Designs a scraper, handles pagination and extraction logic, validates outputs, and creates
analytics-ready datasets for market intelligence, competitor monitoring, and research workflows.

**Exact trigger prompt**
```
/scraper-builder Build a production-ready financial intelligence scraper that collects competitor
pricing, product launches, and market signals from multiple websites, then structures the data
into a clean [analytics-ready dataset].
```

**Trading use cases.** Populate the kit's **SPEC data connectors** with real data, emitting the
exact schemas they define:
- **news / sentiment** → `connectors/custom/news-sentiment.md`
- **fundamentals** (WGC / Silver Institute supply-demand, central-bank demand) → `connectors/custom/fundamentals.md`
- **economic calendar** → `connectors/custom/economic-calendar.md`
- **market intelligence** — competitor/broker pricing, product launches, market signals.

→ kit: `scraper-builder` builds the feed; `data-validate` audits the output before publish; the feed
then serves `sentiment`, `news-window`, `market-brief`, and the **data-pipeline-refresh** workflow.

## Politeness, ToS & security
Respect robots.txt, each site's Terms of Service, and rate limits; cache and back off. **Prefer
official APIs/feeds where they exist** (FRED, CFTC are APIs — don't scrape them). No logins,
paywalls, gated pages, or personal data. Any keys are read-only in a secrets-manager.

## When to use the plugin vs the local skill + Nimble
Use **Bright Data** for large-scale, hardened, managed scraping (rotating proxies, anti-bot); use
the kit's **`scraper-builder` + Nimble MCP** for lighter, in-environment extraction that drops
straight into the connector schemas.
