# ADR 0001 — Reach VT Markets via MetaApi (default), MT5 self-host optional

**Status:** Accepted

**Context.** The user wants to trade on **VT Markets**, which has **no native REST API**
— it is an MT4/MT5 broker supporting user EAs. We need programmatic data + execution
across phone/Mac/Windows.

**Decision.** Default to **MetaApi cloud** (REST/WebSocket, free tier, MT4/MT5) connected
to the user's VT Markets MT login. Provide **self-hosted MT5 + Python** as an optional
**Windows-only** backend behind the execution interface. Never make MT5-self-host the
default.

**Consequences.** Cross-device by default; a third-party (MetaApi) dependency and its tier
limits; higher latency than co-located MT5 (acceptable — not HFT). Execution is behind the
venue-agnostic interface (ADR 0003 / execution-abstraction), so swapping backends is config.
