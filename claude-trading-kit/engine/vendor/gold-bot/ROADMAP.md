# The Gold & Silver Trading Bot Roadmap: An Opinionated, Multi-Track Plan

> An educational roadmap for building a systematic gold/silver trading bot as a UK-based solo developer. This is not financial or tax advice — consult a qualified UK tax adviser on your specific circumstances.

## TL;DR

- **Start with a trend-following / momentum system on daily and 4-hour XAU/USD bars, sized by ATR volatility targeting at ~0.5–1% risk per trade, and run it in parallel on (A) a personal FCA-regulated spread-betting account (tax-free) and (B) an FTMO-style funded challenge.** This is the highest-survivability path for a solo builder; avoid scalping and "gold-silver ratio stat-arb" as your *first* strategy because the former is destroyed by costs/latency and the latter is only cointegrated under unstable, regime-dependent conditions.
- **Risk management — not signal alpha — is the single decisive survival factor.** Roughly 90% of retail algo traders fail to beat a simple index buy-and-hold in year one, and around 70% of UK leveraged-trading retail accounts lose money (per FCA-mandated broker disclosures; The Investors Centre, April 2026, states "Around 30% of UK retail spread betting and CFD clients are profitable in any given 12-month period — meaning approximately 70% lose money," with IG UK at 68% and Plus500 at 76%). Realistic surviving returns are ~8–15% annually, not the 50%+ vendors advertise. Budget 12–24 months to consistent profitability and ~$1,200–$6,000/year in running costs.
- **For a UK resident, spread betting on gold/silver is tax-free (no CGT, no stamp duty) for retail traders, while CFDs and futures are taxable** — this is a structural edge worth building your retail track around, with the caveat that you forfeit the ability to offset losses.
- **What makes it *succeed, stay profitable, and stay future-proof* is a separate question from "what strategy" — and it's the one that decides outcomes.** Sections 10–16 cover it: process/discipline over signal, the profitability mechanics that turn an edge into money, and the four future-proofing pillars (strategy-decay defense, regime adaptation, operational resilience, and surviving industry/regulatory/AI shifts), ending with a one-page health-review scorecard.

---

## Key Findings

1. **Best first strategy family: medium-frequency trend/momentum on gold, not scalping or pairs.** Gold is one of the strongest-trending liquid instruments available to retail traders, and trend-following degrades gracefully under realistic costs because it trades infrequently. Scalping XAU/USD is structurally hostile to retail: spreads, ~$30–75/lot/night carry, and execution slippage eat the thin edge. Gold-silver ratio stat-arb is intellectually attractive but the pair is only cointegrated under time-varying/regime-dependent models — a static hedge ratio will drift and bleed.

2. **Instrument choice is a tax-vs-cost tradeoff.** UK spread betting = tax-free but pays ongoing financing (IG raised its spot-metal overnight admin fee from 1.0% to 1.5% p.a. on 19 December 2025, on top of the tom-next spread). Futures (MGC micro gold) = cheapest per-trade (~$1.50–$2 round-turn, no overnight financing) but taxable and US-broker based. CFDs sit in between. For a bot that holds positions overnight/multi-day, the financing cost matters enormously.

3. **Funded ("prop") accounts are viable for algos but the rules dictate the strategy.** FTMO and FundedNext both explicitly allow EAs/automated trading, with 90% profit splits, but 5% daily / 10% max drawdown rules will blow up an undisciplined bot. Note FTMO completed its acquisition of OANDA Global Corporation from CVC on December 1, 2025 (announced Dec 2, 2025), after approvals from five regulators over roughly eight months.

4. **Backtesting self-deception is the main technical risk.** ~80% of strategies that look good in backtests fail live due to overfitting. Walk-forward analysis, out-of-sample holdout, Monte Carlo trade reshuffling, parameter-sensitivity plateaus, and realistic cost/slippage modeling are mandatory, not optional.

5. **A stack of FastAPI, Docker, schedulers, Render, and OANDA experience is genuinely well-matched** to a medium-frequency systematic bot. The OANDA v20 REST/streaming API + `oandapyV20` Python wrapper is a proven path; VectorBT (research) + a custom event-driven executor (live) is the recommended split.

---

## Details

### 1. Strategy Philosophy & Market Microstructure

**Why gold/silver specifically.** XAU/USD valuation is driven primarily by an inverse correlation to US real yields and the US dollar (DXY), with a roughly 70% inverse correlation to DXY over time. The intermarket "trinity" professionals watch is DXY, US Treasury yields (especially the 10-year and TIPS real yields), and risk sentiment. In risk-off panics, gold and the dollar can both rise (2008, COVID March 2020), so the DXY-gold inverse correlation is a tendency, not a law — it breaks during crises and central-bank-flow regimes.

**Sessions and liquidity.** Gold trades nearly 24 hours (Sun 23:00 to Fri 22:00 UK, with a daily ~1hr CME break). The London–New York overlap (roughly 12:00–17:00 UK / 13:00–17:00 GMT) is the highest-liquidity, tightest-spread window and the cleanest for systematic entries. The Asian session is lower-volume and more range-bound; it produces false breakouts that the London session resolves. CPI, FOMC, and NFP releases drive the largest moves and the worst slippage — many funded firms restrict trading in a 2-minute window around high-impact news.

