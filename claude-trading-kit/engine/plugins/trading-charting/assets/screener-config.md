# Screener Config (TradingView built-in)

A starting filter to surface trend candidates consistent with the strategy. Adjust the
universe and thresholds to taste; keep the logic in parity with what the bot trades.

## Universe
- Metals: XAUUSD, XAGUSD (+ XPTUSD, XPDUSD optionally).
- Diversifiers (trend-friendly): major FX (EURUSD, GBPUSD, USDJPY), indices (US500, US100).
- Or a custom watchlist.

## Filters (trend + tradeable)
| Field | Operator | Value | Why |
|---|---|---|---|
| EMA(20) | Greater than | EMA(50) | uptrend (use "Less than" for shorts) |
| Average True Range (14) / Price | Greater than | 1% | volatile enough to trend (skip dead ranges) |
| Average Volume (where applicable) | Greater than | universe median | liquidity |

(For shorts, mirror the EMA condition.)

## Timeframe
Match your trading timeframe — H4 or Daily for this trend system.

## Use
- Run the screen, take the hits to the **chart-playbook** for a discretionary read.
- Or (bot) use the hits as a pre-filter for which symbols to arm `ts_trend_strategy`.
- The Pine alternative is `pine/ts_screener.pine` (a +1/0/−1 flag with a "tradeable" dot)
  added across symbols.

> Note: TradingView's built-in screener field set varies by plan/market. If a field isn't
> available, approximate with the Pine screener instead.
