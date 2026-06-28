# Gold & Silver: How They Trade, What Moves Them, and How to Monitor It Live

> Companion reference to [ROADMAP.md](./ROADMAP.md). Section 1 (market
> microstructure) and Section 3 (data) of the roadmap introduce these topics;
> this document goes deep on **how the two metals trade, what drives each, and how
> to monitor all of it live with the right latency for each signal.** Educational
> only — not financial advice.

---

## TL;DR

- **Gold is a monetary metal; silver is a monetary metal *and* an industrial one.** ~90%+ of gold demand is investment/jewellery/central-bank and only ~5% industrial, whereas **~55–60% of silver demand is industrial** (solar PV, electronics, EVs). That single fact explains almost every behavioural difference between them.
- **Silver is the higher-beta, higher-volatility cousin** — smaller market, more speculative participation, larger percentage moves on the same macro news. It leverages gold in bull markets and falls harder in risk-off. The **gold-silver ratio** (~66–70 in mid-2026, down from >100 in 2025) is the single most useful relative gauge.
- **Their shared drivers are macro and slow** (real yields, the US dollar, inflation expectations, central-bank flows, positioning); **silver adds a fast, cyclical industrial layer** (solar demand, the 6th-consecutive-year supply deficit, "thrifting").
- **"As fast as possible" is a trap if taken literally.** For a medium-frequency H4/daily trend bot, only *price* and *risk events* need sub-second handling; the macro drivers update daily-to-weekly. The right design is **tiered latency** — match each signal's monitoring speed to how fast it actually changes, and reserve true low-latency (WebSocket, <100 ms) for price, execution, and the kill-switch.

---

## Part 1 — How Gold and Silver Actually Trade

### 1.1 The venues (same metal, very different wrappers)

| Venue | Gold | Silver | Notes |
|---|---|---|---|
| **Spot OTC** | XAU/USD (LBMA-centred) | XAG/USD | The interbank reference market; what spread bets/CFDs track. 100 oz = 1 "lot" gold. |
| **Futures** | COMEX GC (100 oz), **MGC micro (10 oz)** | COMEX SI (5,000 oz), **SIL micro (1,000 oz)** | Cheapest per-trade, no overnight financing, cleanest data; taxable for UK (roadmap §2). |
| **ETFs** | GLD, IAU | SLV, SIVR | Unleveraged; useful for flow signals and long-horizon data. |
| **Spread bet / CFD** | per-point gold | per-point silver | UK tax-free spread bet (roadmap §9); pays financing on multi-day holds. |

### 1.2 Sessions and liquidity

Both trade nearly 24 hours (Sun 23:00 → Fri 22:00 UK, ~1 hr CME break). Liquidity and spreads are best in the **London–New York overlap (~12:00–17:00 UK)** — the cleanest window for systematic entries. The **Asian session** is thinner and more range-bound, prone to false breakouts the London session later resolves. **Silver's liquidity is a fraction of gold's**, so its spreads widen more outside the overlap and it slips harder on news — a real cost consideration for a silver sleeve.

### 1.3 Who trades them (and why it matters for your signals)

- **Central banks** — structural, price-insensitive *gold* buyers; a major support pillar in 2024–2026. They don't trade silver. This is why gold has decoupled upward from real yields recently.
- **Miners / producers** — hedge forward; show up as "commercial" shorts in COT.
- **ETFs** — investment flows; inflows/outflows are a real-money sentiment gauge.
- **Managed money (hedge funds / CTAs)** — leveraged, trend-following speculators; the COT category most worth watching because it reflects the positioning your own trend system is part of.
- **Industrial buyers** — silver only; solar/electronics manufacturers, a price-inelastic-ish demand floor that gold lacks.
- **Retail** — proportionally larger in silver, amplifying its volatility.

### 1.4 Gold vs silver — the behavioural differences

