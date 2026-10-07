# IDE on MacBook (VS Code / Cursor / Windsurf)

> Upstream: [IDE](https://opencode.ai/docs/ide/), [TUI #editor-setup](https://opencode.ai/docs/tui/#editor-setup). Extension installs automatically when you run `opencode` in the IDE integrated terminal.

## Install

1. Open VS Code (or Cursor / Windsurf / VSCodium / Zed).
2. Open integrated terminal, run:
   ```zsh
   opencode .
   ```
3. Or manual: Extension Marketplace → search **OpenCode** → Install.

### Troubleshooting (this MacBook hit this)

- `code` / `cursor` **not on PATH** (verified `which code cursor` → not found). Fix:
  - VS Code: `Cmd+Shift+P` → `Shell Command: Install 'code' command in PATH`.
  - Cursor: `Cmd+Shift+P` → `Shell Command: Install 'cursor' command in PATH`.
  - Windsurf: equivalent `windsurf` command; VSCodium: `codium`.
- Extension still fails: confirm you launched `opencode` from the **integrated** terminal (not iTerm/Ghostty), and VS Code has permission to install extensions.
- `/editor` and `/export` need a blocking editor:
  ```zsh
  export EDITOR="code --wait"   # Cursor: "cursor --wait", nvim/vim/nano work without --wait
  ```
  Persist in `~/.zshrc` (this machine shell is `/bin/zsh`).

## Mac keybindings

| Action                              | Mac             | Win/Linux        |
| :---------------------------------- | :-------------- | :--------------- |
| Quick launch / focus split terminal | `Cmd+Esc`       | `Ctrl+Esc`       |
| New session (even if one open)      | `Cmd+Shift+Esc` | `Ctrl+Shift+Esc` |
| Insert `@File#L37-42` reference     | `Cmd+Option+K`  | `Alt+Ctrl+K`     |

Plus TUI leader defaults (`ctrl+x` + key): `n` new, `l` sessions, `m` models, `t` themes, `u` undo, `r` redo, `c` compact, `e` editor, `x` export. Full table: [tui-cli-models.md](tui-cli-models.md).

## Context awareness

- Current selection / active tab is shared with opencode automatically.
- In prompts use `@path/to/file` fuzzy search, `@alias/` for configured [references](https://opencode.ai/docs/references/) (e.g. `@docs/README.md`). File content is injected automatically.
- Prefix with `!` to run a shell command and attach output: `!bun --filter './apps/*' typecheck`.

## Terminal truecolor (required for themes)

```zsh
echo $COLORTERM   # want truecolor or 24bit
# if empty (as on this machine), add to ~/.zshrc:
export COLORTERM=truecolor
```

iTerm2 / Kitty / Alacritty / Windows Terminal / recent GNOME Terminal all support 24-bit. Without it themes fall back to 256-color approximation. Theme pick: `/themes` or `tui.json → theme: system|tokyonight|catppuccin|...` (see [tui-cli-models.md](tui-cli-models.md)).
