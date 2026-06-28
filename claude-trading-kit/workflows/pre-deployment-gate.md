# Workflow · Pre-deployment gate

**Purpose.** The single GO / NO-GO checkpoint a strategy must clear before it touches real money —
one place that aggregates validation, risk, ops, and account-rule checks so nothing ships on a
hunch.

**Trigger.** A strategy has passed validation and you intend to move paper → live (or raise size).

**Steps (validation → risk → ops → rules → verdict).**
1. **Validation recap** — `walk-forward` WFE, `monte-carlo` drawdown band, `parameter_plateau`,
   and `deflated-sharpe` (with the honest trial count). Any red ⇒ stop.
2. **Risk config** — `pre-trade-checklist` + `risk-check`: ATR sizing sane, per-trade/daily/total
   limits set, correlation/aggregate exposure within budget, kill-switch reachable.
3. **Ops readiness** — `deploy-check`: secrets present (not committed), HMAC on the webhook,
   idempotency on order ids, reconcile clean on paper, alerts/Telegram allow-list working.
4. **Account rules** — `prop-firm-check` (if prop) or spread-bet/tax track constraints; confirm
   the strategy can't breach a daily-loss / max-drawdown rule at the configured size.
5. **Verdict** — `quant-validator` + `devops-trader` sign off; one explicit GO/NO-GO with the
   start size and the first review date.

**Tools/agents.** backtest-engine MCP, execution + bridge-control MCP, quant-validator,
risk-manager, devops-trader, prop-firm-strategist.

**Output.** A signed checklist (each line green/amber/red), the approved start size, and the
review date — or a NO-GO with the blocking items. Default to NO-GO if any critical line is unmet.

**Status.** Runnable (paper engine + running bridge/execution).
