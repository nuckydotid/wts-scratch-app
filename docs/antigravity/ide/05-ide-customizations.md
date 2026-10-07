# IDE Customizations & Settings

Configure IDE-specific preferences, keybindings, rules, and MCP integrations within your editor.

---

## 1. IDE Configuration (`settings.json`)

Configure IDE settings under `.vscode/settings.json` or `~/.gemini/antigravity/settings.json`:

```json
{
  "antigravity.model": "gemini-3.7-flash",
  "antigravity.supercomplete.enabled": true,
  "antigravity.tabToJump.enabled": true,
  "antigravity.chatPanel.position": "right",
  "antigravity.autoApprove.readOperations": true,
  "antigravity.telemetry": false
}
```

---

## 2. Custom Keybindings Reference

| Action                              | macOS Shortcut    | Windows / Linux Shortcut |
| :---------------------------------- | :---------------- | :----------------------- |
| **Open Agent Side Panel**           | `Cmd + Shift + A` | `Ctrl + Shift + A`       |
| **Accept Supercomplete Suggestion** | `Tab`             | `Tab`                    |
| **Reject Suggestion**               | `Esc`             | `Esc`                    |
| **Open Implementation Plan**        | `Cmd + Shift + P` | `Ctrl + Shift + P`       |
| **Accept All Pending Diffs**        | `Cmd + Shift + Y` | `Ctrl + Shift + Y`       |
| **Toggle Voice Input**              | `Cmd + Shift + V` | `Ctrl + Shift + V`       |
