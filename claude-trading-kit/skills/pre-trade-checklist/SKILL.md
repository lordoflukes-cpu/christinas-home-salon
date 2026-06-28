---
name: pre-trade-checklist
description: Run a disciplined pre-trade gate before any discretionary entry — setup, regime, risk size, levels, news window, correlation, and plan-adherence — so you only take rule-compliant trades. Use right before placing a manual trade or when the user asks "should I take this".
---

# Pre-Trade Checklist (discipline gate)

The bot has this discipline by construction; this is the human's version. A "no" is a valid,
common, and profitable outcome.

## The checklist (all must pass)
1. **Setup valid?** With-trend, real signal — run `chart-playbook` / `explain-signal`. Flat/no
   edge → stop here.
2. **Regime ok?** `regime` says press/normal (not "stand aside / shrink")?
3. **Size within limits?** `risk-check` → ≤ 0.5–1% risk at an ATR stop; daily-loss/maxDD ok.
4. **Levels?** Entering near structure, not chasing mid-range; stop and target make sense.
5. **News window clear?** `news-window` not active (no entry ±2 min of high-impact data).
6. **Correlation?** `correlation-matrix` — not stacking a correlated bucket (gold+silver = one).
7. **Track chosen?** cfd vs spreadbet decided for tax (`tax-uk`).
8. **Plan adherence?** This trade is in your written plan — not revenge/FOMO. If you're
   overriding the plan, write down why (it goes in the journal).

## Output
```
CHECK: setup <✓/✗> · regime <✓/✗> · size <✓/✗> · levels <✓/✗> · news <✓/✗> · corr <✓/✗>
VERDICT: TAKE ✅ (size <units>, stop <px>, track <…>)  |  SKIP ❌ — <which gate failed>
```
On TAKE, log it with `trade-journal` (win or lose). On SKIP, that's discipline working.

## Manual vs bot
- **Manual**: this IS the discretionary decision process — run it every time.
- **Bot**: the encoded version is the bridge risk-gate; keep the human checklist in sync with it.
