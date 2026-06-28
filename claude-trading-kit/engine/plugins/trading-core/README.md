# trading-core

The risk-first foundation for **manual and automated** trading. Pairs with
`trading-research` (which provides the `backtest-engine` MCP the skills call).

## What's inside

**Skills** (`/trading-core:<name>`)
- `risk-check` — pre-trade ATR sizing + limit gate (PASS/BLOCK)
- `cost-model` — all-in cost (spread + commission + carry); CFD vs spread-bet
- `regime` — classify market regime → posture
- `trade-journal` — structured journaling with R-multiples + plan-adherence
- `health-review` — monthly/quarterly keep/de-risk/retire scorecard

**Agent** — `risk-manager` (adversarial veto on size/limits).

**Hooks** — non-blocking pre-order risk reminder + a session brief.

## Dependency

Declares a dependency on **`trading-research`** for the `backtest-engine` MCP tools
(`position_size`, `cost_model`, `classify_regime`, `monte_carlo`, …). The skills prefer those
tools and fall back to inline formulas, so core is still useful if research isn't installed.

## Install

```bash
/plugin marketplace add lordoflukes-cpu/trading-suite     # or a local path
/plugin install trading-research@trading-suite            # provides the MCP
/plugin install trading-core@trading-suite
```

## Manual + bot

Every skill documents both uses. The same risk-check that sizes your discretionary trade is
the risk-gate a bot runs before an order — one risk spine, two execution modes.

Educational only — not financial or tax advice.
