# ADR 0004 — Manual + bot parity is a first-class constraint

**Status:** Accepted

**Context.** The user trades **both** discretionarily and via bots and wants the suite to
serve both. Building two parallel stacks would duplicate risk logic and drift.

**Decision.** Manual and bot **share one spine** — signal → risk-gate → journal — and
diverge only at the final step (Telegram *suggestion* vs auto-order). Every capability must
document **both** a manual and a bot use; the manual chart-playbook and the bot's coded
rules are kept **in sync**.

**Consequences.** Risk logic is written once and reused. Slightly more design effort per
feature (two columns). Prevents the common failure where the bot and the human disagree on
what a valid setup is. Enforced in CLAUDE.md and docs/06.
