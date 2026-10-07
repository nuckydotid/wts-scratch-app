# Antigravity CLI Reference & Troubleshooting

Comprehensive flags reference, environment variables, exit codes, and diagnostic troubleshooting for `agy`.

---

## 1. CLI Command-Line Flags

```text
Usage: agy [OPTIONS] [PROMPT]

Arguments:
  [PROMPT]                  Optional instruction to start execution immediately.

Options:
  -d, --dir <PATH>          Set working directory (default: current directory).
  -m, --model <MODEL>       Select reasoning model (gemini-3.7-flash, gemini-3.1-pro).
  -h, --headless            Run in non-interactive headless mode.
  -p, --print               Output response to stdout and exit.
  -r, --resume [ID]         Resume previous conversation session.
  --sandbox                 Execute in isolated overlay sandbox.
  --auto-approve            Automatically approve safe tool and command executions.
  --json                    Output structured JSON for programmatic consumption.
  -v, --verbose             Enable debug logging.
  --version                 Print version information.
  --help                    Show help menu.
```

---

## 2. Environment Variables

| Variable                 | Description                                            | Default                  |
| :----------------------- | :----------------------------------------------------- | :----------------------- |
| `ANTIGRAVITY_API_KEY`    | Gemini API key for direct authentication.              | `None`                   |
| `ANTIGRAVITY_MODEL`      | Default model identifier.                              | `gemini-3.7-flash`       |
| `ANTIGRAVITY_CONFIG_DIR` | Custom directory for config & cache.                   | `~/.gemini/antigravity/` |
| `ANTIGRAVITY_LOG_LEVEL`  | Log level (`trace`, `debug`, `info`, `warn`, `error`). | `info`                   |
| `PAGER`                  | Terminal pager for viewing long diffs.                 | `cat`                    |

---

## 3. Exit Codes

- `0` — Success (task completed / plan executed successfully).
- `1` — General execution error / unhandled exception.
- `2` — Syntax error in flags or arguments.
- `130` — Terminated by user (`SIGINT` / `Ctrl-C`).
