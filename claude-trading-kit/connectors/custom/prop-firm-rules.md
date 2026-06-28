# Connector · Prop-firm rules (SPEC)

**Purpose.** Encode funded/prop-firm rulebooks (FTMO / FundedNext style) so `prop-firm-check` and
the `prop-firm-strategist` can validate a strategy against the exact limits.

**Status.** SPEC. A small structured rules store (JSON/YAML per firm) + a lookup tool; rules are
mostly static, updated when firms change terms.

**Auth.** None — transcribe each firm's official rulebook / FAQ (e.g. FTMO and FundedNext
"trading objectives / rules" pages) into the store by hand; periodic verification, no scraping of
gated pages.

**Shape (per firm).**
```
{ firm, daily_loss_pct, max_drawdown_pct, drawdown_type: static|trailing,
  profit_targets: [..], min_trading_days, news_rule, weekend_holding, ea_allowed,
  profit_split, fees, payout_history_verified: bool, as_of }
```

**Tools.** `rules(firm)` → the rulebook; `firms()` → list.

**Critical.** **Verify current rules AND payout history before paying any fee** — the industry
changes and firms have shut down (MyForexFunds caution in the roadmap). Mark `as_of` and re-check.

**Use cases.** `prop-firm-check`, `prop-firm-strategist`, configuring the bridge risk-gate to a
firm's limits.