| Dimension | Gold | Silver |
|---|---|---|
| Demand base | ~90% monetary/jewellery, ~5% industrial | **~55–60% industrial**, rest investment |
| Market size | Large, deep | ~1/10th; thinner, more speculative |
| Volatility / beta | Lower | **~1.5–2× gold's volatility**; "high-beta gold" |
| Bull markets | Steady | Tends to **outperform** (leverages gold) |
| Risk-off / recessions | Safe-haven bid | **Falls harder** (industrial demand fear) |
| Key extra driver | Central-bank flows | Industrial cycle + supply deficit |
| Nickname | "The monetary metal" | "Poor man's gold" / "gold on leverage" |

**Practical consequence:** silver is *not* just a smaller gold. Sizing a silver position the same as gold under-prices its volatility — size by ATR (roadmap §6) so silver's larger range automatically yields a smaller contract count. And because gold and silver are positively correlated, treat **combined metal exposure as one risk bucket** (roadmap §6) to avoid doubling up unknowingly.

### 1.5 The gold-silver ratio

The ratio (gold price ÷ silver price) is the headline relative-value gauge. It sat **above 100 in 2025** and **compressed to ~55–70 through 2026** as silver outperformed on industrial repricing (e.g. it dropped below 55 in a single week on the May 2026 US-China tariff truce — a textbook "industrial demand repricing, not safe-haven" move). Long-run median is ~50–80. The ratio **mean-reverts but only regime-dependently** — it can stay stretched for years — which is exactly why the roadmap files gold-silver ratio *pairs trading* as Phase-3 experimental (needs a dynamic Kalman hedge ratio, not a static line). As a **monitoring signal**, though, the ratio is excellent: extremes and fast moves flag when silver is doing "all the work" and when relative-value risk is building.

---

## Part 2 — What Drives Them (The Driver Map)

### 2.1 Shared macro drivers (gold-led, silver follows with leverage)

1. **Real yields (inflation-adjusted Treasury yields, i.e. TIPS).** The primary anchor. Gold pays no income, so real yields are its opportunity cost — **normally inverse**: real yields down → gold up. *Caveat for 2026:* the relationship has gone **asymmetric** — gold kept climbing even as real rates stayed high, driven by central-bank buying and de-dollarisation. So watch real yields, but don't treat the inverse correlation as a law.
2. **US dollar / DXY.** Gold is dollar-denominated, so a stronger dollar is the **most reliable short-term headwind** (~70% inverse tendency). A resuming DXY downtrend is a structural tailwind.
3. **Inflation expectations.** Break-evens and CPI surprises move both metals; silver, being industrial, also reacts to growth-linked inflation.
4. **Central-bank demand.** Structural *gold* support; silent but powerful, and the main reason gold decoupled from real yields.
5. **Risk sentiment / geopolitics.** Gold is the safe-haven; **but in acute panics gold and the dollar can rise together** (2008, March 2020), so the gold-DXY inverse breaks under stress. Silver usually does the opposite in panics — it sells off with risk assets.
6. **Positioning (COT managed money).** Crowded longs/shorts flag squeeze and reversal risk; lagged (see §3).

### 2.2 Silver-specific drivers (the fast, cyclical layer on top)

7. **Industrial demand (~55–60% of silver).** Solar PV is the swing factor — ~120–150 Moz/yr; global solar capacity still growing even as per-panel "thrifting" (thinner silver paste) cut PV silver use ~19% in 2026. Plus electronics, EVs, 5G.
8. **Structural supply deficit.** 2026 is the **sixth consecutive annual deficit** (~46 Moz). Silver is largely a **by-product** of other-metal mining, so supply is inelastic to price — higher prices don't quickly bring new metal. A persistent deficit leaves silver prone to **squeezes**.
9. **Growth / manufacturing cycle.** Silver trades partly like a base metal — PMIs, China data, and the rate cycle matter more for silver than for gold.
10. **Gold-silver ratio mean-reversion** — silver's relative cheapness/expensiveness vs gold.

### 2.3 Driver → signal reference table

