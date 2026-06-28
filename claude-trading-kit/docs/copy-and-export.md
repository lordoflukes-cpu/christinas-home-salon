# Copy & export — the 3 ways to use this kit

The kit is a **browse-and-copy** folder. Take all of it or cherry-pick. Three usage modes, from
lightest to fullest.

## Mode A — drop skills/agents/commands/hooks into a project's `.claude/`
The top-level folders mirror Claude Code's `.claude/` convention, so they drop straight in.

```bash
# from your project root
mkdir -p .claude
cp -r /path/to/claude-trading-kit/skills    .claude/skills
cp -r /path/to/claude-trading-kit/agents    .claude/agents
cp -r /path/to/claude-trading-kit/commands  .claude/commands
cp -r /path/to/claude-trading-kit/hooks     .claude/hooks   # review hooks.json paths first
```
Cherry-pick instead by copying single `skills/<name>/` or `agents/<name>.md` files. Skills/agents
that don't call an MCP tool work immediately (pure reasoning playbooks). Engine-backed ones
(`backtest`, `walk-forward`, `deflated-sharpe`, `ensemble`, `replay`, …) need Mode C too.

## Mode B — add the connectors (MCP servers)
Merge the BUILT servers into your project `.mcp.json` (or `~/.claude.json`):

```bash
# inspect, then merge the "mcpServers" block from:
cat /path/to/claude-trading-kit/connectors/mcp.example.json
```
Replace `${KIT}` with the absolute path to this folder, and `python3` with your engine venv python
if needed (see Mode C). They run on **simulated data with no credentials**. ENV connectors
(GitHub, Supabase, Google, Crypto.com, Bigdata.com, …) are configured with their own auth; CUSTOM
broker/data connectors are SPECs in `connectors/custom/` — implement when you need real data/orders.

## Mode C — install the runnable engine (`engine/`)
`engine/` is the full tested marketplace (six plugins + vendored gold-bot + tests). This is what
makes the engine-backed skills actually run.

```bash
cd /path/to/claude-trading-kit/engine
python3 -m venv .venv && . .venv/bin/activate
pip install mcp fastapi uvicorn httpx pytest      # see engine/README.md for the pinned set
python -m pytest -q                                # sanity: tests should pass
```
Then point `mcp.example.json`'s `command` at `engine/.venv/bin/python`. To install as a Claude Code
plugin marketplace, use `engine/.claude-plugin/marketplace.json` via `/plugin`.

## Exporting / moving the kit
It's a self-contained folder — copy, zip, or commit it anywhere:
```bash
cp -r claude-trading-kit /destination/                # copy
tar czf claude-trading-kit.tar.gz claude-trading-kit  # archive
git -C claude-trading-kit init && git add -A && git commit -m "trading kit"   # version it
```
Nothing here contains secrets — credentials are always supplied via env/secrets-manager at the
destination, never stored in the kit. Review `hooks/hooks.json` and `mcp.example.json` paths after
moving, since they reference the kit's location.

## What needs credentials vs runs free
| Thing | Runs with no creds | Needs creds/wiring |
|---|---|---|
| Reasoning-playbook skills/agents | ✅ | — |
| BUILT MCP servers (engine) | ✅ (simulated) | FRED real path: `FRED_API_KEY` (optional) |
| ENV connectors | — | your own auth |
| CUSTOM connectors (brokers/data) | — | implement + creds (SPECs) |
| Live execution (VT/IG/MetaApi) | paper ✅ | broker keys (trade-only, least-privilege) |
