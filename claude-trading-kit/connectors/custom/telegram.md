# Connector · Telegram (BUILT stub; real path documented)

**Purpose.** The cross-device control surface — push alerts out and receive `/halt /flat /status
/size` from your phone/Mac/Windows.

**Status.** BUILT as a console **stub** + real-bot path in
`engine/plugins/trading-execution/telegram/` (notifier + command handler). Set a token to go live.

**Auth.** Bot token from **@BotFather** (the official Telegram Bot API; core.telegram.org/bots/api).
Env: `EXEC_TELEGRAM_TOKEN`, `EXEC_TELEGRAM_CHAT_ID`, and `EXEC_TELEGRAM_ALLOWLIST` (chat-ids
permitted to issue commands). Token in a secrets-manager, never committed. If using webhooks (vs
long-poll), set a `secret_token` and verify the `X-Telegram-Bot-Api-Secret-Token` header on every
inbound POST.

**Outbound.** Trade confirmations, risk-gate decisions, "setup ready" suggestions (manual flow),
decay/regime/feed alerts, kill-switch changes.

**Inbound commands.** `/halt` (kill-switch + flatten), `/flat` (flatten), `/status` (positions/
equity/kill), `/size <equity> <atr>` (sizing). Handled by `telegram/commands.py` via the execution
service `/telegram-webhook`.

**Security (docs/08).** Only allow-listed senders may command; treat inbound text as untrusted;
sensitive opens still pass the risk-gate; rate-limit; log every command.

**Use cases.** Operate the bot from anywhere; receive manual "suggested action" alerts; emergency halt.