| Driver | Gold | Silver | Direction | Where to get it | Update cadence |
|---|---|---|---|---|---|
| Real yield (10y TIPS / DGS10−breakeven) | ●●● | ●● | inverse (asymmetric '26) | FRED (DFII10, DGS10, T10YIE) | **Daily** |
| US dollar (DXY) | ●●● | ●● | inverse | FX feed / DTWEXBGS (FRED) | **Intraday / daily** |
| Inflation expectations / CPI surprise | ●● | ●● | positive | FRED T10YIE; economic calendar | Event + daily |
| Central-bank gold buying | ●●● | – | positive | World Gold Council (quarterly) | **Quarterly** |
| ETF flows (GLD/SLV holdings) | ●● | ●● | positive | issuer holdings / data vendors | **Daily** |
| Risk sentiment (VIX, S&P, DXY co-move) | ●● (haven) | ●● (risk) | mixed | FX/index feed, VIX | **Intraday** |
| COT managed-money net position | ●● | ●● | contrarian at extremes | CFTC (Tue data, Fri release) | **Weekly (lagged)** |
| Silver industrial / solar demand | – | ●●● | positive | Silver Institute (annual/surveys) | **Annual / periodic** |
| Silver supply deficit | – | ●●● | positive | Silver Institute, CME outlooks | **Annual / periodic** |
| Manufacturing cycle (PMIs, China) | ● | ●● | positive | economic calendar | Event |
| Gold-silver ratio | ●● | ●● | relative value | computed from your price feed | **Real-time** |

(● = strength of influence.)

---

## Part 3 — Monitoring It Live, As Fast As Possible

### 3.1 The key insight: match monitoring latency to *decision* latency

"As fast as possible" is only worth paying for where it changes a decision. For an **H4/daily trend bot**, the only things that genuinely need sub-second handling are **(a) price, (b) order execution, and (c) the kill-switch** — because those are what you act on in real time. The macro drivers (real yields, ETF flows, COT, central-bank data) change on a **daily-to-weekly** clock; streaming them at millisecond latency buys nothing. So design a **tiered system**: spend the engineering on the fast path, schedule the slow path.

| Tier | Signals | Latency target | Mechanism |
|---|---|---|---|
| **0 — Tick** | XAU/USD, XAG/USD price; your own positions/PnL | **<100 ms** | **WebSocket** push (not REST polling) |
| **1 — Intraday** | DXY, related FX, VIX/risk proxies, gold-silver ratio (computed) | seconds | WebSocket / short-poll, in-memory compute |
| **2 — Scheduled events** | CPI, FOMC, NFP, PMIs | known in advance | Economic-calendar API + a pre-event **news-window guard** |
| **3 — Daily** | Real yields (TIPS), break-evens, ETF holdings, DXY close | end-of-day | FRED + issuer/vendor pull, cron |
| **4 — Weekly / periodic** | COT positioning; central-bank & Silver-Institute data | weekly+ | CFTC pull (Fri); manual/periodic |

**Why push, not poll:** a WebSocket feed cuts price latency from the 3–5 s of REST polling to **under ~100 ms**, and removes rate-limit and missed-tick problems. Use REST only for slow, scheduled tiers.

### 3.2 Data sources / APIs (with realistic latency)

**Real-time price (Tier 0/1) — WebSocket:**
- **AllTick** — precious-metals WebSocket, ~170 ms average; covers gold/silver.
- **Twelve Data** — 2,000+ FX/metal pairs incl. XAU/XAG, real-time WebSocket + REST.
- **GoldAPI.io** — free real-time gold/silver spot REST (FOREX/SAXO/OANDA/IDC sources); fine for prototyping, REST-latency.
- **Financial Modeling Prep (FMP)** / **Finnhub** — WebSocket streaming for price and (US) news.
- **OANDA v20 streaming** — matches your existing OANDA stack; capture the stream in production (roadmap §3/§4) for true tick history.
- *(Enterprise, if you ever go intraday-fast:)* **Databento** — ~42 µs cross-connect / ~590 µs internet; overkill for a trend bot.

**Macro / driver data (Tier 3/4) — REST/scheduled:**
- **FRED** — authoritative & free: `DFII10` (10y TIPS real yield), `DGS10` (10y nominal), `T10YIE` (10y break-even inflation), `DTWEXBGS` (broad dollar). Daily.
- **CFTC Commitments of Traders** — gold/silver managed-money positioning; **Tuesday data released Friday** — never use intra-week as if real-time. Mirrors on Barchart/Myfxbook/metalcharts.
- **World Gold Council** — central-bank demand, gold flows (quarterly).
- **Silver Institute / CME precious-metals outlooks** — silver industrial demand, supply deficit (annual/periodic).
- **Economic-calendar API** (Investing.com, FMP economics, Trading Economics) — CPI/FOMC/NFP/PMI schedule + actual-vs-forecast at release.

### 3.3 Reference architecture (on your existing FastAPI + Telegram + VPS stack)

```
[WebSocket feeds: XAU, XAG, DXY] ─┐
[REST cron: FRED, COT, calendar] ─┼─► Ingestion ─► In-memory state store
                                  │                    │
                                  │            ┌───────┴────────┐
                                  │      [Rule / alert engine]  [Strategy / executor]
                                  │            │                    │
                                  └────────────┤                    ▼
                                               ▼              [Broker API + kill-switch]
                                    [Telegram alerts + FastAPI dashboard]
```

- **Ingestion**: one WebSocket client per fast feed with **heartbeat + auto-reconnect**; cron jobs for the daily/weekly tiers.
- **State store**: keep latest values in memory (e.g. a dict / Redis) so the rule engine and dashboard read instantly.
- **Rule/alert engine**: evaluates conditions each tick/cycle and fires to Telegram.
- **Dashboard**: FastAPI + WebSocket to the browser so the page updates without refresh (<100 ms), showing price, gold-silver ratio, DXY, yields, next calendar event, position/PnL, and feed health.
- **Reliability**: this is the same operational-resilience layer as roadmap §14 — VPS near the broker, active-passive failover (30–60 s), idempotent orders, reconciliation.

### 3.4 Alerts worth wiring (and the news-window guard)

- **Price moves** — % move over a window (e.g. >X% in 15 min), breakouts vs a moving average / prior range.
- **Volatility spike** — ATR or realised-vol jump; tighten risk or stand aside.
- **Gold-silver ratio extreme / fast move** — flags relative-value stress and "silver doing all the work."
- **Correlation break** — gold rising *with* DXY (panic regime) or decoupling from real yields; a regime-change tell (roadmap §13).
- **News-window guard** — from the economic calendar, automatically **block new entries (and widen risk assumptions) in the ±2-minute window around CPI/FOMC/NFP**; many funded firms require this anyway (roadmap §1). This is the single highest-value "live" rule for a metals bot.
- **Data-feed anomaly** — stale tick, frozen price, cross-feed disagreement → halt + alert (a kill-switch trigger, roadmap §6/§14).
- **Position/PnL reconciliation mismatch** — broker vs internal state diverges → halt.

### 3.5 Intermarket panel — the "trinity" plus silver's extras

Keep these on one screen, because metals are an intermarket trade, not a single-instrument one:
- **DXY** (dollar) and **10y nominal + 10y TIPS real yield** (the gold "trinity").
- **VIX / S&P** for risk-on vs risk-off (tells you whether silver should lead or lag).
- **Gold-silver ratio** for relative value.
- **COT managed-money** (weekly) for positioning extremes.
Watching these together is what lets you *recognise the regime* (roadmap §13) rather than just the price.

### 3.6 Honest caveats on speed

- **Speed ≠ edge for a trend bot.** Chasing millisecond macro data is wasted effort; your edge is in *direction and risk over hours-to-days*, not in reacting to a tick faster than an HFT (you can't win that race). Put the latency budget where decisions happen: price, execution, kill-switch.
- **The COT is lagged** (Tue→Fri); treating it as real-time is a classic error.
- **Correlations are regimes, not constants** — the gold-DXY-real-yield relationships break under stress and shifted structurally in 2024–2026 (central-bank buying). Monitor the *relationship*, and alert when it breaks.
- **Free feeds are fine to prototype, not to trade on.** Verify a production feed's uptime, reconnect behaviour, and that its "real-time" is actually streamed, before risking money on it.

---

## A Live-Monitoring Build Checklist

- [ ] WebSocket price feed for XAU/USD **and** XAG/USD, with heartbeat + auto-reconnect.
- [ ] In-memory state store; computed gold-silver ratio updated each tick.
- [ ] Intraday DXY + risk proxy (VIX/S&P) feed.
- [ ] Daily cron: FRED real yields/break-evens/dollar; ETF holdings.
- [ ] Weekly cron: CFTC COT (Friday) — flagged as lagged.
- [ ] Economic-calendar integration + automated **news-window entry guard** (±2 min around CPI/FOMC/NFP/PMI).
- [ ] Alert engine → Telegram: price %, volatility, ratio extreme, correlation break, feed anomaly, reconciliation mismatch.
- [ ] FastAPI WebSocket dashboard: price, ratio, DXY, yields, next event, position/PnL, feed health, one-tap kill-switch.
- [ ] VPS near broker; failover tested; idempotent orders (cross-ref roadmap §14).

---

## Sources

- World Gold Council — [Gold market commentary, Feb 2026](https://www.gold.org/goldhub/research/gold-market-commentary-february-2026); gold vs real yields ([MacroMicro](https://en.macromicro.me/charts/81733/Gold-Price-vs-US5-Year-Real-Yield), [LongtermTrends](https://www.longtermtrends.com/gold-vs-real-yields/)).
- J.P. Morgan Global Research — [Gold price predictions 2026](https://www.jpmorgan.com/insights/global-research/commodities/gold-prices), [silver 2026](https://www.jpmorgan.com/insights/global-research/commodities/silver-prices).
- Silver Institute — [World Silver Survey 2026 (PDF)](https://silverinstitute.org/wp-content/uploads/2026/04/World-Silver-Survey-2026.pdf); [sixth-consecutive deficit](https://silverinstitute.org/global-silver-investment-to-remain-strong-in-2026-against-the-backdrop-of-a-sixth-consecutive-annual-market-deficit/).
- Silver industrial/solar & deficit — [CME precious-metals outlook 2026](https://www.cmegroup.com/articles/2026/precious-metals-outlook-2026-market-dynamics-following-a-record-breaking-year.html), [pv-magazine: PV silver −19%](https://www.pv-magazine.com/2026/04/15/silver-demand-from-pv-industry-expected-to-drop-19-this-year/), [Saxo: silver's breakout year](https://www.home.saxo/content/articles/commodities/silvers-breakout-year-from-monetary-hedge-to-industrial-powerhouse-10122025).
- Gold-silver ratio — [GoldSilver: ratio at 69](https://goldsilver.com/industry-news/goldsilver-news/gold-silver-ratio-69-weekly-close/); gold/silver trading insights — [Deriv Traders' Academy](https://traders-academy.deriv.com/trading-guides/trading-gold-silver-2026-insights).
- COT positioning — [CFTC Commitments of Traders](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm), [Barchart COT](https://www.barchart.com/futures/commitment-of-traders), [Myfxbook XAU COT](https://www.myfxbook.com/commitments-of-traders/XAU).
- Real-time data/APIs — [AllTick](https://alltick.co/), [GoldAPI.io](https://www.goldapi.io/), [Twelve Data forex](https://twelvedata.com/forex), [FMP WebSocket](https://site.financialmodelingprep.com/datasets/websocket), [Finnhub WebSocket](https://finnhub.io/docs/api/websocket-trades), [Databento live](https://databento.com/live).
- Dashboard/WebSocket build — [FCSAPI: real-time dashboard 2026](https://fcsapi.com/blog/how-to-build-a-real-time-trading-dashboard-websocket-2026), [Streamlit + WebSocket forex dashboard](https://medium.com/data-science-collective/building-a-real-time-forex-dashboard-with-streamlit-and-websocket-56a14a985f42).