**Strategy family comparison for a solo builder:**

| Family | Suitability (solo) | Win rate | Drawdown profile | Capital need | Survivability |
|---|---|---|---|---|---|
| **Trend-following** | High — recommended start | ~35–45% | Long shallow flat periods, occasional big wins | Moderate | High; degrades gracefully under cost |
| **Intraday momentum** | Medium-high | ~45–55% | Moderate, frequent | Moderate | Medium; session-dependent |
| **Breakout** | Medium | ~40–50% | Whipsaw-prone in ranges | Moderate | Medium |
| **Mean-reversion (intraday range)** | Medium | ~55–65% | Rare large losses (fat tails) | Moderate | Medium; dangerous in trends |
| **Scalping** | Low for retail algo | High % but tiny edge | Death by costs | High turnover | Low — costs/latency kill it |
| **Gold-silver ratio stat-arb** | Low as *first* project | ~55–65% | Spread can diverge for years | Higher (two legs) | Low-medium; regime-dependent cointegration |
| **Carry/macro** | Low (discretionary-leaning) | n/a | Tail-risk heavy | High | Medium |

**Opinionated recommendation:** Start with **trend/momentum on gold (XAU/USD) on H4 and daily bars**. Reasoning: (a) gold trends strongly and persistently; (b) low trade frequency means costs and slippage are survivable; (c) it maps directly onto the well-documented frameworks of Robert Carver (*Leveraged Trading*, *Advanced Futures Trading Strategies*) which are written precisely for UK retail leveraged traders; (d) it is robust to the kind of overfitting that kills high-frequency systems. Add silver later as a diversifying instrument, and treat gold-silver ratio pairs trading as a **Phase 3 experimental** track once you have infrastructure and discipline proven.

