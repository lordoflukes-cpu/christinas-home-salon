# Workflows — deterministic multi-step / multi-agent pipelines

Workflows orchestrate skills + agents + connectors into a repeatable pipeline. Saved JS
workflows aren't plugin-packable, so these ship as **specs** you run by (a) following the steps
with the relevant skills/agents, or (b) encoding them in the Claude Code `Workflow` tool / a
script. Each doc gives: **trigger · steps · tools/agents · output · status**.

| Workflow | When to use | Status |
|---|---|---|
| idea-to-validate | turn an idea into a validated (or rejected) strategy | runnable (paper/engine) |
| nightly-research-brief | pre-session briefing each day | runnable (paper/engine) |
| walk-forward-validation | robustness check before going live | runnable (paper/engine) |
| multi-instrument-sweep | find which markets/params a strategy works on | runnable (paper/engine) |
| overfitting-tournament | generate many strategies, keep only survivors | runnable (paper/engine) |
| ensemble-builder | combine decorrelated members into one robust system | runnable (paper/engine) |
| health-decay-audit | periodic keep/de-risk/retire decision | runnable (paper/engine) |
| incident-response | on a kill-switch / outage / mismatch | runnable (paper/engine) |
| data-pipeline-refresh | refresh + gap-check market/macro data | partial (sim built) |
| pre-deployment-gate | the GO/NO-GO before live | runnable (paper/engine) |
| weekly-performance-report | scheduled performance report | runnable (paper/engine) |
| news-driven-risk-sweep | on a high-impact event, re-check exposure | runnable (paper/engine) |

All are **stub-first** (run on simulated data/engine with no creds); they get sharper as real
connectors are wired. Honesty + safety rules from the skills carry through (no look-ahead,
de-risk before rewriting signals, kill-switch always reachable).
