# Connector · Live monitor (partial — gold-bot FastAPI in engine)

**Purpose.** A real-time dashboard + control surface: snapshot (prices, ratio, macro, news-window,
positions/PnL), the kill-switch, and the alert feed.

**Status.** Partial. The vendored gold-bot ships a FastAPI + WebSocket monitor at
`engine/vendor/gold-bot/app/main.py` (dashboard, `/api/snapshot`, `/api/kill-switch`, `/ws`). Wrap
it as an MCP / point the kit's services at it for a unified live view.

**Auth.** None for local; behind auth + HTTPS if hosted (docs/08).

**Tools to expose (MCP wrapper over the FastAPI endpoints).**
- `snapshot()` → `{prices, gold_silver_ratio, macro, news_window, positions, pnl, uptime_sec}` (GET `/api/snapshot`).
- `kill_switch(on)` → `{kill_switch}` (POST `/api/kill-switch`).
- `paper_state()` → paper account/positions; `recent_alerts()` → recent alert feed.

**Notes.** For 24/7 cross-device use, host it (Vercel/VPS) behind auth + HTTPS and surface key
state via Telegram too. Keep it read-only except the kill-switch; rate-limit the kill-switch POST.

**Use cases.** At-a-glance health on any device; one-tap halt; feeds `/status`, `health-review`,
the incident-response workflow.
