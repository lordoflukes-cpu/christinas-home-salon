# 06 · Manual vs Bot Parity

Manual (discretionary) and automated (bot) trading **share one spine** and diverge only
at the final execution step. This doc is the parity matrix every capability honours.

## The shared spine

```
signal (TradingView/Pine)  →  risk-gate (size, limits, news, kill)  →  [DIVERGE]  →  journal
```
Same signal source, same risk math, same journal. Only the middle of the last arrow
differs: **auto-order** (bot) vs **human-decides** (manual).

## Divergence point

| | Manual | Bot |
|---|---|---|
| After risk-gate | Telegram "**suggested action**": size, stop, gates ✅/❌ | place **idempotent order** at venue |
| Who acts | the user, on their platform | trading-execution |
| Speed | human | sub-second (bridge) |
| Override | inherent | kill-switch / `/halt` |

## Parity matrix (representative)

| Capability | Manual use | Bot use |
|---|---|---|
| risk-check | size a discretionary trade before you click | auto-size inside the risk-gate |
| regime | decide whether to trade by hand today | filter/scale bot exposure |
| pine-alert | alert pings you to look at the chart | alert drives the order |
| chart-playbook | discretionary read checklist | the rules the bot encodes (kept in sync) |
| news-window | "don't trade now" reminder | bot blocks new entries automatically |
| trade-journal | log a hand trade + adherence | auto-log bot fills + adherence |
| health-review | review your own trading | review the bot's behaviour |
| /halt /flat | you stop yourself / flatten by hand | stop the bot / flatten positions |
| backtest | validate a discretionary idea | validate a bot strategy |

## Design rule

When building any capability: **write both columns**. If a feature only makes sense for
one side, say why explicitly. Keep the manual chart-playbook and the bot's coded rules
**in sync** — divergence between them is a bug (the human and the bot should agree on the
setup, even if only one pulls the trigger).

## Why this matters for the user

The user trades on phone/Mac/Windows and wants both modes. Parity means they can start a
setup manually and hand it to the bot (or vice-versa) without changing tools, risk rules,
or records.
