# TUI, CLI, Models/Providers, Themes, Keybinds

> Upstream: [TUI](https://opencode.ai/docs/tui/), [CLI](https://opencode.ai/docs/cli/), [Models](https://opencode.ai/docs/models/), [Providers](https://opencode.ai/docs/providers/), [Themes](https://opencode.ai/docs/themes/), [Keybinds](https://opencode.ai/docs/keybinds/).

## TUI (`opencode [project]`)

Prompt + `@file` fuzzy ref + `!cmd` shell-attach. Slash commands (most `ctrl+x` leader):

`/connect` (add provider) · `/models` (`<leader>m`) · `/init` (AGENTS.md) · `/new|/clear` (`<leader>n`) · `/sessions|/resume` (`<leader>l`) · `/compact|/summarize` (`<leader>c`) · `/undo` (`<leader>u`, git-backed, needs repo) · `/redo` (`<leader>r`) · `/editor` (`<leader>e`, `$EDITOR`) · `/export` (`<leader>x`) · `/share|/unshare` · `/themes` (`<leader>t`) · `/thinking` (display only; `ctrl+t` cycles variant/reasoning) · `/details` · `/help` · `/exit|/quit` (`<leader>q`).

`EDITOR`: `export EDITOR="code --wait"` (GUI needs `--wait`), `nvim|vim|nano|notepad|subl`. Persist in `~/.zshrc`.

`tui.json` (global `~/.config/opencode/tui.json`, project `./tui.json`, override `OPENCODE_TUI_CONFIG`): `theme`, `keybinds` (merged), `leader_timeout` (2000), `scroll_speed` (3, ignored if `scroll_acceleration.enabled`), `diff_style` (`auto|stacked`), `cursor` (`block|underline|line|default` + `blinking`), `mouse` (false = native select/scroll), `attention` (`enabled` default false; `notifications/sound/volume/sound_pack/sounds.{default,question,permission,error,done,subagent_done}`). Username toggle via palette `ctrl+p`.

## CLI (scripting/automation)

```zsh
opencode                                    # TUI
opencode run "Explain closures in JS"       # non-interactive
opencode run -c -m anthropic/claude-sonnet-4-5 -a build -f src/a.ts --format json --auto "Refactor"
opencode serve --port 4096                  # headless API (OPENCODE_SERVER_PASSWORD, user opencode)
opencode web --port 4096 --hostname 0.0.0.0 # + browser UI
opencode attach http://10.20.30.40:4096     # TUI on remote backend
opencode auth login [-p provider] | opencode auth list | opencode auth logout
opencode models [provider] [--refresh --verbose]
opencode agent create | opencode agent list
opencode mcp add | opencode mcp list | opencode mcp auth <n> | opencode mcp logout <n> | opencode mcp debug <n>
opencode session list [-n 20] | opencode session delete <id>
opencode stats [--days N --models] | opencode export [id] | opencode import <file|https://opncd.ai/s/...>
opencode pr <number> | opencode db path | opencode debug config | opencode plugin <module> [-g] | opencode upgrade
```

Global flags: `-h/--help`, `-v/--version`, `--print-logs`, `--log-level DEBUG|INFO|WARN|ERROR`, `--pure`. TUI flags: `-c/--continue`, `-s/--session`, `--fork`, `--prompt`, `-m/--model provider/model`, `--agent`, `--auto`, `--port/--hostname/--mdns/--cors`. Key env: `OPENCODE_CONFIG|_DIR|_CONTENT`, `OPENCODE_TUI_CONFIG`, `OPENCODE_PERMISSION`, `OPENCODE_SERVER_PASSWORD|_USERNAME`, `OPENCODE_DISABLE_AUTOUPDATE|_LSP_DOWNLOAD|_CLAUDE_CODE*|_AUTOCOMPACT|_MOUSE`, `OPENCODE_ENABLE_EXA|_PARALLEL` (websearch), `OPENCODE_EXPERIMENTAL_LSP_TOOL`, `OPENCODE_PURE`.

## Models / Providers (75+ via AI SDK + Models.dev)

Flow: `/connect` → keys in `~/.local/share/opencode/auth.json` (or env/`.env`) → `/models` → set `model: "provider/model-id"` + `small_model` (titles/light tasks). Recommended coders: GPT 5.2 / 5.1-Codex, Claude Opus/Sonnet 4.5, Minimax M2.1, Gemini 3 Pro. Loading order: `--model` flag > config `model` > last-used > internal priority.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "provider": {
    "anthropic": {
      "options": { "timeout": 600000, "chunkTimeout": 30000 },
      "whitelist": ["claude-sonnet-4-5-20250929"],
    },
  },
  "disabled_providers": ["openai"],
  "enabled_providers": ["anthropic"],
}
```

Zen (recommended start): `/connect` → OpenCode Zen → `opencode.ai/auth` → paste key → `opencode/gpt-5.1-codex`. Local: Ollama/LM Studio/llama.cpp via `npm: @ai-sdk/openai-compatible` + `baseURL` (`http://localhost:11434/v1`, `:1234/v1`, `:8080/v1`) + `models: {id: {name, limit:{context,output}}}`. Variants: built-in `high/max` (Anthropic), `none/minimal/low/medium/high/xhigh` (OpenAI), `low/high` (Google); custom `provider.<p>.models.<m>.variants.{name: {reasoningEffort,...}}`, cycle `variant_cycle` (`ctrl+t`).

## Themes

Need `COLORTERM=truecolor` (`echo $COLORTERM`). Built-ins: `system` (ANSI + terminal bg — best for custom terms), `opencode` (default), `tokyonight`, `everforest`, `ayu`, `catppuccin(-macchiato)`, `gruvbox`, `kanagawa`, `nord`, `matrix`, `one-dark`. Set: `/themes` or `tui.json → theme`. Custom: `~/.config/opencode/themes/*.json` (global, lower) → `.opencode/themes/*.json` (project, wins); hex/ANSI 0-255/ref/dark-light/`none`; `$schema: https://opencode.ai/theme.json`.

## Keybinds (`tui.json → keybinds`, merged; `"none"|false` disables)

Leader default `ctrl+x` (`leader_timeout` 2000). Mac edit: `input_undo: ctrl+-,super+z`, `terminal_suspend: ctrl+z` (Win: `ctrl+z` moves to undo, suspend forced `none`). Keep `leader: ctrl+x`, `command_list: ctrl+p`, `agent_cycle: tab`, `variant_cycle: ctrl+t`, `session_new <leader>n`, `session_list <leader>l`, `model_list <leader>m`, `session_compact <leader>c`, `messages_copy <leader>y`, `messages_undo <leader>u`. Multi: `"ctrl+c,ctrl+d,<leader>q"` or array; advanced `{key, preventDefault, fallthrough}`. Desktop prompt: readline `ctrl+a/e/b/f`, `alt+b/f`, `ctrl+k/u/w`, `ctrl+d`. `Shift+Enter` may need terminal remap (Windows Terminal `sendInput \u001b[13;2u`).
