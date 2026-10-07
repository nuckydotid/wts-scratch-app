# Configuration & Vim Editor Mode

Customize your Antigravity CLI environment with `settings.json`, custom keybindings, and full modal Vim editing capabilities.

---

## 1. CLI Settings Configuration (`settings.json`)

Location: `~/.gemini/antigravity/settings.json`

```json
{
  "model": "gemini-3.7-flash",
  "editorMode": "vim",
  "theme": "dark",
  "planningMode": "auto",
  "autoApprove": {
    "readTools": true,
    "safeCommands": true
  },
  "keybindings": {
    "submit": "Enter",
    "newline": "Shift-Enter",
    "cancel": "Ctrl-C",
    "openPlan": "Ctrl-P",
    "toggleDiff": "Ctrl-D"
  }
}
```

---

## 2. Modal Vim Editor Mode

`agy` includes a full Vim modal editing engine for inputting prompts, editing multi-line queries, and modifying code blocks directly in the terminal.

### Switching Modes

- **`i` / `a`**: Enter **Insert Mode**.
- **`Esc` / `Ctrl-[`**: Return to **Normal Mode**.
- **`v` / `V`**: Enter **Visual / Visual-Line Mode**.

### Supported Normal Mode Commands

| Command               | Action                                           |
| :-------------------- | :----------------------------------------------- |
| `h` / `j` / `k` / `l` | Move cursor Left / Down / Up / Right             |
| `w` / `b` / `e`       | Word navigation (forward, backward, end-of-word) |
| `0` / `$`             | Jump to beginning / end of current line          |
| `gg` / `G`            | Jump to beginning / end of prompt buffer         |
| `dd` / `D`            | Delete line / Delete to end of line              |
| `yy` / `p`            | Yank (copy) line / Paste from clipboard          |
| `u` / `Ctrl-r`        | Undo / Redo                                      |
| `ciw` / `caw`         | Change inside word / Change around word          |
| `/pattern`            | Search within prompt buffer                      |
