# Glossary

**ATR (Average True Range)** — volatility measure; the kit sizes positions and sets stops in ATR
multiples so risk is constant across regimes.

**ATR position sizing** — units = (equity × risk_fraction) / (stop_distance × point_value), where
stop = stop_atr_mult × ATR. The one sizing formula shared by manual and bot paths.

**Bridge** — the service that receives TradingView webhooks and runs the pipeline: parse →
validate → HMAC auth → idempotency → risk-gate → route (auto/manual).

**Calmar ratio** — annualised return ÷ max drawdown. Favoured here because it punishes the
drawdown you must actually survive.

**CFD** — Contract for Difference (VT Markets track). Profits are CGT-taxable in the UK above the
annual allowance. Sized in lots.

**Client order id** — the idempotency key; a re-sent alert with the same id never double-fills.

**COT (Commitments of Traders)** — weekly CFTC positioning report (managed-money net). Lagged —
always treated as context, never a trigger.

**Deflated Sharpe (DSR)** — Sharpe adjusted for the number of strategies/params tried and for
non-normal returns (Bailey & López de Prado). The honest answer to "is this edge real or luck?".

**DXY** — US dollar index; a primary intermarket driver of gold/silver.

**Drift (behaviour drift)** — live trade behaviour diverging from the backtested rules; a
decay-scan signal.

**Edge** — a positive, repeatable expectancy after costs. Everything in the validation ladder
exists to confirm an edge is real before risking capital.

**Ensemble** — combining several decorrelated members (lookbacks/instruments) into one system; the
biggest robustness lever against parameter decay.

**Expectancy-R** — average profit/loss per trade expressed in units of initial risk (R).

**Flatten / kill-switch** — emergency stop: cancel/close everything and block new entries
(`/halt`, `/flat`, execution `flatten_all`, Telegram). Must always be reachable.

**GSR (gold-silver ratio)** — ounces of silver per ounce of gold; a relative-value gauge.

**HMAC-SHA256** — keyed signature over the canonical (sorted, compact, signature-excluded) webhook
body; authenticates every alert.

**Idempotency** — processing the same alert twice yields the same single result (no double order).

**IG spread-bet** — the UK spread-bet track; tax-free in the UK. Sized in stake-per-point.

**Kelly (fractional)** — edge-optimal sizing; the kit uses quarter–half Kelly with hard caps.

**Look-ahead bias** — using information not available at decision time; a backtest-invalidating
bug the reviewers hunt for.

**MetaApi** — cloud bridge to MT4/MT5 (VT Markets), preferred over self-hosting MT5 for
cross-device use.

**Monte-Carlo (trade reshuffle)** — randomising trade order to get a distribution of drawdowns/
returns, so you size for a survivable drawdown.

**News-window** — a blackout around high-impact releases (CPI/FOMC/NFP) during which new entries
are suppressed.

**Parameter plateau** — a broad region of parameter space that performs well; chosen over a lone
high spike (which is usually overfit).

**Parity (manual ↔ bot)** — manual and automated paths use the same signal logic and risk maths so
their decisions can't disagree.

**Pine** — TradingView's scripting language; the kit's Pine stays in parity with the engine and
emits ts.alert.v1.

**Reconciliation** — comparing the bot's internal positions to the broker's; any mismatch halts
trading.

**Regime** — market state (trend/range × quiet/volatile); decides whether a trend system presses,
shrinks, or stands aside.

**Repaint** — an indicator that changes past values after the fact; a source of fake backtest
edge.

**Risk-gate** — the bridge stage that sizes the order and enforces per-trade/daily/drawdown limits,
kill-switch, and news-window before routing.

**§11 scorecard** — the standard backtest report card: Sharpe, profit factor, expectancy-R,
Calmar, max drawdown, with a go/no-go.

**Sharpe ratio** — risk-adjusted return (excess return ÷ volatility); always deflated here before
it's trusted.

**Spread bet** — see IG spread-bet; tax-free in the UK.

**Stub-first** — everything ships runnable on simulated data/paper with no credentials.

**ts.alert.v1** — the versioned JSON contract for TradingView→bridge alerts; vendored and
drift-tested.

**Venue** — an execution destination (PaperVenue, VT Markets/MT5 via MetaApi, IG) behind one
`ExecutionVenue` interface.

**Walk-forward (WFE)** — rolling re-optimise in-sample → test out-of-sample; walk-forward
efficiency = OOS ÷ IS performance.