**On gold-silver cointegration (why it's Phase 3, not Phase 1):** the academic evidence is mixed. Constant-vector cointegration models (Escribano & Granger 1998; Ciner 2001) largely *fail* to detect a stable gold-silver relationship outside the Hunt-brothers silver bubble era. Only time-varying specifications find a relationship: quantile cointegrating regressions (Schweikert, *Journal of Banking & Finance*) and fractional cointegration (FCVAR, *Resources Policy* 2021) detect a nonlinear/state-dependent long-run link. A 2025 SSRN working paper (Mittal & Mittal) confirms long-term cointegration on 2015–2025 COMEX GC-SI and GLD-SLV data only when paired with a **Kalman-filter dynamic hedge ratio** plus ML regime filters — and even then results are author-reported, not peer-reviewed. The practical takeaway: a static OLS spread will drift; the QuantConnect practitioner consensus is that parameters need re-optimizing roughly every two weeks. The gold-silver ratio's own instability (around 66.9 in June 2026, with a 52-week range of ~43.3–93.3) underlines this.

### 2. Instruments & Accounts

**Spot CFDs / spread bets (IG, Pepperstone, OANDA):** ESMA/FCA cap retail leverage at 20:1 on gold (it is treated as a non-major) and 10:1 on silver/other commodities; 30:1 on major FX. Negative balance protection and a 50% margin close-out are mandatory for retail. Costs: gold spreads are very tight at the top brokers (Pepperstone Razor raw spread from ~0.1 plus $3.50/lot/side = $7 round-turn; IG from ~0.3 points, commission-free; OANDA from ~$0.19/oz), but **overnight financing** is the bot-killer for multi-day holds — a raw interbank benchmark (Afterprime, 5 Jun 2026) puts gold carry at roughly −$75.84/lot/night long and +$30/lot/night short (1 lot = 100oz), with broker admin markup added on top (Pepperstone marks up tom-next by up to 3% annualised; IG adds 1.5% p.a. post-Dec-2025).

**Futures (COMEX GC, MGC micro gold, SI, SIL micro silver):** MGC is 10 troy oz (1/10 of GC), $1.00/tick, maintenance margin ~$1,700 (initial ~$1,870 as of October 2025), all-in commission ~$1.50–$2.00 round-turn at AMP/Interactive Brokers (IBKR ~$0.25/side; AMP $0.60 + ~$0.70 exchange/clearing). No overnight financing (carry is in the basis). This is the **cheapest** venue per trade and the cleanest data, but it is taxable for a UK resident and requires a US-facing futures broker (IBKR is UK-accessible). Micro Silver (SIL) is 1,000 oz (1/5 of the 5,000oz SI), $1/tick.

**ETFs (GLD, SLV):** Unleveraged, simplest tax (within a stocks & shares ISA, gains are tax-free up to the £20k annual allowance), but no leverage and not suited to a leveraged bot. Useful for long-horizon research data.

**Prop / funded accounts (FTMO, FundedNext, The5ers):** You trade the firm's simulated capital after passing a paid evaluation. FTMO 2-Step: 10% then 5% profit targets, 5% maximum daily loss, 10% **static** maximum loss, accounts $10k–$200k (combined cap $400k), 90% profit split, entry fees from €155/$183 up to ~$1,080; EAs explicitly allowed; copy-trading and tick-scalping/latency arbitrage banned. FundedNext: scaling to higher ceilings (up to $4M cited), profit-share during the evaluation phase, 1- or 2-phase, typically 5% daily / 10% trailing drawdown. **Suitability for algos:** good — but the drawdown rules force conservative position sizing, which is exactly what you want anyway. The economic logic: risk ~€155–€500 in challenge fees instead of thousands of your own capital.

### 3. Data

**Free / cheap:** Dukascopy (free historical tick data for XAU/USD, XAG/USD via `dukascopy-node` or Tickstory — high quality, the de-facto retail standard); OANDA v20 API candles (server-side aggregated, good for prototyping; note live pricing differs from historical because the candle endpoint provides base-price-group data while live pricing is account-pricing-group specific); FRED (DXY via DTWEXBGS, 10-year yields via DGS10, TIPS real yields — free, authoritative); CFTC Commitments of Traders (COT) reports free weekly (Tuesday data, Friday release; also on Barchart/free tools).

**Paid:** Polygon, Tiingo, Twelve Data, Norgate (futures continuous contracts), CME DataMine for true exchange tick data.

**Data-quality discipline:** model spreads and slippage explicitly (don't backtest on mid prices); beware look-ahead bias (don't use a bar's close to trade at its open); beware survivorship bias (less relevant for single-instrument gold, critical for ETF baskets); the COT report is lagged (Tuesday positions released Friday) so never use it intra-week as if real-time.

**See the companion doc [MARKET-DRIVERS-AND-MONITORING.md](./MARKET-DRIVERS-AND-MONITORING.md)** for a deep dive on how gold and silver trade, what drives each metal, and a tiered live-monitoring design (WebSocket price feeds, FRED/COT/economic-calendar tiers, a news-window guard, and an intermarket panel).

### 4. Tech Stack (Opinionated)

- **Language/libs:** Python with pandas + numpy; polars if data volume grows; pandas-ta or TA-Lib for indicators (TA-Lib is faster but harder to install; pandas-ta is pure-Python and easier).
- **Backtesting research:** **VectorBT** (open-source) for fast vectorized parameter sweeps and robustness analysis — it can simulate millions of trades in under a second. Step up to VectorBT PRO if budget allows.
- **Event-driven validation/live:** **NautilusTrader** is the strongest open-source choice for research-to-live parity (same code in backtest and live) if you want institutional-grade execution modeling; **Backtrader** is simpler and has OANDA integration but is in maintenance mode. **QuantConnect/LEAN** is the most complete end-to-end managed option but ties you to its ecosystem and C# core. Note an arXiv study ("Implementation Risk in Portfolio Backtesting") found defects in several engines (Backtrader's `percabs` cost default could undercharge costs 100×; one NautilusTrader integration double-charged commissions; Zipline-Reloaded had a calendar bug) — always cross-check cost accounting across engines.
- **Live execution:** OANDA v20 REST + streaming via `oandapyV20` or `tpqoa`. For futures, IBKR API. Note OANDA does not publish an unlimited tick archive via API — capture the streaming feed in production for true tick history.
- **Infrastructure:** Reuse an existing Docker + scheduler + Render/FastAPI stack. For 24-hour gold markets, a low-latency VPS near the broker (London for FX/CFD) beats Render for live execution reliability; keep FastAPI/Telegram for monitoring, alerts, and a kill-switch dashboard.
- **AI/LLM role:** genuinely useful for *research acceleration* (literature, code generation, debugging, explaining signals) and *boilerplate*. Be realistic about ML for *alpha*: ML is more vulnerable to overfitting than rule-based systems, suffers under non-stationarity and multiple-testing inflation, and a high Sharpe from a many-feature ML model is more suspect than the same Sharpe from a simple rule. Use ML narrowly (signal filtering, regime detection, execution) inside a rules-based risk framework — not as a black-box price predictor.

### 5. Backtesting, Validation & Avoiding Self-Deception

- **In-sample / out-of-sample split:** optimize on the first ~70%, validate on a held-out ~30% you never touch until the end.
- **Walk-forward analysis:** the practitioner gold standard (Pardo) — rolling re-optimization on in-sample windows, tested on subsequent out-of-sample windows. Watch for "meta-overfitting" (tuning window sizes/fitness functions until WFA looks good).
- **Monte Carlo:** reshuffle trade order (1,000+ runs) to see the distribution of drawdowns and equity curves your sequence could have produced.
- **Parameter sensitivity:** robust parameters sit on a *plateau* — if 20 works but 18 and 22 collapse, it's overfit. Aim for similar performance across ±10%.
- **Multiple-testing problem:** the more strategies you test, the more likely the best is just lucky. Use the Deflated Sharpe Ratio (Bailey & López de Prado) and the Probability of Backtest Overfitting (CSCV) concepts.
- **Metrics:** Sharpe (risk-adjusted; >1 acceptable, >2 strong, >3 suspect of overfitting), Sortino (downside-only), Calmar (return/max drawdown; >2 good), max drawdown, profit factor (>1.5 profitable, >2 strong), expectancy, win rate vs reward:risk. Watch for the AQR-style red flag where an in-sample Sharpe of 1.2 collapses to −0.2 out-of-sample.
- **Forward/paper testing:** mandatory. Run live on a demo/sim account for weeks-to-months before real capital. The gap between paper and backtest reveals cost/slippage modeling errors.

### 6. Risk Management Architecture (the most important section)

- **Position sizing:** Use **volatility targeting / ATR-based sizing** as the core — size each position so a stop at N×ATR risks a fixed fraction of equity. This is Carver's approach and adapts naturally to gold's volatility regimes. Example (Pardo/Stridsman style): with a 4% volatility target, $20k equity, and an ATR of 7.2 points at $50/point, position size = 0.04 × 20000 / (50 × 7.2) ≈ 2 contracts.
- **Fixed fractional:** risk a constant 0.5–1% of equity per trade. For a beginner, **0.5% is wiser than the textbook 2%** — published backtests show 2% risk produced ~+95% return with ~−24.6% drawdown vs 5% producing +239% but a −61.5% drawdown that would psychologically destroy most traders.
- **Kelly / fractional Kelly:** full Kelly is too aggressive (catastrophic drawdowns, sensitive to estimation error). Use **quarter- to half-Kelly** — half-Kelly retains ~75% of the growth rate while cutting volatility ~50%. Never exceed ~2× Kelly (excess growth drops to zero) — that's the "crazy zone."
- **Stops/targets:** ATR-based stops, not fixed-pip (gold's volatility shifts). Always have a hard stop; never average into a losing breakout.
- **Max daily loss limit:** hard-code one (the funded-account 5% daily rule is a good discipline to adopt even on own capital).
- **Correlation risk:** gold and silver are positively correlated — don't double up unknowingly; treat combined metal exposure as one risk bucket.
- **Kill-switch / circuit-breaker:** mandatory automated halt on (a) daily loss breach, (b) max drawdown breach, (c) data-feed anomaly, (d) execution errors exceeding a threshold. Wire it to your Telegram/FastAPI dashboard.

### 7. Realistic Economics & Expectations

- **Failure rate:** ~90% of retail algo traders fail to beat index buy-and-hold in year one; ~80% of good-looking backtested strategies fail live; and around 70% of UK leveraged retail accounts lose money. IG UK discloses that "68% of retail investor accounts lose money when trading spread bets and CFDs with this provider"; Plus500 sits at 76% (down from 81%); and the FCA's own 2016 sample analysis found 82% of CFD clients lost money (FCA PS19/18). The FCA found the average CFD outcome was a loss of about £2,200 (2016 analysis) and £4,100 (2018), against an average client earning £15,000–£30,000/year.
- **Realistic returns:** 8–15% annually for surviving retail algo traders; experienced ones with proven systems perhaps 15–25%. Quant hedge funds with hundreds of PhDs average ~12–20%. Anyone advertising 50%+ consistently is selling something.
- **Capital for meaningful income:** at 10–15% annual return, generating even £15–20k/year of income needs £100k+ of risk capital — or the funded-account route, which is precisely why funded accounts are attractive for a skilled-but-undercapitalized builder.
- **Time to profitability:** budget 12–24 months of development, testing, and paper trading before consistent real profits.
- **Ongoing costs:** ~$1,200–$6,000/year (data, VPS, broker spreads/financing, challenge fees).
- **Scams to avoid:** signal-sellers, "guaranteed" EAs, get-rich bots, anything with cherry-picked equity curves and no out-of-sample/live track record, and "100% profit split / instant funding" prop firms with no payout history.

### 8. Phased Roadmap & Multiple Tracks

**Phase 0 — Foundation (Weeks 1–4).** Read Carver's *Leveraged Trading* (UK-specific, leveraged products) and *Systematic Trading*; set up Dukascopy + OANDA + FRED data pipelines; reproduce the existing OANDA bot backend. *Go/no-go: clean, gap-checked gold data flowing into a reproducible research notebook.*

**Phase 1 — Strategy research (Weeks 4–12).** Build 2–3 simple trend/momentum rules in VectorBT; in-sample/out-of-sample split; realistic cost+slippage. *Go/no-go: a strategy with out-of-sample Sharpe >0.7, profit factor >1.3, max drawdown tolerable, on a parameter plateau.*

**Phase 2 — Validation (Weeks 12–20).** Walk-forward + Monte Carlo + parameter sensitivity. Build the live executor (event-driven), kill-switch, and monitoring. *Go/no-go: walk-forward efficiency stable, drawdowns survivable in 1,000 Monte Carlo runs.*

**Phase 3 — Paper trading (Weeks 20–32).** Run live on demo for 8–12 weeks. *Go/no-go: live paper results within statistical tolerance of backtest expectancy; no infrastructure failures.*

**Then split into two tracks:**

- **Track A (Conservative — funded capital):** Take an FTMO/FundedNext challenge (entry from ~€155/$183). Run the validated bot against the evaluation rules. Risk only the fee. On passing both phases (10% then 5% targets at FTMO), trade firm capital up to $200k at a 90% split. Best for a skilled builder short on capital. *Success = pass challenge, first payout, consistent rule-compliant trading.*
- **Track B (Own capital — tax-optimized):** Open an FCA-regulated **spread-betting** account (IG or Pepperstone), start with small stakes (Pepperstone from £0.10/point on gold; IG minimum £0.50/point). Tax-free profits for a UK retail trader. Scale stake only as live results confirm the edge. *Success = positive expectancy net of costs over 100+ live trades, controlled drawdown.*
- **Track C (Experimental — Phase 3+):** Gold-silver ratio pairs trading with a **Kalman-filter dynamic hedge ratio** (not static OLS), and/or narrow ML regime filters. Only after A or B is stable. Treat as R&D with a small capital allocation, and stress-test transaction-cost erosion (classic pairs-trading excess returns have declined sharply and costs "often almost eliminate" them in recent samples).

### 9. UK Legal / Regulatory / Tax

- **Spread betting:** Tax-free for UK retail traders — no Capital Gains Tax, no stamp duty (HMRC treats it as gambling, per BIM22015/CG56105; CG56105 states "No assets are acquired or disposed of and no chargeable gains or allowable losses arise from spread betting"). You also cannot offset losses. This is the recommended retail vehicle. Caveat: BIM22017 confirms even a successful full-time spread bettor is not normally trading, but if it became your sole/primary professional income with professional infrastructure, HMRC *could* reclassify (rare, but real for very high-volume full-time traders).
- **CFDs:** Subject to CGT (18% or 24% depending on income band) above the £3,000 annual allowance (2025/26), but losses *can* be offset against gains and carried forward — useful in mixed years. Reported via Self Assessment.
- **Futures:** Taxable similarly to CFDs (CGT), and US-broker reporting under the Common Reporting Standard.
- **Regulatory:** Use FCA-regulated brokers for FSCS protection (up to £85,000). Retail leverage caps apply (20:1 gold, 10:1 silver). You can opt to "professional client" status for higher leverage but lose negative balance protection and FSCS-style retail safeguards — not recommended for a solo builder.

---

## What Makes It Successful, Profitable & Future-Proof

Sections 1–9 answered *what to build*. Sections 10–16 answer *what makes it last*. The honest summary up front: the strategy is the smallest part of the equation. Survival, disciplined execution, and an explicit plan for decay are what separate the ~30% of UK retail accounts that are profitable in a given year from the ~70% that lose. Treat everything below as first-class engineering, not afterthoughts.

### 10. The Success Equation — what actually decides the outcome

**Discipline beats signal.** The most consistent finding across both the practitioner literature and the failure data is that struggling traders rarely have a *strategy* problem — they have a *discipline* problem. A mediocre strategy executed consistently outperforms a brilliant strategy executed erratically, because the brilliant-but-abandoned strategy never realises its expectancy. For a bot this is a gift: code *is* discipline. The machine doesn't revenge-trade, doesn't widen a stop "just this once," and doesn't skip the setup that scares it. Your job is to make sure the *human* around the bot (you, overriding it) doesn't reintroduce the discretion the bot was built to remove.

**The priority ordering is survival → expectancy → compounding, in that order.** You cannot compound a blown account. So the first dollar of effort goes to *not dying* (risk limits, kill-switch, position sizing), the second to *having an edge* (positive expectancy net of costs), and only the third to *growing it* (compounding, capital efficiency). Most beginners invert this and optimise returns first; that is precisely why most beginners are in the 70%.

**The three-layer model: Signal → Risk → Monitoring.** Think of the system as three layers, and be deliberate about which one you touch when something goes wrong:

| Layer | Job | What you change when it misbehaves |
|---|---|---|
| **Signal** | Decide direction/entry/exit | Last resort — changing the signal is the highest-overfitting-risk action you can take |
| **Risk** | Decide size, stops, exposure caps | First responder — when performance degrades, *reduce risk* before touching the signal |
| **Monitoring** | Detect when behaviour drifts from the tested profile | Always-on — feeds the other two; never silent |

The key discipline, drawn directly from the alpha-decay literature: **when results deteriorate, adjust the risk layer first, because de-risking is safe and reversible, whereas rewriting the signal is how you overfit your way into a deeper hole.**

**Measure plan-adherence separately from PnL.** Track a metric that has nothing to do with profit: *did the bot (and you) follow the rules?* Trades taken vs trades the rules dictated, overrides made, stops moved. A profitable month with poor adherence is a warning, not a win — you got paid for breaking your own process, and that lesson compounds badly. A losing month with perfect adherence is often fine. Judge the process independently of the outcome.

### 11. Profitability Mechanics — turning an edge into money

An "edge" is just a positive **expectancy**: the average profit per trade, expressed in units of risk (R), after costs.

```
Expectancy (R) = (Win% × Avg Win in R) − (Loss% × Avg Loss in R)
```

Trend-following on gold typically wins ~35–45% of trades but with average winners several times the size of average losers, producing a small positive expectancy — often in the **0.2R–0.5R per trade** band that characterises durable retail systems. Note that a high win rate is *not* the goal; a 40%-win system with 3:1 payoff is far more robust than a 70%-win system with 1:2 payoff, because the latter dies the moment its win rate slips a few points.

**The return identity.** What actually lands in the account is roughly:

```
Return ≈ trade frequency × expectancy per trade (R) × risk-per-trade (% equity)
```

This is why **frequency matters as much as edge**: a 0.3R edge traded 8×/month compounds very differently from the same 0.3R edge traded once a month. It is also why H4+daily is a deliberate sweet spot — enough frequency to compound and to reach statistical significance within a year, but not so much that costs and slippage dominate (the scalping trap). Don't chase frequency by dropping to noisy timeframes; chase it by *diversifying across instruments and time-scales* (Section 13), which adds roughly-independent trades without degrading per-trade quality.

**Profit factor** is the companion check: gross profit ÷ gross loss. >1.0 is profitable; **>1.3 is the minimum to take live, >1.5 is healthy, >2.0 is strong** (and >3.0 on a retail single-instrument system is usually a red flag for overfitting, not genius).

**Compounding and capital efficiency.** Because position sizing is a percentage of equity (Section 6), wins enlarge the next stake automatically — but so do losses shrink it, which is the mechanism that keeps fixed-fractional sizing alive through drawdowns. The two levers that turn a modest edge into a meaningful income are (a) **capital** — and the funded-account route (Track A) is the rational way to access size without risking your own £100k+ — and (b) **fractional Kelly / vol targeting** to size as aggressively as is survivable but no more (quarter- to half-Kelly; see Section 6). 

**Cost drag is the silent killer of expectancy.** A 0.3R edge can be entirely erased by spread + financing + slippage if you hold multi-day on a spread-bet account (gold carry can run −$75/lot/night long; Section 2). Profitability is decided as much in the cost model as in the signal — which is why the single most common reason paper results beat live is an optimistic cost assumption. Model costs at the pessimistic end and re-check them quarterly.

**Profitability scorecard (out-of-sample / live targets):**

| Metric | Minimum to go live | Healthy | Suspicious-if-above |
|---|---|---|---|
| Expectancy per trade | ≥ 0.2R | 0.3–0.5R | > 1R (recheck costs/look-ahead) |
| Profit factor | > 1.3 | 1.5–2.0 | > 3.0 |
| Sharpe (annualised, oos) | > 0.7 | 1.0–2.0 | > 3.0 |
| Calmar (return ÷ maxDD) | > 0.5 | > 1.0 | > 3.0 |
| Max drawdown | survivable & < daily/maxDD limits | — | "too good" (suspect leakage) |
| Win rate vs payoff | consistent with backtest | — | win rate *and* payoff both high |

If a metric lands in the "suspicious" column, the default assumption is a bug or a leaked future — not that you've found free money.

### 12. Future-Proofing I — Strategy Decay & Non-Stationarity

**Every edge decays.** This is not pessimism; it's the base rate. Predictive signals in developed markets lose on the order of **5–10% of their effectiveness per year**, and faster under stress, as edges get crowded out (more participants running similar models on the same data), as market structure shifts, and through reflexive erosion (acting on a signal changes the very pattern it exploited). Plan for rotation and retirement, not permanence.

**Detect decay by watching the *distribution of outcomes*, not just the PnL line.** PnL is a lagging, noisy signal; by the time the equity curve clearly rolls over you've given back a lot. Instrument a **decay-detection dashboard** that watches:

- **Rolling expectancy / payoff-to-risk** — is the R-multiple per trade compressing over the last N trades vs the tested baseline?
- **Drawdown vs historical tolerance band** — is current drawdown outside the worst the strategy produced in 1,000 Monte Carlo reshuffles (Section 5)? Breach = de-risk and re-validate.
- **Behavioural drift** — is the bot trading *differently* than its tested profile (trade frequency, average holding period, win rate, entry timing)? Drift in behaviour often precedes drift in PnL.
- **Live-vs-backtest tracking error** — the gap between realised and modelled fills/slippage. A widening gap means your cost model (not necessarily your signal) is breaking.

**The response ladder (do these in order, not in panic):**

1. **De-risk first** — cut size, tighten exposure caps. Safe, reversible, buys time.
2. **Re-validate** — re-run walk-forward and the cost model on recent data. Is the edge gone, or is this a normal drawdown inside expectations?
3. **Re-optimize or retire** — only if validation confirms structural decay. Re-fit on a rolling window *or* rotate the strategy out. Never skip straight to step 3 on a few bad weeks — that's chasing.

**Retraining cadence.** For systems that re-fit parameters, a **rolling re-fit roughly quarterly** tends to track distribution shift well without thrashing. The discipline that matters is the inverse: **do not re-optimize too often.** Re-fitting after every drawdown is "meta-overfitting" — you end up fitting the window-selection and the fitness function to noise. Pick a cadence in advance and hold it; change the cadence itself only with the same rigour you'd change the strategy.

### 13. Future-Proofing II — Regime Adaptation & Robustness

Markets are non-stationary: they cycle through **regimes** that suit or punish trend-following. The most useful framing is a 2×2 of **direction (up / sideways / down) × volatility (quiet / volatile)**. Trend systems thrive in directional-volatile regimes and bleed in quiet-rangebound ones; mean-reversion is the mirror image. Gold layers its own macro regimes on top: real-yield-driven, DXY-driven, and risk-on/risk-off (recall gold and the dollar can rise *together* in a panic — Section 1).

**Detection toolkit (cheap and proven first, fancy later):**
- **Trend + volatility filters** — a combination of an EMA/ADX trend gauge with an ATR or Bollinger-bandwidth volatility gauge is the most reliable, lowest-overfitting regime classifier, and should be the default.
- **Hidden Markov Models (HMM)** — well-established for tagging latent regimes; a reasonable step up when the simple filter isn't discriminating enough.
- **Online changepoint detection** — for detecting *when* a regime breaks in near-real-time; the research frontier pairs slow-momentum with fast-reversion and learns the switch, but this is advanced and overfitting-prone — treat as Phase 3 R&D.

**Adapt, don't predict.** The goal of regime detection is not to forecast the next regime — it's to *switch, filter, or size* the existing system to the regime you're in now: stand aside (or shrink) in hostile regimes, press in favourable ones. This "adaptation is the edge" stance reliably reduces drawdowns and lengthens survival even when it doesn't raise headline return.

**Robustness is the single biggest future-proofing lever for a solo trend trader — and it comes from diversification, not cleverness:**
- **Parameter/time-scale ensembles** — instead of betting on one "best" lookback (the overfitting trap), run an **ensemble across several lookbacks** (e.g. fast/medium/slow) and average their signals. This reduces the variance of your parameter estimate, lowers turnover, and is far more robust to any single parameter decaying. A signal that only works at lookback 20 and collapses at 18 and 22 is not an edge; an ensemble that works across the whole neighbourhood is.
- **Instrument diversification** — add silver and other strongly-trending markets (other metals, major FX, indices) so you're collecting many roughly-independent trend bets rather than one. This raises frequency (Section 11) *and* smooths the equity curve, because trends in different markets fire at different times. It is the closest thing to a free lunch a trend follower gets.
- **Strategy diversification (later)** — a lightly-correlated mean-reversion or carry sleeve can offset trend's flat periods, but only once the core trend system is proven and operational.

### 14. Future-Proofing III — Operational Resilience

A profitable strategy with fragile operations is a time bomb. The canonical warning is **Knight Capital, which lost $440 million in 45 minutes** from a botched deployment with no effective kill-switch. Retail stakes are smaller but the failure modes are identical.

**The kill-switch is non-negotiable** (already required in Section 6). It must halt *all* trading immediately and automatically on: daily-loss breach, max-drawdown breach, data-feed anomaly, or execution errors above a threshold — and it must be triggerable manually from your phone in one tap. Wire it to the FastAPI/Telegram dashboard.

**Monitor operations, not just PnL.** Real-time KPIs with automated alerts:
- **Latency & throughput** of the data feed and order path.
- **Error rate** — rejected orders, API errors, reconnects.
- **Fill quality / realised-vs-modelled slippage** — the early-warning sign that your cost model (and thus your live expectancy) is drifting.
- **Position & PnL reconciliation** — does the broker's view of your positions match the bot's internal state? Mismatch = halt and investigate; a desynced position is how small bugs become large losses.

**Redundancy & failover.** Run the live executor on a **low-latency VPS near the broker** (London for FX/CFD), not on Render/home broadband. Use active-passive failover so a backup takes over in **30–60 seconds** on hardware/network failure; have backup connectivity. A missed exit during an outage can cost more than weeks of edge.

**No set-and-forget.** Automated does not mean unattended. The bots that survive have a human checking them daily and an explicit runbook for the predictable failures (broker outage, feed gap, rejected orders, a stuck position). Keep FastAPI/Telegram for at-a-glance health and alerts.

**Operational readiness checklist (all must be true before real capital):**
- [ ] Automated kill-switch on all four breach conditions, plus one-tap manual halt.
- [ ] Position/PnL reconciliation every cycle, with halt-on-mismatch.
- [ ] Alerts for feed latency, error-rate, and slippage drift.
- [ ] VPS near broker; active-passive failover tested by actually killing the primary.
- [ ] Idempotent order logic (a restart can't double-fill).
- [ ] A written runbook for the top 5 failure modes.

### 15. Future-Proofing IV — Industry, Regulatory & Technology Shifts

The bot must survive a moving landscape, not just a moving market.

**AI crowding and correlated failure.** As machine learning gets embedded deeper into retail and institutional signal generation, more participants train *similar* architectures on *similar* data — raising the probability of **correlated failures during stress** (everyone de-risks the same crowded signal at once). The defensive posture: keep ML in **filtering, regime detection, and execution**, inside a transparent rules-based risk framework — *never* as a black-box price predictor whose edge you can't explain. A high Sharpe from a many-feature ML model is more suspect than the same Sharpe from a simple rule, and it will crowd and decay faster.

**Regulation is tightening, and it's directional.** The FCA's *Mills Review* into the long-term impact of AI on retail financial services, and broader 2026 supervisory attention, point to stricter rules around marketing claims, performance disclosure, and AI use; leverage caps (20:1 gold, 10:1 silver) and financing terms also move (IG's overnight admin fee rose to 1.5% p.a. in Dec 2025). Build assuming costs and constraints ratchet *up*, not down, and keep your economics re-checkable.

**Diversify your counterparties and venues — not just your trades.** Single-broker, single-instrument, single-prop-firm setups are fragile to rule changes and shutdowns:
- **Brokers** — be able to run on more than one FCA-regulated broker.
- **Instruments** — keep a **migration path between spread-bet and MGC futures**: if financing or rules make multi-day spread-bet holds uneconomic, move the longer-horizon sleeve to futures (no overnight financing, ~$1.50–2 round-turn), accepting the tax tradeoff (Section 2).
- **Prop firms** — they permit EAs within drawdown/news rules, but the industry is volatile; **verify payout history before paying any challenge fee** (the MyForexFunds shutdown in Caveats is the cautionary tale). Don't concentrate your funded capital in one firm.

**Pre-plan the migrations.** Write down, now, the triggers that would move you between vehicles (e.g. "if spread-bet carry exceeds X% of expectancy, migrate the multi-day sleeve to MGC"). Deciding under pressure is how good systems get abandoned.

### 16. The Health-Review Scorecard

A single page to run against the live bot — **monthly** for the fast signals, **quarterly** for the deep review. The bot keeps trading only while these stay green.

**Monthly (fast pulse):**
- [ ] Rolling expectancy ≥ baseline − tolerance; profit factor > 1.3.
- [ ] Drawdown inside the Monte-Carlo tolerance band (not a new worst-ever).
- [ ] Behaviour (frequency, holding period, win rate) matches the tested profile.
- [ ] Live-vs-backtest slippage gap stable, not widening.
- [ ] Plan-adherence high; overrides logged and justified.
- [ ] Kill-switch + reconciliation + alerts verified working.

**Quarterly (deep review):**
- [ ] Re-run walk-forward + cost model on recent data; edge still present.
- [ ] Re-fit on the scheduled rolling window (and *only* on schedule).
- [ ] Re-verify broker costs, financing, margins, and regulatory terms.
- [ ] Check correlation across instruments/time-scales — still diversified?
- [ ] Regime mix review — has the market been in a hostile regime, and did the bot adapt as designed?
- [ ] Counterparty check — broker/prop-firm health and payout history.

**Decision rule:** any red on the monthly pulse → **de-risk first**, then investigate (Section 12 ladder). Confirmed structural decay on the quarterly review → re-optimize or retire. Never go straight to rewriting the signal on a red light.

---

## Recommendations

1. **Build one thing first:** a gold (XAU/USD) trend/momentum bot on H4+daily bars, ATR-sized at 0.5% risk/trade, with a hard kill-switch. Don't start with scalping or stat-arb.
2. **Run dual-track from Phase 3:** funded challenge (Track A) for capital efficiency + small-stake FCA spread bet (Track B) for tax-free own-capital validation. The funded route is the rational way for a skilled, undercapitalized developer to access size.
3. **Spend 60% of your effort on validation and risk, not signal hunting.** The edge that kills you is overfitting, not lack of cleverness.
4. **Model costs ruthlessly:** for any multi-day hold, overnight financing dominates (gold carry can run −$75/lot/night long); consider MGC futures (no financing, ~$1.50–2 round-turn) if holds get long, accepting the tax tradeoff.
5. **Thresholds that change the plan:** advance phases only on the go/no-go gates above. If out-of-sample Sharpe <0.5 or walk-forward is unstable, *do not* go live — iterate or kill the strategy. If live paper trading diverges materially from backtest, your cost model is wrong — fix it before risking money.
6. **Diversify time-scales and instruments early.** An ensemble across lookbacks plus a basket of trending markets (silver, other metals/FX) is the highest-leverage robustness move a solo trend trader has — it raises frequency and smooths the curve at once (Section 13).
7. **Instrument a decay/regime/ops dashboard from day one,** not after the first blow-up. Watch the distribution of outcomes (not just PnL), and when it deteriorates, *de-risk before you rewrite the signal* (Sections 10, 12). Run the Section 16 scorecard monthly/quarterly.

## Caveats

- Several strategy win-rate/drawdown figures in the comparison table are typical-range generalizations, not guarantees for your specific system — your backtest is the authority.
- Broker spreads, financing rates, and futures margins change frequently — verify live before coding economics. IG's spot-metal overnight admin fee was raised to 1.5% p.a. on 19 December 2025; MGC margins change quarterly.
- Gold-silver cointegration is regime-dependent; do not assume a stable relationship, and budget for periodic re-estimation of any pairs hedge ratio.
- Prop-firm rules and the industry itself change. MyForexFunds (Traders Global Group Inc.) was shut down on 28–29 August 2023 when the CFTC filed suit and a federal judge signed a statutory restraining order (135,000+ customers, ~$310M in fees) — though a US federal judge later dismissed the CFTC case in May 2025 and sanctioned the regulator. Verify current rules and payout history before paying any challenge fee.
- **Alpha decay is inevitable, not a sign of failure.** Every edge erodes (~5–10%/yr, faster under crowding/stress); the plan must include rotation and retirement, not the assumption that today's strategy works forever. A system without a decay-detection and retirement plan is unfinished.
- Regime, decay, and operational metrics are estimates from limited live samples — they reduce risk of self-deception but don't eliminate it. Keep the human-in-the-loop and the kill-switch regardless of how green the dashboard looks.
- This is an educational roadmap, not financial or tax advice; consult a qualified UK tax adviser on your specific circumstances.
