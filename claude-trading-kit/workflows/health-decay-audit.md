# Workflow · Health / decay audit

**Purpose.** A periodic keep-trading / de-risk / retire decision across performance decay, regime
fit, and operations.

**Trigger.** Monthly (fast pulse) + quarterly (deep), or after a drawdown.

**Steps.**
1. `decay-scan` — rolling expectancy, payoff compression, drawdown vs `monte-carlo` band,
   behaviour drift, live-vs-backtest slippage.
2. `regime` — has the market been hostile (explaining weakness without true decay)?
3. Ops — `reconcile` clean? kill-switch/alerts working? (incident-response if not.)
4. `health-review` — run the §16 monthly/quarterly scorecard → verdict.
5. On confirmed decay: the response ladder — **de-risk first**, then re-validate
   (`walk-forward`), then re-optimize/retire (only on schedule).

**Tools/agents.** decay-scan, health-review, walk-forward; backtest-engine MCP; risk-manager.

**Output.** Scorecard (green/amber/red per line) + keep/de-risk/retire decision + the one next
action. Never jump straight to rewriting the signal.

**Status.** Runnable.
