# Workflow · News-driven risk sweep

**Purpose.** When a high-impact event lands (or is imminent), re-check exposure fast and de-risk
*before* the move — turn a calendar/news signal into a concrete, bounded risk action.

**Trigger.** An economic-calendar high-impact item in the news window (CPI, FOMC, NFP, etc.) or a
breaking-news/sentiment spike on a held instrument.

**Steps (detect → assess → decide → act → log).**
1. **Detect** — economic-calendar / news-sentiment connector flags the event; the bridge
   news-window gate may already be suppressing new entries.
2. **Assess** — `positions` + `account` (execution): current exposure, distance to stops, and
   aggregate/correlated risk into the event (`correlation-matrix`).
3. **Decide** — `risk-check`: hold with existing stops, trim size, widen/tighten stops, or stand
   aside; respect the news-window policy (no fresh entries during the blackout).
4. **Act** — apply the smallest sufficient action (reduce/flatten the at-risk slice; the
   kill-switch / `flatten_all` stays one step away if it escalates).
5. **Log** — record the event, the decision, and the rationale for the post-mortem / journal.

**Tools/agents.** economic-calendar + news-sentiment connectors (SPEC), execution + bridge-control
MCP, risk-manager, news-sentiment-analyst.

**Output.** Pre-event exposure snapshot, the action taken (with reason), and a log entry. Bias
toward de-risking into uncertainty; never add risk just because volatility looks tempting.

**Status.** Runnable for the exposure/risk half (paper engine + bridge); the news/calendar trigger
sharpens once those connectors are wired.
