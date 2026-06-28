---
name: prop-firm-check
description: Validate a strategy's parameters and risk against a funded/prop-firm rulebook (FTMO / FundedNext style) — daily-loss, max-drawdown, profit target, news/holding rules — and flag any breach risk before you take a challenge. Use when sizing for a funded account or checking prop-firm compliance.
---

# Prop-Firm Check

Funded-account rules dictate the strategy. The drawdown limits are strict; size for them or blow
the evaluation. (The fee is the only thing you should risk.)

## Procedure
1. Capture the firm's rules: **max daily loss** (e.g. 5%), **max overall drawdown** (e.g. 10%,
   static vs trailing), **profit target** (e.g. 10% then 5%), **min trading days**, news/weekend/
   holding restrictions, and whether EAs/automation are allowed.
2. Pull the strategy's risk profile (`risk-check` defaults + `monte-carlo` p95 drawdown +
   typical daily loss from `trade-journal`/backtest).
3. **Stress against the rules**:
   - Could a normal losing day breach the **daily** limit? (Worst day vs limit.) Confirm
     whether the daily limit resets off **balance or equity at day start** — intraday equity
     limits bite harder.
   - Could the `monte-carlo` p95 drawdown breach the **overall** limit? If yes → reduce
     risk-per-trade. For a **trailing** max-DD that follows your equity high-water mark, an
     early run-up *raises the floor* — a normal pullback after a good start can breach it, so
     stress the drawdown from the peak, not from the starting balance.
   - Does the strategy trade through news / hold over weekends in ways the firm bans?
4. Recommend a **rule-compliant risk-per-trade** (often well below your own-capital size — that
   conservatism is good anyway) and any behaviour changes (news-window enforcement, max
   concurrent risk).
5. Note: verify the firm's current rules **and payout history** before paying (the industry
   changes; see the roadmap's MyForexFunds caution).

## Output
```
RULES: dailyLoss <…> maxDD <…> target <…> news <…> EA <yes/no>
RISK FIT: dailyLoss <ok/breach-risk> · maxDD vs p95 <ok/breach-risk>
RECOMMEND: risk/trade <…>%, <behaviour changes>   VERDICT: <compliant / adjust first>
```

## Manual vs bot
- **Manual**: set conservative manual sizing for the challenge.
- **Bot**: configure the risk layer + news-window to the firm's rules before running the evaluation.
