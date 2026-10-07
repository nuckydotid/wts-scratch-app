# Antigravity CLI (`agy`): Installation & Auth

The Antigravity CLI (`agy`) brings the full capabilities of Google Antigravity to your terminal. It is optimized for terminal power users, remote SSH environments, and automated CI/CD pipelines.

---

## 1. Quick Installation

Install `agy` using your preferred installation method:

### macOS / Linux (cURL)

```bash
curl -fsSL https://antigravity.google/install.sh | bash
```

### Homebrew (macOS / Linux)

```bash
brew tap google/antigravity
brew install agy
```

### Node.js / Bun

```bash
# Using Bun
bun add -g @google/antigravity-cli

# Using npm
npm install -g @google/antigravity-cli
```

### Windows (PowerShell)

```powershell
irm https://antigravity.google/install.ps1 | iex
```

Verify your installation:

```bash
agy --version
```

---

## 2. Authentication & Sign-in

Before running commands, authenticate `agy` with your Google account:

```bash
# Standard browser-based OAuth authentication
agy auth login
```

### Headless / SSH Authentication

If you are on a remote server without a web browser:

```bash
agy auth login --headless
```

Follow the URL on your local computer, approve permissions, and paste the authorization token back into your terminal.

### Using Google Cloud / Vertex AI API Keys

For automated CI/CD pipelines or enterprise accounts:

```bash
export ANTIGRAVITY_API_KEY="your-gemini-api-key"
# Or use Google Application Default Credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

---

## 3. Migrating from Gemini CLI (`gcli`)

If you previously used `gcli` (Gemini CLI), `agy` is a full drop-in replacement with major architectural improvements:

| Feature              | Legacy `gcli`           | Antigravity CLI (`agy`)                            |
| :------------------- | :---------------------- | :------------------------------------------------- |
| **Command binary**   | `gcli`                  | `agy` (with alias `antigravity`)                   |
| **Execution Engine** | Single-turn synchronous | Multi-turn planning, subagents & background tasks  |
| **Artifacts**        | Plain text stdout       | Markdown artifacts, interactive TUI, diff reviews  |
| **Customizations**   | Basic prompt templates  | Full MCP, Skills, Rules, Hooks, Plugins & Sidecars |
| **Editor Mode**      | Emacs line editor       | Full modal Vim editor + Emacs modes                |

To migrate aliases in your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
alias gcli="agy"
```
