# 00 · Vision & Principles

## Why this exists

Trading outcomes are decided by **process, risk, and discipline** far more than by
signal cleverness. The goal of trading-suite is to encode that discipline into
reusable Claude capabilities — so that whether the user is trading **by hand** or
running a **bot**, the same risk gates, the same research rigour, and the same
journaling apply. We package it as an exportable marketplace so it travels and
can be shared.

## What success looks like

- A trader (the user) can, from **any device**, get a pre-trade risk check, a regime
  read, a backtest, a journal entry, and a kill-switch — manually or automated.
- A **TradingView** alert can drive either a *suggested* action (manual) or an
  *executed* order (bot) through the **same** validated, risk-gated path.
- Strategies can run on **VT Markets (CFD)** or a **UK spread-bet** account by config,
  not by rewrite — choosing the venue for **tax and cost**, not technical reasons.
- Nothing requires secrets to **demo**: every integration has a simulated stub.
- Every result is **honest**: no look-ahead, costs modelled pessimistically, verdicts
  un-massaged.

## Non-goals

- Not a "get-rich" bot or signal vendor. No promises of returns.
- Not a high-frequency / latency-arbitrage system (retail can't win that race).
- Not a black-box ML alpha generator — ML stays in filtering/regime/execution inside
  a transparent rules-based risk frame.
- Not tax or financial advice — we encode *record-keeping and classification helpers*,
  not advice.

## Principles (the same list CLAUDE.md enforces)

1. **Risk-first** — survival → expectancy → compounding. Kill-switch everywhere.
2. **Manual + bot parity** — every capability serves both; document both.
3. **Cross-device / cloud-first** — phone, Mac, Windows. No hard Windows-only default.
4. **Venue-abstracted execution** — VT Markets (CFD) + IG spread-bet behind one interface.
5. **TradingView-maximal** — Pine for signals/charts/screeners/Strategy-Tester first.
6. **Stub-first** — runs with zero credentials; real keys later.
7. **Honest validation** — no look-ahead; pessimistic costs; "too good" = bug signal.
8. **Security-by-default** — HMAC webhooks, idempotent orders, secrets hygiene.
9. **Best path, not fastest** — spec + ADR before code.

## The decisive trade-offs we accept

- **Slower, spec-led builds** over quick wins — because money-touching code that's
  wrong is worse than late.
- **Cloud dependencies** (MetaApi, a hosted bridge) over a Windows-only local stack —
  to stay cross-device.
- **Two tax tracks** (more surface) over one — because the tax-free spread-bet edge is
  worth keeping alongside VT Markets' instrument/EA flexibility.
