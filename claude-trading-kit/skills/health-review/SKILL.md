---
name: health-review
description: Run the periodic (monthly + quarterly) health-review scorecard covering performance decay, regime fit, and operational resilience, and produce a keep-trading / de-risk / retire decision. Use for a system review, monthly/quarterly check-in, "how is the bot/my trading doing", or after a drawdown.
---

# Health Review (the keep-running scorecard)

A single page to run against the live system (bot or your own trading). Decision rule: any
red on the monthly pulse → **de-risk first**, then investigate; confirmed structural decay on
the quarterly → re-optimize or retire. **Never** jump straight to rewriting the signal on a
red light. (Reference: `engine/vendor/gold-bot/ROADMAP.md` §16.)

## Monthly (fast pulse)
- [ ] Rolling expectancy ≥ baseline − tolerance; profit factor > 1.3.
- [ ] Drawdown inside the Monte-Carlo tolerance band (run `monte_carlo`; compare to p95).
- [ ] Behaviour (trade frequency, holding period, win rate) matches the tested profile.
- [ ] Live-vs-backtest slippage gap stable, not widening.
- [ ] Plan-adherence high; overrides logged and justified (measure separately from PnL).
- [ ] Kill-switch + reconciliation + alerts verified working.

## Quarterly (deep review)
- [ ] Re-run `walk_forward` + `cost_model` on recent data; edge still present.
- [ ] Re-fit on the scheduled rolling window — and ONLY on schedule (avoid meta-overfit).
- [ ] Re-verify broker costs, financing, margins, regulatory terms (per track).
- [ ] Correlation across instruments/time-scales — still diversified?
- [ ] Regime-mix review — has the market been hostile (`classify_regime`), and did the
      system adapt as designed?
- [ ] Counterparty check — broker/prop-firm health and payout history.

## Procedure
1. Gather the live stats for each line (ask for what's missing; don't guess).
2. Mark each ✅ / ⚠️ / ❌ with the actual number; use the MCP tools where they help.
3. Apply the decision rule → verdict + the single most important action.

## Output
```
MONTHLY: <n green / n total>   QUARTERLY: <n green / n total>
RED FLAGS: <list with numbers>
DECISION: keep trading ✅ | de-risk ⚠️ | retire/rotate ❌
NEXT ACTION: <one concrete step>
```

## Manual vs bot
- **Manual**: review your own discipline, expectancy, and adherence.
- **Bot**: review the bot's behaviour, decay signals, and operational health.
