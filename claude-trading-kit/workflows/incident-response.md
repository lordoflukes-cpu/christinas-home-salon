# Workflow · Incident response

**Purpose.** Contain and resolve a live incident — kill-switch trip, reconciliation mismatch,
broker outage, rejected/duplicate orders — safely and fast.

**Trigger.** Kill-switch engaged, a reconcile mismatch, an alert storm, or an outage.

**Steps (contain → assess → diagnose → fix → postmortem).**
1. **Contain** — engage the kill-switch (`flatten_all` / `/halt`) if exposure is uncertain.
2. **Assess** — `positions`, `account`, `reconcile` (execution) + bridge `recent_decisions` →
   true exposure vs what the bot believed.
3. **Diagnose** — `incident-responder` classifies: mismatch / outage / rejection / duplicate /
   data anomaly.
4. **Fix** — smallest safe action: reconcile to truth, re-place/cancel, fix config/limit; confirm
   `reconcile` clean before resuming.
5. **Postmortem** — what happened, root cause, fix, and the guardrail to prevent recurrence.

**Tools/agents.** execution MCP, bridge-control MCP, incident-responder, devops-trader.

**Output.** Current exposure, diagnosis, the fix applied, and a postmortem note. Never resume
while internal and venue positions disagree.

**Status.** Runnable against the engine (paper) + a running bridge/execution.
