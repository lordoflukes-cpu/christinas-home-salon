# ADR 0007 — Cross-device, cloud-first by default

**Status:** Accepted

**Context.** The user works on **phone, Mac, and Windows desktop**. Some powerful options
(self-hosted MT5 + `MetaTrader5` Python) are **Windows-only** and can't run on Mac/phone.

**Decision.** The **default** path is **cloud-first and device-independent**: TradingView
(web/mobile), a **cloud-hosted bridge**, **MetaApi cloud**, **IG API**, and **Telegram**
control. Any Windows-only component (self-hosted MT5) is an **optional backend** selected by
config, never required for a core flow.

**Consequences.** The user can research, monitor, and operate (halt/flat/status) from any
device. Introduces cloud dependencies and hosting for the bridge (acceptable and necessary
for 24/7 + cross-device). Drives choices throughout (Telegram as control surface; bridge in
the cloud; MetaApi over MT5-self-host as default).
