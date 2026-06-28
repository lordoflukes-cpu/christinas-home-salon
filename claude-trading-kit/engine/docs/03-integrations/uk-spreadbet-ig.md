# Integration · UK spread-bet (tax-free track) via IG

The second venue is a **UK spread-bet account** — profits are **tax-free** (no CGT, no
stamp duty) for a UK retail trader (you also can't offset losses). This is the
tax-advantaged track that runs in parallel with VT Markets (CFD).

## Why IG (lead candidate)

- **IG** offers a documented **REST + streaming (Lightstreamer) API**, supports
  **spread betting** accounts, and is **FCA-regulated** (FSCS protection). That makes it
  the strongest fit for an automated *and* manual tax-free track.
- Alternatives to evaluate if IG doesn't fit: Spreadex, CMC (limited API). Capture the
  decision in an ADR if we switch.

## Capabilities (target)

- Market data (prices, candles), account/positions, place/amend/close **spread bets**
  with a stake per point, working orders, and streaming updates.
- Map our venue-agnostic order (`risk_frac`, ATR stop) to IG's **stake-per-point** sizing
  — a per-venue sizing adapter lives in `trading-execution`.

## Auth & secrets

- IG API key + username/password + account id; session tokens (CST / X-SECURITY-TOKEN)
  or OAuth. Demo environment available for safe testing. Store via secrets manager. (docs/08)

## Tax

IG spread-bet = **tax-free**; tag fills `account_track: spreadbet`. The `tax-uk` skill
keeps the two tracks' records separate (spread-bet: no CGT; CFD: CGT + offsettable
losses). (docs/07)

## Constraints

- Leverage caps (FCA): gold 20:1, silver 10:1; negative-balance protection; 50%
  margin close-out for retail.
- Spread-bet sizing is **per-point**, not lots/units — the adapter must convert.
- Verify current API terms and rate limits before building; IG has demo creds for dev.

## Stub

Paper backend implementing the execution interface with per-point sizing, so the
tax-free track is testable without IG credentials.

## Sources
IG REST/streaming API docs; FCA retail leverage rules; HMRC spread-bet treatment
(BIM22015/CG56105) — see docs/07.
