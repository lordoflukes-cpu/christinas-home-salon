# ADR 0006 — Dual venue / dual tax track (VT Markets CFD + UK spread-bet)

**Status:** Accepted

**Context.** VT Markets is a **CFD** broker → UK-**taxable** (CGT). UK **spread betting** is
**tax-free** but you can't offset losses. The user wants both: VT Markets for instrument/EA
flexibility, and a tax-free spread-bet track for own-capital trading.

**Decision.** Support **both venues behind one execution interface** (ADR 0003 /
execution-abstraction). Spread-bet track via a UK broker with an API — **IG** (REST/streaming,
spread-bet accounts, FCA-regulated) is the lead. Tag every fill `account_track: cfd |
spreadbet`; the `tax-uk` skill keeps **separate records** per track.

**Consequences.** More surface (two backends, two sizing models — lots/units vs stake/point,
two tax ledgers) but preserves the tax-free edge alongside CFD flexibility. Strategy→track
guidance lives in docs/07. If IG proves unsuitable, a new ADR records the alternative.
