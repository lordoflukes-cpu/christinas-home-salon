# Workflow · Weekly performance report

**Purpose.** A scheduled, honest performance review — what happened, why, and the one change worth
making — so the account is steered by evidence, not by the last trade's emotion.

**Trigger.** Weekly (and as a monthly/quarterly roll-up); also after any notable drawdown.

**Steps (gather → analyse → contextualise → report).**
1. **Gather** — `equity-report`: equity curve, return, max drawdown, Sharpe/Calmar, profit factor,
   expectancy-R, win rate, trade count, fees/slippage paid.
2. **Analyse** — `variance-analysis`: plan-vs-actual bridge (volume / win-rate / payoff / cost /
   sizing / mix) and attribution by instrument / strategy / session; best & worst trades; live-vs-
   backtest slippage; rule adherence (deviations from plan) via `journal-coach`. Audit the input
   ledger with `data-validate` if the numbers look off.
3. **Contextualise** — `regime` + `decay-scan`: was the week explained by market conditions, and
   is anything trending toward decay (separate variance from real degradation)?
4. **Report** — `report-writer` assembles a tight summary: numbers → what worked / didn't →
   one recommended action → watch-items for next week.

**Tools/agents.** equity-report, variance-analysis, decay-scan, data-validate skills; backtest-engine
MCP; report-writer, journal-coach.

**Output.** A shareable report (metrics table + attribution + one action) suitable for Sheets /
email. Distinguish luck from skill; avoid over-reacting to a single week.

**Status.** Runnable (engine metrics today; richer once live trade history is fed in).
