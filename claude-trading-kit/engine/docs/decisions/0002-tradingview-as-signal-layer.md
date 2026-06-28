# ADR 0002 — TradingView is the signal/charting layer

**Status:** Accepted

**Context.** The user wants to use TradingView as much as possible, for both manual and
bot trading. TradingView excels at charts, Pine strategies/indicators, screeners, and a
Strategy Tester, and can emit **webhook alerts**.

**Decision.** Use TradingView for **signals/alerts (Pine→webhook), charting/manual
playbooks, screeners, and Strategy-Tester backtests (cross-checked vs the gold-bot
engine)**. All execution flows through our **bridge** (TradingView can't trade VT Markets
directly). A versioned **alert JSON contract** (`ts.alert.v1`) is the interface.

**Consequences.** One signal source for manual and bot (parity). Requires a paid
TradingView plan (webhooks/alert slots). Pine can't hold secrets → security rests on
bridge-side HMAC + idempotency + allow-listing (ADR 0007 not this; see docs/08).
TradingView Strategy-Tester results are **cross-checked**, never trusted over the
no-look-ahead engine.
