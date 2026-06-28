# Integration · Telegram (alerts + cross-device control)

Telegram is the primary **cross-device control surface** — it works identically on
phone, Mac, and Windows, so the user can monitor and intervene from anywhere.

## Outbound (alerts)

- Trade confirmations, risk-gate decisions, "setup ready" suggestions (manual flow),
  decay/regime warnings, feed/health anomalies, kill-switch state changes.
- Bot Token + chat id via secrets manager; console fallback when unset (stub).

## Inbound (control commands)

| Command | Effect |
|---|---|
| `/halt` | engage kill-switch — flatten all + block new orders (`flatten_all()` + flag) |
| `/flat` | close all positions, keep automation running |
| `/status` | positions, equity, risk used today, kill-switch, regime, next news event |
| `/size <…>` | run a risk-check and reply with the recommended size (manual aid) |

## Security (critical — this controls money)

- **Authorise the sender**: only an allow-listed chat/user id may issue control
  commands; reject everything else.
- Treat inbound text as **untrusted**: validate/parse strictly; never `eval`.
- Sensitive actions (halt/flat) are safe-by-design (they only *reduce* risk), but
  opening/scaling via Telegram must go through the same **risk-gate** as any order.
- Rate-limit; log every command. (docs/08)

## Manual + bot parity

- **Bot**: Telegram reports what the bot did and lets the user halt/flatten.
- **Manual**: Telegram delivers the bridge's *suggested action* (size/stop/gates) so the
  user can execute by hand on their platform, then `/status` and the journal close the loop.

## Stub

A console/echo notifier and a fake-update injector so the command loop is testable with
no Telegram credentials.

## Reuse note

Zapier (available in this environment) can bridge Telegram quickly for prototypes, but
the production path is a small dedicated bot for auth control.
