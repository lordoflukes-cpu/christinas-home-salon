---
name: post-mortem
description: Analyze a losing streak, a large drawdown, or a bad trade and separate process failures from variance — was the system followed, did the edge decay, or was it just normal bad luck? Use after a drawdown, a string of losses, or a painful trade.
---

# Post-Mortem

The goal is to learn the right lesson — not to over-react to variance or excuse a real problem.
Most drawdowns are normal; some signal a broken process or a decayed edge. Tell them apart.

## Procedure
1. Gather the facts: the trades (`trade-journal`), equity path, and the period's regime
   (`regime`) and events (`news-window`).
2. **Variance vs process** — is this drawdown within the `monte-carlo` tolerance band (p95)?
   If yes, it's likely normal — don't change the system.
3. **Process check** — `trade-journal` adherence: were the rules followed? Overrides, moved
   stops, revenge trades, skipped setups? Process failures are the priority fix, not the signal.
4. **Edge check** — run `decay-scan` / `walk-forward`: is the edge actually eroding, or just in a
   hostile regime it's designed to sit out?
5. **Cost/exec check** — did slippage/financing diverge from model (`cost-model`), or were there
   execution errors (`reconcile`)?
6. Diagnose the dominant cause and the single highest-leverage fix.

## Output
```
PERIOD: <dates>  drawdown <x%> (band p95 <y%> → <within/breach>)
CAUSE: variance | process (adherence) | decay | costs/exec
EVIDENCE: <1–2 lines each>
FIX: <one concrete change>   DO-NOT: <what NOT to change (avoid over-reacting to variance)>
```

## Manual vs bot
- **Manual**: an honest review of your own discipline and decisions.
- **Bot**: feed into `health-review`; a confirmed-decay verdict triggers the response ladder.
