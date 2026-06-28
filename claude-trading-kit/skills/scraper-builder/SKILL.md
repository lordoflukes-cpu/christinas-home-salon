---
name: scraper-builder
description: Design a production-minded web scraper that collects trading-relevant data — news/sentiment, fundamentals, economic-calendar events, competitor/market signals — and structures it to match the kit's connector schemas. Use to build a data feed, monitor sources, or populate a SPEC connector with real data, using an available scraping MCP or fetch as the engine.
---

# Scraper Builder

Turn a target source into a clean, analytics-ready feed whose **output matches an existing kit
connector schema**, so the data drops straight into the pipeline. This is the trading-scoped,
portable version of the **Bright Data plugin's Scraper Builder**; use that plugin (or the live
**Nimble** MCP — `nimble_search`, `nimble_extract`, `nimble_crawl_run`) as the extraction engine.

## Build steps
1. **Target & fields** — name the source(s) and the exact fields needed; pick the matching kit
   schema to emit (don't invent a new shape):
   - news/sentiment → `connectors/custom/news-sentiment.md`:
     `news → {headline, source, url, published_at}`, `sentiment → {score, label, drivers, n_sources, freshness}`
   - fundamentals → `connectors/custom/fundamentals.md` (units: tonnes / Moz / deficit, `as_of`)
   - economic calendar → `connectors/custom/economic-calendar.md` (`{event, time, impact, actual, forecast, previous}`)
2. **Extract** — use the available engine: Nimble (`nimble_extract` for one page, `nimble_search`
   for discovery, `nimble_crawl_run` for many pages), Bright Data, or `WebFetch` for simple public
   pages. Handle pagination and JS-rendered pages (wait/render).
3. **Parse & normalize** — map raw HTML/JSON to the target schema; coerce types, parse timestamps to
   UTC, dedupe, and stamp `source` + `fetched_at` (provenance).
4. **Validate** — run `data-validate` on the output (dupes, impossible values, gaps) before publish.
5. **Schedule & politeness** — set a cadence; respect each site's robots.txt, Terms of Service, and
   rate limits; cache; back off on errors. Prefer official APIs/feeds where they exist.

## Output
A documented scraper spec + a normalized dataset matching the chosen connector schema, ready for the
`trading-data` layer / research / the news-window guard.

## Security & ethics
Scrape only what the source permits; no logins/paywalls/gated pages; keys (if any) read-only in a
secrets-manager. Don't scrape personal data. When an official API exists (FRED, CFTC), use it
instead of scraping.

## Manual vs bot
- **Manual**: stand up a one-off feed for a research question or a competitor/market-signal scan.
- **Bot**: a scheduled collector feeding the data pipeline; output validated before it's published.
