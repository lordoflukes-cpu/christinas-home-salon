# Connector · News / sentiment — NewsAPI / RSS / X (SPEC)

**Purpose.** Headlines and social sentiment for an instrument → feeds the `sentiment` skill and
`news-sentiment-analyst` (Bigdata.com is the ENV alternative, already available).

**Status.** SPEC. A fetch+score step; or use the ENV **Bigdata.com** connector (sentiment/news) to
avoid building this.

**Auth.** Provider keys, read-only, in env: **NewsAPI** (newsapi.org `/v2/everything`), the
**X API v2** (`recent search`; paid tiers), or RSS feeds (no key). Keep keys in a secrets-manager;
respect each provider's rate limits and terms (X especially).

**Tools.** `news(instrument, since)` → list of `{headline, source, url, published_at}`;
`sentiment(instrument)` → `{score, label, drivers:[...], n_sources, freshness}` (net tone +
what's driving it + source recency).

**Discipline.** Sentiment is **context and a contrarian flag**, never a standalone signal;
extreme one-sided tone + crowded COT = squeeze risk. Always note source freshness.

**Use cases.** `sentiment`, `news-sentiment-analyst`, the nightly-research-brief and
news-driven-risk-sweep workflows.
