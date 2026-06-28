# Gold & Silver Trading Bot

A systematic, risk-first trading bot for gold (XAU/USD) and silver, built by a
UK-based solo developer.

See **[ROADMAP.md](./ROADMAP.md)** for the full opinionated, multi-track plan:
strategy selection, instruments/accounts, data sources, tech stack, backtesting
discipline, risk-management architecture, realistic economics, a phased
timeline, and UK tax/regulatory notes.

Sections 10–16 of the roadmap cover **what makes the bot successful, profitable,
and future-proof** — the success equation (process over signal), profitability
mechanics, and the four future-proofing pillars (strategy-decay defense, regime
adaptation, operational resilience, and surviving industry/regulatory/AI
shifts), plus a one-page health-review scorecard.

See **[MARKET-DRIVERS-AND-MONITORING.md](./MARKET-DRIVERS-AND-MONITORING.md)**
for a deep dive on **how gold and silver trade, what drives each of them, and how
to monitor it all live** — a tiered low-latency design (WebSocket price feeds, a
news-window guard, an intermarket panel) tuned to how fast each signal actually
moves.

## Live monitor (skeleton)

A runnable FastAPI + WebSocket monitor implementing Part 3 of the
[market-drivers doc](./MARKET-DRIVERS-AND-MONITORING.md): tiered feeds (Tier 0/1
real-time price, Tier 2 economic-calendar + news-window guard, Tier 3 FRED macro,
Tier 4 COT), an in-memory state store, a cooldown'd alert engine (→ Telegram or
console), a live dashboard, and a kill-switch. It runs **out of the box on
simulated data — no API keys** — with clearly marked stubs where real providers
plug in.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # optional; defaults work in simulated mode
./scripts/run.sh                # or: uvicorn app.main:app --reload
# open http://localhost:8000   ·   tests: pytest
```

To go live: set `USE_SIMULATED_FEED=false` and fill in `PRICE_WS_URL`/`PRICE_API_KEY`
(Twelve Data / AllTick / OANDA v20) and `FRED_API_KEY` in `.env`, then implement the
provider-specific subscribe/parse in `app/feeds/price_ws.py`.

```
app/
  main.py            FastAPI app, dashboard, /ws stream, kill-switch
  config.py          env-driven settings & thresholds
  state.py           in-memory state store (prices, macro, cot, guard, paper)
  bus.py             in-process pub/sub → dashboard fan-out
  indicators.py      pure helpers (ratio, % move, realized vol, EMA, ATR)
  sizing.py          ATR / volatility-targeting position sizing (shared)
  alerts/engine.py   rule engine (price move, feed-stale, ratio, news-guard, kill)
  alerts/notifier.py Telegram / console delivery
  feeds/             price_ws (T0/1), calendar (T2), macro (T3), cot (T4)
  strategy/trend.py  dual-EMA + ATR trend strategy (roadmap §1)
  backtest/          engine (no-lookahead), metrics (§11 scorecard), data, run CLI
  execution/         paper_broker + executor (research→live on the SAME strategy)
  dashboard.html     zero-dependency live dashboard
tests/               18 unit tests (indicators, alerts, sizing, metrics, backtest, broker)
```

### Backtest the strategy

```bash
python -m app.backtest.run                 # synthetic demo (plumbing only, not edge)
python -m app.backtest.run --csv bars.csv  # your OHLC: ts,open,high,low,close
```

Prints the §11 scorecard (Sharpe, profit factor, expectancy-R, Calmar, max DD…)
and a go/no-go verdict against the roadmap gates. The synthetic series is for
validating the pipeline — real research needs real Dukascopy/OANDA bars plus the
§5 walk-forward/robustness suite.

### Paper executor

Runs inside the live app (`EXEC_ENABLED=true`): it aggregates the price stream
into bars, runs the **same** strategy + ATR sizing as the backtest against a
simulated broker, and obeys the risk wiring — kill-switch flattens, news-window
guard blocks new entries, and a daily-loss breach auto-engages the kill-switch.
Paper equity/position/trades show on the dashboard.

## Status

Roadmap + research docs complete; live-monitor **skeleton** runnable. Strategy,
backtesting, and the broker/executor layer are not built yet.

## Disclaimer

This repository is educational. Nothing here is financial or tax advice.
Consult a qualified UK tax adviser on your specific circumstances. Trading
leveraged products carries a high risk of losing money.
