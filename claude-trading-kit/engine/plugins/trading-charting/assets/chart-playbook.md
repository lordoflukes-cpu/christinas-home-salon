# Chart Playbook (discretionary, parity with the bot)

A one-page read to run by hand before any discretionary trade. It mirrors the bot's coded
rules so you and the bot agree on what a setup is. Pair with the `chart-playbook` skill.

## Load
- `ts_trend_indicator.pine` (EMAs, ATR stop, regime shading).
- Optional: `ts_screener.pine` across your watchlist to pick the candidate.

## Checklist
1. **Trend** — EMA(20) vs EMA(50): with-trend only. Flat = no setup.
2. **Regime** — green+volatile = press; green+quiet = normal; sideways = stand aside/shrink.
3. **Entry/structure** — entering with the trend near structure, not chasing mid-range.
4. **Stop** — the dashed ATR line (2×ATR). This is your 1R.
5. **Size** — run `risk-check`: ≤0.5% of equity at that stop. Note the account track
   (spreadbet/cfd).
6. **Intermarket (metals)** — DXY / real-yield direction; gold-silver ratio confirming?
7. **News** — not inside ±2 min of a high-impact release.

## Decision
- All green → take it, at the size risk-check gives.
- Any red → no trade (a "no" is a normal outcome).
- Log it with `trade-journal` (including adherence), win or lose.

> If your read disagrees with what the bot would do here, stop and reconcile — that gap is
> a bug in the rules, not a judgement call (parity, docs/06).
